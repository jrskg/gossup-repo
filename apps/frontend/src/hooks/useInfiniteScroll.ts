import { useCallback, useEffect, useRef, useState } from "react";

interface InfiniteScrollOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => Promise<void>;
}

export const useInfiniteScroll = ({
  root = null,
  rootMargin = "0px",
  threshold = 0,
  hasMore,
  isLoading,
  onLoadMore,
}: InfiniteScrollOptions) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const [lastElement, setLastElement] = useState<HTMLElement | null>(null);
  
  const observe = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          await onLoadMore();
        }
      }, { root, rootMargin, threshold });
      if (node) observer.current.observe(node);
    },
    [hasMore, isLoading, onLoadMore, root, rootMargin, threshold]
  );

  useEffect(() => {
    if (lastElement) {
      observe(lastElement);
    }
    return () => observer.current?.disconnect();
  }, [lastElement, observe]);

  return { setLastElement };
};
