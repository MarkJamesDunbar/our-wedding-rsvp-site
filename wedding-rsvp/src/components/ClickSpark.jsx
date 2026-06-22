import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ClickSpark({
  sparkColor = '#f00',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1,
  children
}) {
  const navigate = useNavigate();
  const [sparks, setSparks] = useState([]);
  const timeoutRef = useRef(0);
  const navigationTimeoutRef = useRef(0);

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current);
      window.clearTimeout(navigationTimeoutRef.current);
    };
  }, []);

  const handlePointerDown = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const nextSpark = {
      id: `${event.timeStamp}-${Math.random().toString(36).slice(2)}`,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    setSparks((current) => [...current, nextSpark]);

    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setSparks((current) => current.filter((spark) => spark.id !== nextSpark.id));
    }, duration + 80);
  }, [duration]);

  const handleClickCapture = useCallback((event) => {
    const anchor = event.target.closest?.('a[href]');

    if (!anchor || event.defaultPrevented) {
      return;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    if (anchor.hasAttribute('download')) {
      return;
    }

    const target = anchor.getAttribute('target');
    if (target && target !== '_self') {
      return;
    }

    const nextUrl = new URL(anchor.href, window.location.href);
    if (nextUrl.origin !== window.location.origin) {
      return;
    }

    const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextPath === currentPath) {
      return;
    }

    event.preventDefault();
    window.clearTimeout(navigationTimeoutRef.current);
    navigationTimeoutRef.current = window.setTimeout(() => {
      navigate(nextPath);
    }, Math.min(duration, 220));
  }, [duration, navigate]);

  return (
    <div className="click-spark" onPointerDown={handlePointerDown} onClickCapture={handleClickCapture}>
      {children}

      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="click-spark-burst"
          style={{
            left: spark.x,
            top: spark.y,
            '--spark-color': sparkColor,
            '--spark-size': `${sparkSize}px`,
            '--spark-radius': `${sparkRadius * extraScale}px`,
            '--spark-duration': `${duration}ms`,
            '--spark-easing': easing
          }}
          aria-hidden="true"
        >
          {Array.from({ length: sparkCount }).map((_, index) => {
            const angle = (360 / sparkCount) * index;
            return (
              <span
                key={index}
                className="click-spark-line"
                style={{ '--spark-angle': `${angle}deg` }}
              />
            );
          })}
        </span>
      ))}
    </div>
  );
}