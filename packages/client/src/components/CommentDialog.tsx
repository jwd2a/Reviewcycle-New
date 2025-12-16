import { FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import { ElementContext } from '@reviewcycle/shared';

interface CommentDialogProps {
  context: ElementContext;
  onClose: () => void;
  onSubmit: (text: string, authorName?: string) => void;
}

export const CommentDialog: FunctionComponent<CommentDialogProps> = ({
  context,
  onClose,
  onSubmit,
}) => {
  const [text, setText] = useState('');
  const [authorName, setAuthorName] = useState('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text, authorName || undefined);
    }
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div class="rc-modal-overlay" onClick={handleOverlayClick}>
      <div class="rc-modal">
        <div class="rc-modal-header">
          <h3 class="rc-modal-title">Add Comment</h3>
          <button class="rc-modal-close" onClick={onClose} title="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div class="rc-modal-body">
            {context.textContent && (
              <div class="rc-comment-element-info">
                <strong>Element:</strong>{' '}
                <span class="rc-comment-element-selector">{context.selector}</span>
                {context.textContent && (
                  <>
                    <br />
                    <strong>Text:</strong> "{context.textContent.substring(0, 50)}
                    {context.textContent.length > 50 ? '...' : ''}"
                  </>
                )}
              </div>
            )}

            <div class="rc-form-group">
              <label class="rc-label" for="comment-text">
                Comment *
              </label>
              <textarea
                id="comment-text"
                class="rc-textarea"
                value={text}
                onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
                placeholder="Describe what needs to be changed..."
                required
                autoFocus
              />
            </div>

            <div class="rc-form-group">
              <label class="rc-label" for="author-name">
                Your Name (optional)
              </label>
              <input
                id="author-name"
                type="text"
                class="rc-input"
                value={authorName}
                onInput={(e) => setAuthorName((e.target as HTMLInputElement).value)}
                placeholder="John Doe"
              />
            </div>
          </div>

          <div class="rc-modal-footer">
            <button type="button" class="rc-button rc-button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" class="rc-button rc-button-primary">
              Add Comment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
