import { FunctionComponent } from 'preact';
import { Comment } from 'reviewcycle-shared';
import { useElementTracking } from '../hooks/useElementTracking.js';

interface CommentMarkerProps {
  comment: Comment;
  replyCount: number;
  onClick: () => void;
}

export const CommentMarker: FunctionComponent<CommentMarkerProps> = ({
  comment,
  replyCount,
  onClick,
}) => {
  // Use the element tracking hook to automatically handle DOM changes and SPA navigation
  const { position, isVisible } = useElementTracking(comment);

  // Don't render if position is not available or element is not visible
  if (!position || !isVisible) return null;

  const style = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: 'translate(-50%, -50%)',
  };

  // Show count if there are 2+ messages (1 parent + 1+ replies)
  const showCount = replyCount >= 2;

  return (
    <div class="rc-marker" style={style} onClick={onClick}>
      <div class="rc-marker-badge">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M14 2a2 2 0 012 2v8a2 2 0 01-2 2H7l-4 4V4a2 2 0 012-2h9z" />
        </svg>
        {showCount && <span class="rc-marker-count">{replyCount}</span>}
      </div>
      <div class="rc-marker-pulse" />
    </div>
  );
};
