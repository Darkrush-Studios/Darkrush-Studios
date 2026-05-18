<script>
  const scrollContainer = document.querySelector('.partners-scroll-container');
  let scrollAmount = 0;
  const scrollStep = 1; // pixels per frame
  const scrollDelay = 10; // ms between frames

  function autoScroll() {
    scrollAmount += scrollStep;
    if (scrollAmount >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
      scrollAmount = 0; // reset to start for infinite scroll
    }
    scrollContainer.scrollLeft = scrollAmount;
    requestAnimationFrame(autoScroll);
  }

  // Start scrolling after page load
  window.addEventListener('load', () => {
    requestAnimationFrame(autoScroll);
  });
</script>

