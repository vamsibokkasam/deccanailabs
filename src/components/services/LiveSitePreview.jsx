import { useCallback, useEffect, useRef, useState } from "react";

function LiveSitePreview({ image, title }) {
  const frameRef = useRef(null);
  const imgRef = useRef(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(28);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img?.naturalHeight) return;

    const next = Math.max(0, img.offsetHeight - frame.clientHeight);
    setDistance(next);
    setDuration(Math.max(20, Math.min(44, next / 145)));
    setReady(true);
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div
      ref={frameRef}
      className={`service-work-shot${ready ? " is-ready" : ""}`}
      style={{
        "--scroll-distance": `${distance}px`,
        "--scroll-duration": `${duration}s`,
      }}
    >
      <div className="service-work-page">
        <img
          ref={imgRef}
          src={image}
          alt=""
          aria-hidden="true"
          title={title}
          onLoad={measure}
        />
      </div>
      <div className="service-work-scroll-hint" aria-hidden="true">
        Hover to scroll
      </div>
    </div>
  );
}

export default LiveSitePreview;
