window.addEventListener('load', () => {
  const POLL_INTERVAL_MS = 300;

  // Load keywords first
  fetch(chrome.runtime.getURL('keywords.txt'))
    .then(response => response.text())
    .then(text => {
      const unwantedKeywords = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      console.log('[TUM-Moodle Extension] Loaded keywords:', unwantedKeywords);

      // Now start polling
      startPolling(unwantedKeywords);
    })
    .catch(error => {
      console.error('[TUM-Moodle Extension] Failed to load keywords.txt:', error);
    });

  function startPolling(unwantedKeywords) {
    const poll = setInterval(() => {
      const termSelect = document.getElementById('coc-filterterm');

      if (termSelect?.options.length >= 2) {
        clearInterval(poll);
        observeCourseBoxes(unwantedKeywords);
      }
    }, POLL_INTERVAL_MS);
  }

  function observeCourseBoxes(unwantedKeywords) {
    const container = document.querySelector('#page-dashboard') || document.body;

    const observer = new MutationObserver((mutations, obs) => {
      const boxes = document.querySelectorAll('div.coursebox');
      if (boxes.length > 0) {
        console.log(`[TUM-Moodle Extension] Found ${boxes.length} course boxes. Hiding unwanted...`);
        hideUnwantedCourses(boxes, unwantedKeywords);
        obs.disconnect();
      }
    });

    observer.observe(container, { childList: true, subtree: true });
  }

  function hideUnwantedCourses(courseBoxes, unwantedKeywords) {
    courseBoxes.forEach(box => {
      const link = box.querySelector('h3 > a');
      if (link) {
        const text = link.textContent.trim();
        console.log(`[TUM-Moodle Extension] Checking course: "${text}"`);
        const isUnwanted = unwantedKeywords.some(keyword =>
          text.toLowerCase().includes(keyword.toLowerCase())
        );

        if (isUnwanted) {
          console.log(`[TUM-Moodle Extension] Hiding course: "${text}"`);
          box.style.display = 'none';
        }
      }
    });
  }
});
