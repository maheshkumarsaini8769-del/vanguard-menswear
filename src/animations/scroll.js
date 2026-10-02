import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export let lenisInstance = null;

export function initSmoothScrollAndAnimations() {
  // Prevent browser from restoring scroll to arbitrary mid-page position on refresh
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // 1. Initialize Lenis Smooth Scrolling
  lenisInstance = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 1.0
  });

  lenisInstance.scrollTo(0, { immediate: true });

  lenisInstance.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenisInstance.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // 2. Cinematic Hero Scroll Zoom Timeline
  initHeroZoomTimeline();

  // 3. Horizontal Lookbook Scroll Scrub
  initHorizontalLookbook();

  // 4. Parallax Image Zoom Scrubbers
  initParallaxZoomSections();

  // 5. Scroll Reveals for Typography and Cards
  initScrollReveals();

  // Recalibrate ScrollTrigger positions once media loads
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 350);
}

/**
 * Hero Pin & Zoom-Scrub Animation
 */
function initHeroZoomTimeline() {
  const heroSection = document.querySelector('#hero-section');
  const heroMedia = document.querySelector('#hero-media');
  const heroImage = document.querySelector('#hero-image');
  const heroTitleTop = document.querySelector('#hero-title-top');
  const heroTitleBottom = document.querySelector('#hero-title-bottom');
  const heroBadges = document.querySelectorAll('.hero-floating-badge');
  const heroStats = document.querySelector('#hero-stats');

  if (!heroSection || !heroImage) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: heroSection,
      start: 'top top',
      end: '+=100%',
      pin: true,
      scrub: 1
    }
  });

  tl.to(heroImage, {
    scale: 1.35,
    yPercent: -5,
    ease: 'none'
  }, 0);

  if (heroMedia) {
    tl.to(heroMedia, {
      borderRadius: '16px',
      scale: 0.96,
      ease: 'power2.inOut'
    }, 0);
  }

  if (heroTitleTop) {
    tl.to(heroTitleTop, {
      xPercent: -15,
      opacity: 0.7,
      ease: 'none'
    }, 0);
  }

  if (heroTitleBottom) {
    tl.to(heroTitleBottom, {
      xPercent: 15,
      opacity: 0.7,
      ease: 'none'
    }, 0);
  }

  if (heroBadges.length > 0) {
    tl.to(heroBadges, {
      y: -30,
      opacity: 0.5,
      stagger: 0.05,
      ease: 'power1.out'
    }, 0);
  }

  if (heroStats) {
    tl.to(heroStats, {
      y: 20,
      opacity: 0.6,
      ease: 'power1.out'
    }, 0);
  }
}

/**
 * Horizontal Lookbook with Scroll Scrubbing
 */
function initHorizontalLookbook() {
  const container = document.querySelector('#lookbook-pin-container');
  const track = document.querySelector('#lookbook-track');
  const cards = document.querySelectorAll('.lookbook-card');

  if (!container || !track || cards.length === 0) return;

  const getScrollAmount = () => {
    return track.scrollWidth - window.innerWidth + 100;
  };

  const horizontalTl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: () => `+=${getScrollAmount() * 1.1}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true
    }
  });

  horizontalTl.to(track, {
    x: () => -getScrollAmount(),
    ease: 'none'
  });

  cards.forEach((card) => {
    const cardImg = card.querySelector('.lookbook-card-img');
    if (!cardImg) return;

    gsap.fromTo(
      cardImg,
      { scale: 1.15 },
      {
        scale: 1.0,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          containerAnimation: horizontalTl,
          start: 'left right',
          end: 'right left',
          scrub: true
        }
      }
    );
  });
}

/**
 * Parallax Scroll-Driven Image Zoom Scrub
 */
function initParallaxZoomSections() {
  document.querySelectorAll('[data-scroll-zoom]').forEach((el) => {
    const img = el.querySelector('img') || el;
    gsap.fromTo(
      img,
      { scale: 1.2, yPercent: -4 },
      {
        scale: 1.0,
        yPercent: 4,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2
        }
      }
    );
  });

  document.querySelectorAll('[data-scroll-zoom-out]').forEach((el) => {
    const img = el.querySelector('img') || el;
    gsap.fromTo(
      img,
      { scale: 1.0 },
      {
        scale: 1.2,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      }
    );
  });
}

/**
 * Reveal Animations with Guaranteed Visibility
 */
function initScrollReveals() {
  document.querySelectorAll('.reveal-fade-up').forEach((el) => {
    gsap.from(el, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 92%',
        toggleActions: 'play none none none'
      }
    });
  });
}
