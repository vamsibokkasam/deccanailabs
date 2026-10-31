import { useLayoutEffect } from "react";

const CARD_SELECTOR = [
  "[data-cine-card]",
  ".internship-card",
  ".strategy-framework-step",
  ".strategy-focus-card",
  ".why-card",
  ".impact-stat-card",
  ".about-team-member",
].join(", ");

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function list(target) {
  if (!target) return [];
  if (typeof target.length === "number" && !target.nodeType) return Array.from(target);
  return [target];
}

function hide(element, y) {
  element.style.opacity = "0";
  element.style.transform = `translateY(${y}px)`;
}

function show(element, durationMs, delayMs) {
  element.style.transition = `opacity ${durationMs}ms ${EASE} ${delayMs}ms, transform ${durationMs}ms ${EASE} ${delayMs}ms`;
  element.style.opacity = "1";
  element.style.transform = "translateY(0px)";
}

function clearMotion(element) {
  element.style.opacity = "";
  element.style.transform = "";
  element.style.transition = "";
}

/**
 * Fade each home section's heading up and stagger its cards once
 * they enter the viewport. Skipped when reduced motion is requested.
 */
export function useHomeCinematic(rootRef) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;

    const cleanups = [];

    root.querySelectorAll("[data-cine]").forEach((section) => {
      const head = section.querySelector("[data-cine-head]");
      const skipCards = section.classList.contains("reviews-section");
      const cards = skipCards ? [] : list(section.querySelectorAll(CARD_SELECTOR));
      const targets = [...(head ? [head] : []), ...cards];
      if (!targets.length) return;

      if (head) hide(head, 24);
      cards.forEach((card) => hide(card, 18));

      let played = false;
      const play = () => {
        if (played) return;
        played = true;
        if (head) show(head, 600, 0);
        cards.forEach((card, index) => {
          const overlap = head ? 320 : 0;
          show(card, 500, overlap + index * 80);
        });
      };

      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.88 && rect.bottom > 0;
      if (inView) {
        play();
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            play();
            observer.disconnect();
          }
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
      );
      observer.observe(section);
      cleanups.push(() => {
        observer.disconnect();
        targets.forEach(clearMotion);
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [rootRef]);
}
