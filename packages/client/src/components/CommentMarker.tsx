import { FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Comment } from 'reviewcycle-shared';
import { findElementBySelector, findElementByXPath } from '../utils/positioning.js';

interface CommentMarkerProps {
  comment: Comment;
  onClick: () => void;
}

export const CommentMarker: FunctionComponent<CommentMarkerProps> = ({
  comment,
  onClick,
}) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    updatePosition();

    // Update position on scroll and resize
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [comment]);

  const updatePosition = () => {
    // Try to find the element and update position
    let element: HTMLElement | null = null;

    if (comment.elementSelector) {
      element = findElementBySelector(comment.elementSelector);
    }

    if (!element && comment.elementXPath) {
      element = findElementByXPath(comment.elementXPath);
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    } else if (comment.boundingRect) {
      // Fall back to stored position
      setPosition({
        x: comment.boundingRect.x,
        y: comment.boundingRect.y,
      });
    }
  };

  if (!position) return null;

  const style = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: 'translate(-50%, -50%)',
  };

  return (
    <div class="rc-marker" style={style} onClick={onClick}>
      <div class="rc-marker-badge">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M14 2a2 2 0 012 2v8a2 2 0 01-2 2H7l-4 4V4a2 2 0 012-2h9z" />
        </svg>
      </div>
      <div class="rc-marker-pulse" />
    </div>
  );
};
