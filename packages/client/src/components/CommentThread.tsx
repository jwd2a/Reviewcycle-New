import { FunctionComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useUser } from '@clerk/clerk-react';
import { Comment } from 'reviewcycle-shared';
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
  const { user } = useUser();

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
      parentId: threadId,
    });

    setReplyText('');
    onClose();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await stateManager.deleteComment(commentId);

      // Reload thread to see if any comments remain
      const updatedThread = await stateManager.getThread(threadId);

      // If thread is empty (parent was deleted), close the dialog
      if (updatedThread.length === 0) {
        onClose();
      } else {
        // Otherwise just refresh the thread view
        setComments(updatedThread.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
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
          {comments.map((comment, index) => {
            const isOriginal = index === 0;
            return (
              <div key={comment.id}>
                {isOriginal && <div class="rc-section-label">Comment</div>}
                {!isOriginal && index === 1 && <div class="rc-section-label">Replies</div>}

                <div class={`rc-comment ${isOriginal ? 'rc-comment-original' : 'rc-comment-reply'}`}>
                  <div class="rc-comment-header">
                    <span class="rc-comment-author">
                      {comment.user?.name || comment.authorName || 'Anonymous'}
                    </span>
                    <span class="rc-comment-date">{formatDate(comment.createdAt)}</span>
                    {user && comment.userId === user.id && (
                      <button
                        class="rc-comment-delete"
                        onClick={() => handleDeleteComment(comment.id)}
                        title="Delete comment"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                          <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <div class="rc-comment-text">{comment.text}</div>
                </div>
              </div>
            );
          })}

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

            <button type="submit" class="rc-button rc-button-primary">
              Reply
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
