import { useEffect, useRef, useState } from 'react';

const carouselSlides = Object.entries(
  import.meta.glob('../assets/carousel/*.{png,jpg,jpeg,webp,avif}', {
    eager: true,
    import: 'default'
  })
)
  .sort(([leftPath], [rightPath]) =>
    leftPath.localeCompare(rightPath, undefined, { numeric: true })
  )
  .map(([, src], index) => ({
    src,
    alt: `Wedding gallery image ${index + 1}`
  }));

const AUTO_SCROLL_SPEED = 30;
const MIN_AUTO_SCROLL_SPEED = 18;
const MAX_RELEASE_VELOCITY = 1100;
const RETURN_TO_BASE_MS = 1400;
const GROUP_COPIES = 3;
const PAGE_SCROLL_RATIO = 0.45;
const PAGE_SCROLL_VELOCITY_BOOST = 0.9;

function clampVelocity(value) {
  return Math.max(-MAX_RELEASE_VELOCITY, Math.min(MAX_RELEASE_VELOCITY, value));
}

function normalizePosition(position, groupWidth) {
  if (!groupWidth) {
    return 0;
  }

  return ((position % groupWidth) + groupWidth) % groupWidth;
}

function syncScrollPosition(scroller, groupWidth, position) {
  if (!scroller || !groupWidth) {
    return;
  }

  scroller.scrollLeft = groupWidth + normalizePosition(position, groupWidth);
}

function applyPositionDelta(scroller, groupWidth, positionRef, delta) {
  if (!scroller || !groupWidth) {
    return;
  }

  positionRef.current += delta;
  syncScrollPosition(scroller, groupWidth, positionRef.current);
}

