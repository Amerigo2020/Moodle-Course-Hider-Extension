/**
 * TUM Moodle Course Hider Extension
 * Automatically hides unwanted courses based on keywords
 */

(function() {
  'use strict';

  // Configuration constants
  const CONFIG = {
    POLL_INTERVAL_MS: 500,
    MAX_POLL_ATTEMPTS: 60, // 30 seconds max
    FETCH_TIMEOUT_MS: 5000,
    DEBOUNCE_DELAY_MS: 250,
    // Default semester to auto-select (change value as needed):
    // '2025-1' = SoSe 2025, '2024-2' = WiSe 2024/2025, '2024-1' = SoSe 2024, etc.
    DEFAULT_SEMESTER: '2025-1', // SoSe 2025
    SELECTORS: {
      TERM_SELECT: '#coc-filterterm',
      DASHBOARD: '#page-dashboard',
      COURSE_BOX: 'div.coursebox',
      COURSE_LINK: 'h3 > a, .coursename > a'
    }
  };

  let state = {
    isInitialized: false,
    observer: null,
    pollInterval: null,
    pollAttempts: 0,
    unwantedKeywords: []
  };

  /**
   * Initialize the extension
   */
  function init() {
    if (state.isInitialized) {
      console.warn('[Moodle Course Hider] Already initialized');
      return;
    }

    console.log('[Moodle Course Hider] Initializing...');
    loadKeywords()
      .then(keywords => {
        state.unwantedKeywords = keywords;
        state.isInitialized = true;
        startPolling();
      })
      .catch(error => {
        console.error('[Moodle Course Hider] Initialization failed:', error);
      });
  }

  /**
   * Set the default semester selection to SoSe 2025
   */
  function setDefaultSemester() {
    const termSelect = document.querySelector(CONFIG.SELECTORS.TERM_SELECT);
    
    if (!termSelect) {
      console.warn('[Moodle Course Hider] Term selector not found');
      return false;
    }

    // Check if the desired option exists
    const targetOption = termSelect.querySelector(`option[value="${CONFIG.DEFAULT_SEMESTER}"]`);
    if (!targetOption) {
      console.warn(`[Moodle Course Hider] Option for ${CONFIG.DEFAULT_SEMESTER} not found`);
      return false;
    }

    // Only change if not already selected
    if (termSelect.value !== CONFIG.DEFAULT_SEMESTER) {
      console.log(`[Moodle Course Hider] Setting semester to: ${targetOption.textContent}`);
      
      // Clear current selection
      termSelect.querySelectorAll('option').forEach(option => {
        option.removeAttribute('selected');
      });
      
      // Set new selection
      targetOption.setAttribute('selected', 'selected');
      termSelect.value = CONFIG.DEFAULT_SEMESTER;
      
      // Trigger change event to notify Moodle's JavaScript
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      termSelect.dispatchEvent(changeEvent);
      
      console.log('[Moodle Course Hider] Semester selection updated successfully');
      return true;
    }
    
    return false;
  }

  /**
   * Load keywords from file with timeout and validation
   * @returns {Promise<string[]>} Array of keywords
   */
  async function loadKeywords() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);

      const response = await fetch(chrome.runtime.getURL('keywords.txt'), {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      const keywords = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'))
        .map(keyword => keyword.toLowerCase());

      if (keywords.length === 0) {
        console.warn('[Moodle Course Hider] No valid keywords found');
      } else {
        console.log(`[Moodle Course Hider] Loaded ${keywords.length} keywords`);
      }

      return keywords;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Keywords loading timed out');
      }
      throw error;
    }
  }

  /**
   * Start polling for page readiness with safety limits
   */
  function startPolling() {
    if (state.pollInterval) {
      clearInterval(state.pollInterval);
    }

    state.pollAttempts = 0;
    state.pollInterval = setInterval(() => {
      state.pollAttempts++;

      const termSelect = document.querySelector(CONFIG.SELECTORS.TERM_SELECT);
      const hasCourses = document.querySelectorAll(CONFIG.SELECTORS.COURSE_BOX).length > 0;

      // Try to set default semester if selector is available
      if (termSelect?.options?.length >= 2) {
        setDefaultSemester();
      }

      if ((termSelect?.options?.length >= 2) || hasCourses || state.pollAttempts >= CONFIG.MAX_POLL_ATTEMPTS) {
        clearInterval(state.pollInterval);
        state.pollInterval = null;

        if (state.pollAttempts >= CONFIG.MAX_POLL_ATTEMPTS) {
          console.warn('[Moodle Course Hider] Polling timeout reached, starting observer anyway');
        }

        startObserving();
      }
    }, CONFIG.POLL_INTERVAL_MS);
  }

  /**
   * Start observing DOM changes with improved error handling
   */
  function startObserving() {
    if (state.observer) {
      state.observer.disconnect();
    }

    const container = document.querySelector(CONFIG.SELECTORS.DASHBOARD) || document.body;
    
    // Try to set default semester as a fallback
    setDefaultSemester();
    
    // Initial hiding attempt
    processCourseBoxes();

    // Set up observer for dynamic content
    state.observer = new MutationObserver(debounce(handleMutations, CONFIG.DEBOUNCE_DELAY_MS));
    
    try {
      state.observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: false
      });
      console.log('[Moodle Course Hider] Observer started');
    } catch (error) {
      console.error('[Moodle Course Hider] Failed to start observer:', error);
    }
  }

  /**
   * Handle DOM mutations
   * @param {MutationRecord[]} mutations 
   */
  function handleMutations(mutations) {
    let shouldProcess = false;
    let shouldCheckSemester = false;

    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check for course boxes
            if (node.matches && node.matches(CONFIG.SELECTORS.COURSE_BOX)) {
              shouldProcess = true;
            }
            if (node.querySelector && node.querySelector(CONFIG.SELECTORS.COURSE_BOX)) {
              shouldProcess = true;
            }
            
            // Check for semester selector
            if (node.matches && node.matches(CONFIG.SELECTORS.TERM_SELECT)) {
              shouldCheckSemester = true;
            }
            if (node.querySelector && node.querySelector(CONFIG.SELECTORS.TERM_SELECT)) {
              shouldCheckSemester = true;
            }
          }
        }
      }
      if (shouldProcess && shouldCheckSemester) break;
    }

    if (shouldCheckSemester) {
      // Give the browser a moment to fully render the select element
      setTimeout(() => setDefaultSemester(), 100);
    }

    if (shouldProcess) {
      processCourseBoxes();
    }
  }

  /**
   * Process and hide unwanted course boxes
   */
  function processCourseBoxes() {
    const courseBoxes = document.querySelectorAll(CONFIG.SELECTORS.COURSE_BOX);
    
    if (courseBoxes.length === 0) {
      return;
    }

    let hiddenCount = 0;
    
    courseBoxes.forEach(box => {
      if (box.style.display === 'none') {
        return; // Already hidden
      }

      const link = box.querySelector(CONFIG.SELECTORS.COURSE_LINK);
      if (!link) {
        return;
      }

      const courseTitle = sanitizeText(link.textContent || link.innerText || '');
      if (!courseTitle) {
        return;
      }

      const shouldHide = state.unwantedKeywords.some(keyword => 
        courseTitle.includes(keyword)
      );

      if (shouldHide) {
        box.style.display = 'none';
        box.setAttribute('data-hidden-by', 'moodle-course-hider');
        hiddenCount++;
      }
    });

    if (hiddenCount > 0) {
      console.log(`[Moodle Course Hider] Hidden ${hiddenCount} courses`);
    }
  }

  /**
   * Sanitize and normalize text for comparison
   * @param {string} text 
   * @returns {string}
   */
  function sanitizeText(text) {
    return text.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  /**
   * Debounce function to limit rapid function calls
   * @param {Function} func 
   * @param {number} delay 
   * @returns {Function}
   */
  function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Cleanup function for extension teardown
   */
  function cleanup() {
    if (state.pollInterval) {
      clearInterval(state.pollInterval);
      state.pollInterval = null;
    }
    
    if (state.observer) {
      state.observer.disconnect();
      state.observer = null;
    }
    
    state.isInitialized = false;
    console.log('[Moodle Course Hider] Cleaned up');
  }

  // Handle page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cleanup();
    } else if (!state.isInitialized) {
      setTimeout(init, 1000); // Delay restart
    }
  });

  // Handle page unload
  window.addEventListener('beforeunload', cleanup);

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
