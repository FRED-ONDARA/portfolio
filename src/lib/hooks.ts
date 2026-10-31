"use client";

import { useSyncExternalStore } from "react";

function mediaQuery(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = mediaQuery(reducedQuery);
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(reducedQuery).matches,
    () => false,
  );
}

const coarseQuery = "(pointer: coarse)";
const subscribeCoarse = mediaQuery(coarseQuery);
export function useIsTouch() {
  return useSyncExternalStore(
    subscribeCoarse,
    () => window.matchMedia(coarseQuery).matches,
    () => false,
  );
}

const mobileQuery = "(max-width: 767px)";
const subscribeMobile = mediaQuery(mobileQuery);
export function useIsMobile() {
  return useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(mobileQuery).matches,
    () => false,
  );
}

let webglSupport: boolean | null = null;
export function hasWebGL() {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

const noop = () => () => {};
export function useWebGL() {
  return useSyncExternalStore(noop, hasWebGL, () => false);
}