export default function LandingCarousel() {
  const sectionRef = useRef(null);
  const scrollerRef = useRef(null);
  const middleGroupRef = useRef(null);
  const frameRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const lastWindowScrollYRef = useRef(0);
  const groupWidthRef = useRef(0);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const initializedRef = useRef(false);
  const pointerStateRef = useRef({
    active: false,
    id: null,
    x: 0,
    t: 0,
    velocity: 0
  });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => {
      reducedMotionRef.current = mediaQuery.matches;

      if (mediaQuery.matches) {
        velocityRef.current = 0;
      }
    };

    syncPreference();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncPreference);
    } else {
      mediaQuery.addListener(syncPreference);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', syncPreference);
      } else {
        mediaQuery.removeListener(syncPreference);
      }
    };
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const middleGroup = middleGroupRef.current;

    if (!scroller || !middleGroup) {
      return undefined;
    }

    const syncMeasurements = () => {
      const nextWidth = middleGroup.getBoundingClientRect().width;

      if (!nextWidth) {
        return;
      }

      const previousWidth = groupWidthRef.current;
      const previousPosition = previousWidth
        ? normalizePosition(positionRef.current, previousWidth)
        : 0;

      groupWidthRef.current = nextWidth;

      if (!initializedRef.current) {
        positionRef.current = 0;
        syncScrollPosition(scroller, nextWidth, positionRef.current);
        initializedRef.current = true;
        return;
      }

      if (previousWidth && Math.abs(previousWidth - nextWidth) > 1) {
        positionRef.current = (previousPosition / previousWidth) * nextWidth;
      }

      syncScrollPosition(scroller, nextWidth, positionRef.current);
    };

    syncMeasurements();

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(syncMeasurements);
      resizeObserver.observe(middleGroup);

      return () => {
        resizeObserver.disconnect();
      };
    }

    window.addEventListener('resize', syncMeasurements);

    return () => {
      window.removeEventListener('resize', syncMeasurements);
    };
  }, []);

  useEffect(() => {
    // The landing page is a fixed-height pager (`.landing-page` scrolls, not
    // the window), so scroll-linked drift listens to the pager element.
    const pager = sectionRef.current?.closest('.landing-page');
    const scrollTarget = pager || window;
    const readScroll = () => (pager ? pager.scrollTop : window.scrollY);

    const handlePageScroll = () => {
      const section = sectionRef.current;
      const nextScrollY = readScroll();
      const deltaY = nextScrollY - lastWindowScrollYRef.current;

      lastWindowScrollYRef.current = nextScrollY;

      if (!section || !deltaY || reducedMotionRef.current || pointerStateRef.current.active) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const visibleHeight =
        Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);

      if (visibleHeight <= 0) {
        return;
      }

      const visibility = visibleHeight / Math.min(rect.height, window.innerHeight);
      const linkedVelocity = Math.abs(deltaY) * visibility * PAGE_SCROLL_RATIO;

      velocityRef.current = clampVelocity(
        velocityRef.current + linkedVelocity * PAGE_SCROLL_VELOCITY_BOOST
      );
    };

    lastWindowScrollYRef.current = readScroll();
    scrollTarget.addEventListener('scroll', handlePageScroll, { passive: true });

    return () => {
      scrollTarget.removeEventListener('scroll', handlePageScroll);
    };
  }, []);

  useEffect(() => {
    const tick = (time) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = time;
      }

      const deltaMs = Math.min(time - lastFrameTimeRef.current, 48);
      lastFrameTimeRef.current = time;

      if (!pointerStateRef.current.active) {
        const targetVelocity = 0;
        const easing = 1 - Math.exp(-deltaMs / RETURN_TO_BASE_MS);

        velocityRef.current += (targetVelocity - velocityRef.current) * easing;

        const totalVelocity = reducedMotionRef.current
          ? 0
          : Math.max(MIN_AUTO_SCROLL_SPEED, AUTO_SCROLL_SPEED + velocityRef.current);

        if (Math.abs(totalVelocity) > 0.02) {
          applyPositionDelta(
            scrollerRef.current,
            groupWidthRef.current,
            positionRef,
            (totalVelocity * deltaMs) / 1000
          );
        }
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }

      lastFrameTimeRef.current = 0;
    };
  }, []);

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    pointerStateRef.current = {
      active: true,
      id: event.pointerId,
      x: event.clientX,
      t: event.timeStamp,
      velocity: 0
    };

    velocityRef.current = 0;
    lastFrameTimeRef.current = 0;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const pointerState = pointerStateRef.current;

    if (!pointerState.active || pointerState.id !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - pointerState.x;
    const deltaMs = Math.max(event.timeStamp - pointerState.t, 16);

    applyPositionDelta(scrollerRef.current, groupWidthRef.current, positionRef, -deltaX);

    pointerState.velocity = clampVelocity(
      pointerState.velocity * 0.65 + ((-deltaX / deltaMs) * 1000) * 0.35
    );
    pointerState.x = event.clientX;
    pointerState.t = event.timeStamp;
  };

  const releasePointer = (event) => {
    const pointerState = pointerStateRef.current;

    if (!pointerState.active || pointerState.id !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    pointerStateRef.current = {
      active: false,
      id: null,
      x: 0,
      t: 0,
      velocity: 0
    };

    velocityRef.current = reducedMotionRef.current ? 0 : clampVelocity(pointerState.velocity * 0.55);
    setIsDragging(false);
  };

  const handleWheel = (event) => {
    const isHorizontalGesture =
      Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;

    if (!isHorizontalGesture) {
      return;
    }

    const delta = event.deltaX || event.deltaY;

    if (!delta) {
      return;
    }

    event.preventDefault();
    applyPositionDelta(scrollerRef.current, groupWidthRef.current, positionRef, delta);
    velocityRef.current = reducedMotionRef.current ? 0 : clampVelocity(delta * 2.2);
  };

  const handleKeyDown = (event) => {
    let delta = 0;

    if (event.key === 'ArrowRight') {
      delta = 140;
    } else if (event.key === 'ArrowLeft') {
      delta = -140;
    }

    if (!delta) {
      return;
    }

    event.preventDefault();
    applyPositionDelta(scrollerRef.current, groupWidthRef.current, positionRef, delta);
    velocityRef.current = reducedMotionRef.current ? 0 : clampVelocity(delta * 2);
  };

  if (!carouselSlides.length) {
    return <section className="landing-carousel-panel" aria-label="Wedding photo carousel" />;
  }

  return (
    <section ref={sectionRef} className="landing-carousel-panel" aria-label="Wedding photo carousel">
      <h2 className="landing-carousel-title">you&apos;re invited!</h2>
      <div className="landing-carousel-mask">
        <div
          ref={scrollerRef}
          className={`landing-carousel-track${isDragging ? ' is-dragging' : ''}`}
          role="region"
          aria-label="Wedding images"
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={releasePointer}
          onPointerCancel={releasePointer}
          onLostPointerCapture={releasePointer}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
        >
          {Array.from({ length: GROUP_COPIES }).map((_, copyIndex) => (
            <div
              key={copyIndex}
              ref={copyIndex === 1 ? middleGroupRef : null}
              className="landing-carousel-group"
              aria-hidden={copyIndex !== 1}
            >
              {carouselSlides.map((slide) => (
                <div key={`${copyIndex}-${slide.src}`} className="landing-carousel-item">
                  <img
                    className="landing-carousel-image"
                    src={slide.src}
                    alt={copyIndex === 1 ? slide.alt : ''}
                    draggable="false"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="landing-carousel-copy">
        <p className="landing-carousel-copy-script">
          We&apos;re so excited to celebrate our special day with you...
        </p>
        <p className="landing-carousel-copy-body">
          After years of love, laughter, and unforgettable memories, we&apos;re ready to
          take the next step - and we couldn&apos;t imagine it without you!
        </p>
      </div>
    </section>
  );
}