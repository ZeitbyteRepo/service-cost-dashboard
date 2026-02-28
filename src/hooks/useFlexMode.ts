'use client';

import { useEffect, useMemo, useState } from 'react';

export const BREAKPOINTS = {
  cover: 360,
  folded: 640,
  unfolded: 1024,
} as const;

interface FlexModeState {
  isFlexMode: boolean;
  isCover: boolean;
  isFolded: boolean;
  isUnfolded: boolean;
}

function inferFlexFromViewport(width: number, height: number) {
  const portrait = height >= width;
  const aspectRatio = width > 0 ? height / width : 0;

  // Fold posture fallback heuristic when segment APIs are unavailable.
  return portrait && width >= BREAKPOINTS.folded && width < BREAKPOINTS.unfolded && aspectRatio <= 1.7;
}

function getState(): FlexModeState {
  if (typeof window === 'undefined') {
    return {
      isFlexMode: false,
      isCover: false,
      isFolded: false,
      isUnfolded: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isCover = width <= BREAKPOINTS.cover;
  const isFolded = width >= BREAKPOINTS.folded && width < BREAKPOINTS.unfolded;
  const isUnfolded = width >= BREAKPOINTS.unfolded;

  const media = window.matchMedia('(vertical-viewport-segments: 2)');
  const isFlexMode = media.matches || inferFlexFromViewport(width, height);

  return {
    isFlexMode,
    isCover,
    isFolded,
    isUnfolded,
  };
}

export function useFlexMode(): FlexModeState {
  const [state, setState] = useState<FlexModeState>(getState);

  useEffect(() => {
    const update = () => setState(getState());
    const media = window.matchMedia('(vertical-viewport-segments: 2)');

    update();

    window.addEventListener('resize', update);
    media.addEventListener('change', update);

    return () => {
      window.removeEventListener('resize', update);
      media.removeEventListener('change', update);
    };
  }, []);

  return useMemo(() => state, [state]);
}

export default useFlexMode;
