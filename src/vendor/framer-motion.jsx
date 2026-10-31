import {
  cloneElement,
  createElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/**
 * Stand-in for the framer-motion APIs the hero uses.
 * Vite loads the real package from node_modules when it is installed.
 */

function createValue(initial) {
  let current = initial;
  const listeners = new Set();
  return {
    get: () => current,
    set: (next) => {
      if (Object.is(current, next)) return;
      current = next;
      listeners.forEach((listener) => listener(next));
    },
    on: (event, listener) => {
      if (event !== "change") return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

function isMotionValue(value) {
  return Boolean(value && typeof value.get === "function" && typeof value.on === "function");
}

export function useMotionValue(initial) {
  const ref = useRef(null);
  if (!ref.current) ref.current = createValue(initial);
  return ref.current;
}

export function useSpring(source, options = {}) {
  const stiffness = options.stiffness ?? 180;
  const damping = options.damping ?? 20;
  const mass = options.mass ?? 1;
  const start = typeof source?.get === "function" ? source.get() : source;
  const value = useMotionValue(start);

  useEffect(() => {
    if (typeof source?.get !== "function") {
      value.set(source);
      return undefined;
    }

    let current = source.get();
    let velocity = 0;
    let target = current;
    let last = performance.now();
    let frame = 0;

    const unsub = source.on("change", (next) => {
      target = next;
    });

    const tick = (now) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const force = ((target - current) * stiffness) / mass;
      const drag = (damping * velocity) / mass;
      velocity += (force - drag) * dt;
      current += velocity * dt;
      if (Math.abs(target - current) < 0.0008 && Math.abs(velocity) < 0.0008) {
        current = target;
        velocity = 0;
      }
      value.set(current);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      unsub();
    };
  }, [source, stiffness, damping, mass, value]);

  return value;
}

export function useTransform(source, input, output) {
  const inputRef = useRef(input);
  const outputRef = useRef(output);
  inputRef.current = input;
  outputRef.current = output;

  const map = (raw) => {
    const input = inputRef.current;
    const output = outputRef.current;
    if (!input?.length || !output?.length) return 0;
    if (raw <= input[0]) return output[0];
    const last = input.length - 1;
    if (raw >= input[last]) return output[Math.min(last, output.length - 1)];
    for (let index = 0; index < last; index += 1) {
      if (raw <= input[index + 1]) {
        const span = input[index + 1] - input[index] || 1;
        const t = (raw - input[index]) / span;
        const from = output[Math.min(index, output.length - 1)];
        const to = output[Math.min(index + 1, output.length - 1)];
        return from + (to - from) * t;
      }
    }
    return output[output.length - 1];
  };

  const start = typeof source?.get === "function" ? source.get() : 0;
  const value = useMotionValue(map(start));

  useLayoutEffect(() => {
    if (typeof source?.on !== "function") return undefined;
    const update = () => value.set(map(source.get()));
    update();
    return source.on("change", update);
  }, [source, value]);

  return value;
}

export function useScroll({ target } = {}) {
  const scrollYProgress = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const element = target?.current;
      if (!element) {
        scrollYProgress.set(0);
        return;
      }
      const rect = element.getBoundingClientRect();
      const total = element.offsetHeight - window.innerHeight;
      const progress = total <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / total));
      scrollYProgress.set(progress);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [target, scrollYProgress]);

  return { scrollYProgress };
}

function readTemplate(strings, parts) {
  let out = strings[0];
  parts.forEach((part, index) => {
    const raw = isMotionValue(part) ? part.get() : part;
    const shown = typeof raw === "number" ? Math.round(raw * 100) / 100 : raw;
    out += shown + strings[index + 1];
  });
  return out;
}

