if (!customElements.get('video-feed')) {
  customElements.define(
    'video-feed',
    class VideoFeed extends HTMLElement {
      connectedCallback() {
        this.track = this.querySelector('.video-feed__track');
        this.prevButton = this.querySelector('.video-feed__arrow--prev');
        this.nextButton = this.querySelector('.video-feed__arrow--next');
        this.videos = Array.from(this.querySelectorAll('video'));

        this.prevButton.addEventListener('click', () => this.scrollByPage(-1));
        this.nextButton.addEventListener('click', () => this.scrollByPage(1));
        this.onScroll = () => this.updateArrows();
        this.track.addEventListener('scroll', this.onScroll, { passive: true });
        this.resizeObserver = new ResizeObserver(() => this.updateArrows());
        this.resizeObserver.observe(this.track);
        this.updateArrows();

        // Only play videos that are on screen, and none when the visitor prefers reduced motion.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        this.videoObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const video = entry.target;
              if (entry.isIntersecting) {
                video.play().catch(() => {});
              } else {
                video.pause();
              }
            });
          },
          { threshold: 0.25 }
        );
        this.videos.forEach((video) => {
          video.muted = true;
          this.videoObserver.observe(video);
        });
      }

      disconnectedCallback() {
        this.track?.removeEventListener('scroll', this.onScroll);
        this.resizeObserver?.disconnect();
        this.videoObserver?.disconnect();
      }

      scrollByPage(direction) {
        this.track.scrollBy({ left: direction * this.track.clientWidth * 0.8, behavior: 'smooth' });
      }

      updateArrows() {
        const maxScroll = this.track.scrollWidth - this.track.clientWidth;
        this.prevButton.hidden = this.track.scrollLeft <= 1;
        this.nextButton.hidden = this.track.scrollLeft >= maxScroll - 1;
      }
    }
  );
}
