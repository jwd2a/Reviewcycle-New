import { useEffect, useState, useRef } from 'preact/hooks';
import { Comment } from 'reviewcycle-shared';
import { findElementBySelector, findElementByXPath } from '../utils/positioning.js';

interface ElementPosition {
  x: number;
  y: number;
}

interface UseElementTrackingResult {
  position: ElementPosition | null;
  isVisible: boolean;
  targetElement: HTMLElement | null;
}

/**
 * Hook that tracks an element's position and visibility across DOM mutations and SPA navigation.
 * Automatically hides markers when elements are removed or not found.
 *
 * @param comment - The comment containing element selectors and position info
 * @returns Object containing current position, visibility state, and target element
 */
export function useElementTracking(comment: Comment): UseElementTrackingResult {
  const [position, setPosition] = useState<ElementPosition | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const updateTimeoutRef = useRef<number | null>(null);

  // Find the element using available selectors
  const findElement = (): HTMLElement | null => {
    let element: HTMLElement | null = null;

    // Try CSS selector first (most efficient)
    if (comment.elementSelector) {
      element = findElementBySelector(comment.elementSelector);
    }

    // Fall back to XPath if CSS selector fails
    if (!element && comment.elementXPath) {
      element = findElementByXPath(comment.elementXPath);
    }

    return element;
  };

  // Update position based on current element location
  const updatePosition = () => {
    const element = findElement();
    setTargetElement(element);

    if (element) {
      // Element found - check if it's actually visible in DOM
      const rect = element.getBoundingClientRect();

      // Element is considered visible if it has dimensions
      const elementIsVisible = rect.width > 0 && rect.height > 0;

      if (elementIsVisible) {
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
        setIsVisible(true);
      } else {
        // Element exists but has no dimensions (hidden)
        setIsVisible(false);
      }
    } else {
      // Element not found - hide marker
      setIsVisible(false);

      // Fall back to stored position for potential future recovery
      if (comment.boundingRect) {
        setPosition({
          x: comment.boundingRect.x,
          y: comment.boundingRect.y,
        });
      }
    }
  };

  // Debounced update to avoid excessive recalculations
  const scheduleUpdate = () => {
    if (updateTimeoutRef.current !== null) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = window.setTimeout(updatePosition, 50);
  };

  useEffect(() => {
    // Initial position update
    updatePosition();

    // 1. Listen to scroll and resize events
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    // 2. Set up MutationObserver to watch for DOM changes
    mutationObserverRef.current = new MutationObserver((mutations) => {
      // Check if any mutation might affect our element
      let shouldUpdate = false;

      for (const mutation of mutations) {
        // If nodes were added or removed, check if it affects our element
        if (mutation.type === 'childList') {
          shouldUpdate = true;
          break;
        }
        // If attributes changed on our target element or its ancestors
        if (mutation.type === 'attributes') {
          const element = findElement();
          if (element && (mutation.target === element || element.contains(mutation.target as Node))) {
            shouldUpdate = true;
            break;
          }
        }
      }

      if (shouldUpdate) {
        scheduleUpdate();
      }
    });

    // Observe the entire document for structural changes
    mutationObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden'], // Only watch relevant attributes
    });

    // 3. Set up IntersectionObserver to track element visibility
    intersectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          // Update visibility based on intersection
          setIsVisible(entry.isIntersecting && entry.intersectionRatio > 0);
          if (entry.isIntersecting) {
            scheduleUpdate();
          }
        }
      },
      {
        threshold: [0, 0.1, 0.5, 1], // Multiple thresholds for better tracking
      }
    );

    // Start observing the target element if it exists
    const element = findElement();
    if (element && intersectionObserverRef.current) {
      intersectionObserverRef.current.observe(element);
    }

    // 4. Listen to SPA navigation events
    const handleNavigation = () => {
      // Delay to allow SPA frameworks to update the DOM
      setTimeout(updatePosition, 100);
    };

    // History API changes (SPA navigation)
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('hashchange', handleNavigation);

    // Intercept pushState and replaceState for SPA frameworks
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      handleNavigation();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      handleNavigation();
    };

    // 5. Periodic validation to catch edge cases (e.g., CSS transitions, delayed renders)
    const validationInterval = setInterval(() => {
      const element = findElement();
      // Only update if visibility state has changed
      if ((element !== null) !== isVisible) {
        updatePosition();
      }
    }, 2000); // Check every 2 seconds

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('hashchange', handleNavigation);

      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }

      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }

      if (updateTimeoutRef.current !== null) {
        clearTimeout(updateTimeoutRef.current);
      }

      clearInterval(validationInterval);

      // Restore original history methods
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [comment.elementSelector, comment.elementXPath, comment.id]);

  return {
    position,
    isVisible,
    targetElement,
  };
}
