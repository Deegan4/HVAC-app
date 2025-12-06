import { MutableRefObject, useEffect, useRef } from 'react';

export function useMountedRef(): MutableRefObject<boolean> {
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
}
