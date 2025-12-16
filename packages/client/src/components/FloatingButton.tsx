import { FunctionComponent } from 'preact';

interface FloatingButtonProps {
  onClick: () => void;
  commentCount: number;
  isSelecting: boolean;
}

export const FloatingButton: FunctionComponent<FloatingButtonProps> = ({
  onClick,
  commentCount,
  isSelecting,
}) => {
  return (
    <button
      class="rc-floating-button"
      onClick={onClick}
      title={isSelecting ? 'Click an element to comment' : 'Add comment'}
    >
      {isSelecting ? (
        <svg class="rc-floating-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" />
        </svg>
      ) : (
        <svg class="rc-floating-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      )}
      {commentCount > 0 && !isSelecting && (
        <span class="rc-floating-button-badge">{commentCount}</span>
      )}
    </button>
  );
};
