import { FunctionComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Comment } from '@reviewcycle/shared';
import { StateManager } from '../services/StateManager.js';

interface CommentThreadProps {
  threadId: string;
  stateManager: StateManager;
  onClose: () => void;
}

export const CommentThread: FunctionComponent<CommentThreadProps> = ({
  threadId,
  stateManager,
  onClose,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyText, setReplyText] = useState('');
  const [authorName, setAuthorName] = useState('');

  useEffect(() => {
    loadThread();
  }, [threadId]);

  const loadThread = async () => {
    const thread = await stateManager.getThread(threadId);
    setComments(thread.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ));
  };

  const handleSubmitReply = async (e: Event) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    await stateManager.addComment({
      text: replyText,
      url: window.location.href,
      authorName: authorName || undefined,
      parentId: threadId,
    });

    setReplyText('');
    loadThread();
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const rootComment = comments.find((c) => c.id === threadId);

  return (
    <div class="rc-modal-overlay" onClick={handleOverlayClick}>
      <div class="rc-modal">
        <div class="rc-modal-header">
          <h3 class="rc-modal-title">Comment Thread</h3>
          <button class="rc-modal-close" onClick={onClose} title="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
            </svg>
          </button>
        </div>

        <div class="rc-modal-body">
          {rootComment && rootComment.elementSelector && (
            <div class="rc-comment-element-info">
              <strong>Element:</strong>{' '}
              <span class="rc-comment-element-selector">{rootComment.elementSelector}</span>
            </div>
          )}

          {comments.map((comment) => (
            <div key={comment.id} class="rc-comment">
              <div class="rc-comment-header">
                <span class="rc-comment-author">
                  {comment.authorName || 'Anonymous'}
                </span>
                <span class="rc-comment-date">{formatDate(comment.createdAt)}</span>
              </div>
              <div class="rc-comment-text">{comment.text}</div>
            </div>
          ))}

          <form onSubmit={handleSubmitReply}>
            <div class="rc-form-group">
              <label class="rc-label" for="reply-text">
                Add Reply
              </label>
              <textarea
                id="reply-text"
                class="rc-textarea"
                value={replyText}
                onInput={(e) => setReplyText((e.target as HTMLTextAreaElement).value)}
                placeholder="Write a reply..."
                style={{ minHeight: '80px' }}
              />
            </div>

            <div class="rc-form-group">
              <label class="rc-label" for="reply-author">
                Your Name (optional)
              </label>
              <input
                id="reply-author"
                type="text"
                class="rc-input"
                value={authorName}
                onInput={(e) => setAuthorName((e.target as HTMLInputElement).value)}
                placeholder="John Doe"
              />
            </div>

            <button type="submit" class="rc-button rc-button-primary">
              Reply
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
