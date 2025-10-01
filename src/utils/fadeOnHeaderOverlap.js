// Fade out only the overlapping part of any element that enters the header region while scrolling
export function fadeOnHeaderOverlap(headerSelector = '.nav', fadeClass = 'fade-out-on-header', headerHeight = 30) {
  function getHeaderRect() {
    const header = document.querySelector(headerSelector);
    if (!header) return { top: 0, bottom: headerHeight };
    return header.getBoundingClientRect();
  }

  function checkOverlap() {
    const rectH = getHeaderRect();
    document.querySelectorAll('body *:not(' + headerSelector + '):not(' + headerSelector + ' *)').forEach(el => {
      if (!el.offsetParent) return;
      // Do not fade header or its children
      if (el.closest(headerSelector)) {
        el.style.webkitMaskImage = '';
        el.style.maskImage = '';
        return;
      }
      const rect = el.getBoundingClientRect();
      // If any part of the element is under the header region
      if (rect.top < rectH.bottom && rect.bottom > rectH.top) {
        // Calculate overlap amount
        const overlap = Math.min(rectH.bottom, rect.bottom) - Math.max(rectH.top, rect.top);
        const percent = Math.max(0, Math.min(1, overlap / (rect.bottom - rect.top)));
        // Decrease blur/fade height: use a smaller gradient region
        el.style.webkitMaskImage = `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.25) ${percent*80}%, rgba(0,0,0,1) ${percent*80+6}%)`;
        el.style.maskImage = `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.25) ${percent*80}%, rgba(0,0,0,1) ${percent*80+6}%)`;
        el.style.transition = 'webkit-mask-image 0.7s, mask-image 0.7s';
      } else {
        el.style.webkitMaskImage = '';
        el.style.maskImage = '';
      }
    });
  }

  window.addEventListener('scroll', checkOverlap, { passive: true });
  window.addEventListener('resize', checkOverlap);
  document.addEventListener('DOMContentLoaded', checkOverlap);
  // Re-check after React renders (periodic for 2s)
  let count = 0;
  const interval = setInterval(() => {
    checkOverlap();
    count++;
    if (count > 20) clearInterval(interval);
  }, 100);
}