export function useMotionTemplate(strings, ...parts) {
  const value = useMotionValue(readTemplate(strings, parts));
  const stringsRef = useRef(strings);
  const partsRef = useRef(parts);
  stringsRef.current = strings;
  partsRef.current = parts;

  useLayoutEffect(() => {
    const read = () => value.set(readTemplate(stringsRef.current, partsRef.current));
    read();
    const unsubs = partsRef.current
      .filter(isMotionValue)
      .map((part) => part.on("change", read));
    return () => unsubs.forEach((stop) => stop());
  }, [value]);

  return value;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

function sample(frames, t) {
  if (!frames.length) return 0;
  if (frames.length === 1) return frames[0];
  const scaled = t * (frames.length - 1);
  const index = Math.min(frames.length - 2, Math.floor(scaled));
  const local = scaled - index;
  return frames[index] + (frames[index + 1] - frames[index]) * local;
}

function resolveMotionStyle(style, animated) {
  const next = {};
  const transforms = [];

  const take = (key, raw) => {
    if (
      key === "x" ||
      key === "y" ||
      key === "z" ||
      key === "rotate" ||
      key === "rotateX" ||
      key === "rotateY" ||
      key === "rotateZ" ||
      key === "scale" ||
      key === "scaleX" ||
      key === "scaleY"
    ) {
      transforms.push([key, raw]);
      return;
    }
    next[key] = raw;
  };

  if (style) {
    Object.entries(style).forEach(([key, raw]) => {
      take(key, isMotionValue(raw) ? raw.get() : raw);
    });
  }
  if (animated) {
    Object.entries(animated).forEach(([key, raw]) => take(key, raw));
  }

  if (transforms.length) {
    const map = new Map(transforms);
    const pieces = [];
    if (map.has("x")) pieces.push(`translateX(${map.get("x")}px)`);
    if (map.has("y")) pieces.push(`translateY(${map.get("y")}px)`);
    if (map.has("z")) pieces.push(`translateZ(${map.get("z")}px)`);
    if (map.has("rotate")) pieces.push(`rotate(${map.get("rotate")}deg)`);
    if (map.has("rotateX")) pieces.push(`rotateX(${map.get("rotateX")}deg)`);
    if (map.has("rotateY")) pieces.push(`rotateY(${map.get("rotateY")}deg)`);
    if (map.has("rotateZ")) pieces.push(`rotateZ(${map.get("rotateZ")}deg)`);
    if (map.has("scale")) pieces.push(`scale(${map.get("scale")})`);
    if (map.has("scaleX")) pieces.push(`scaleX(${map.get("scaleX")})`);
    if (map.has("scaleY")) pieces.push(`scaleY(${map.get("scaleY")})`);
    const existing = typeof next.transform === "string" && next.transform !== "none"
      ? `${next.transform} `
      : "";
    next.transform = `${existing}${pieces.join(" ")}`.trim();
  }

  return next;
}

function frameAt(spec, loopT, onceT, origin) {
  if (!spec) return null;
  const frame = {};
  Object.entries(spec).forEach(([key, raw]) => {
    if (Array.isArray(raw)) {
      frame[key] = sample(raw, loopT);
      return;
    }
    if (typeof raw === "number" && origin && typeof origin[key] === "number") {
      frame[key] = origin[key] + (raw - origin[key]) * onceT;
      return;
    }
    frame[key] = raw;
  });
  return frame;
}

function assignRef(ref, node) {
  if (!ref) return;
  if (typeof ref === "function") ref(node);
  else ref.current = node;
}

function createMotion(tag) {
  return function MotionComponent({
    style,
    animate,
    initial,
    exit,
    transition,
    children,
    ref,
    ...rest
  }) {
    const nodeRef = useRef(null);
    const styleRef = useRef(style);
    const animateRef = useRef(animate);
    const initialRef = useRef(initial);
    const exitRef = useRef(exit);
    const transitionRef = useRef(transition);
    const animatedRef = useRef(null);
    styleRef.current = style;
    animateRef.current = animate;
    initialRef.current = initial;
    exitRef.current = exit;
    transitionRef.current = transition;
    const presence = rest["data-presence"];

    const paint = () => {
      const node = nodeRef.current;
      if (!node) return;
      const resolved = resolveMotionStyle(styleRef.current, animatedRef.current);
      Object.entries(resolved).forEach(([key, value]) => {
        if (value == null) return;
        node.style[key] = value;
      });
    };

    useLayoutEffect(() => {
      const values = Object.values(styleRef.current || {}).filter(isMotionValue);
      const unsubs = values.map((value) => value.on("change", paint));
      paint();
      return () => unsubs.forEach((stop) => stop());
    }, []);

    useLayoutEffect(() => {
      paint();
    });

    useLayoutEffect(() => {
      const spec = presence === "out" ? exitRef.current || { opacity: 0 } : animateRef.current;
      const origin = presence === "out" ? animateRef.current : initialRef.current;
      if (!spec) {
        animatedRef.current = null;
        paint();
        return undefined;
      }

      const timing = transitionRef.current || {};
      const duration = (timing.duration ?? 0.45) * 1000;
      const delay = (timing.delay ?? 0) * 1000;
      const repeat = timing.repeat === Infinity;
      const started = performance.now();
      let frame = 0;
      let stopped = false;

      const tick = (now) => {
        if (stopped) return;
        const elapsed = now - started - delay;
        if (elapsed < 0) {
          animatedRef.current = frameAt(origin || spec, 0, 0, origin);
          paint();
          frame = requestAnimationFrame(tick);
          return;
        }
        const onceT = easeInOut(Math.min(1, elapsed / duration));
        const loopT = easeInOut(repeat ? (elapsed / duration) % 1 : Math.min(1, elapsed / duration));
        animatedRef.current = frameAt(spec, loopT, onceT, origin);
        paint();
        if (repeat || elapsed < duration) frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
      return () => {
        stopped = true;
        cancelAnimationFrame(frame);
      };
    }, [presence]);

    return createElement(
      tag,
      {
        ...rest,
        ref: (node) => {
          nodeRef.current = node;
          assignRef(ref, node);
        },
      },
      children,
    );
  };
}

const motionCache = Object.create(null);

export const motion = new Proxy(
  {},
  {
    get(_target, tag) {
      if (tag === "$$typeof") return undefined;
      if (!motionCache[tag]) motionCache[tag] = createMotion(tag);
      return motionCache[tag];
    },
  },
);

export function AnimatePresence({ children }) {
  const [shown, setShown] = useState(children);
  const [phase, setPhase] = useState("in");
  const shownKey = useRef(isValidElement(children) ? children.key : null);
  const childRef = useRef(children);
  childRef.current = children;
  const key = isValidElement(children) ? children.key : null;

  useEffect(() => {
    const next = childRef.current;
    if (!isValidElement(next)) return undefined;
    if (next.key === shownKey.current) {
      setShown(next);
      return undefined;
    }
    setPhase("out");
    const timer = window.setTimeout(() => {
      shownKey.current = next.key;
      setShown(next);
      setPhase("in");
    }, 280);
    return () => window.clearTimeout(timer);
  }, [key]);

  if (!isValidElement(shown)) return null;
  return cloneElement(shown, { "data-presence": phase });
}
