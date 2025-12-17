import { FunctionComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Comment, ReviewCycleConfig, ElementContext } from 'reviewcycle-shared';
import { StateManager } from '../services/StateManager.js';
import { ElementSelector } from '../services/ElementSelector.js';
import { FloatingButton } from './FloatingButton.js';
import { CommentMarker } from './CommentMarker.js';
import { CommentDialog } from './CommentDialog.js';
import { CommentThread } from './CommentThread.js';

interface AppProps {
  config: ReviewCycleConfig;
  stateManager: StateManager;
  elementSelector: ElementSelector;
}

export const App: FunctionComponent<AppProps> = ({
  stateManager,
  elementSelector,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [dialogContext, setDialogContext] = useState<ElementContext | null>(null);

  useEffect(() => {
    loadComments();

    // Subscribe to state changes
    const unsubscribe = stateManager.subscribe(() => {
      loadComments();
    });

    return unsubscribe;
  }, []);

  const loadComments = async () => {
    const currentUrl = window.location.href;
    const allComments = await stateManager.getComments(currentUrl);
    setComments(allComments);
  };

  const handleStartSelection = () => {
    setIsSelecting(true);
    elementSelector.activate((context) => {
      setDialogContext(context);
      setIsSelecting(false);
    });
  };

  const handleCloseDialog = () => {
    setDialogContext(null);
  };

  const handleSubmitComment = async (text: string, authorName?: string) => {
    if (!dialogContext) return;

    await stateManager.addComment({
      text,
      url: window.location.href,
      authorName,
      elementSelector: dialogContext.selector,
      elementXPath: dialogContext.xpath,
      elementText: dialogContext.textContent,
      boundingRect: dialogContext.boundingRect,
      domContext: {
        ancestorPath: dialogContext.ancestorPath,
        siblings: dialogContext.siblings,
      },
      computedStyles: dialogContext.computedStyles,
    });

    setDialogContext(null);
  };

  const handleMarkerClick = (comment: Comment) => {
    setActiveThreadId(comment.threadId);
  };

  const handleCloseThread = () => {
    setActiveThreadId(null);
  };

  return (
    <div>
      <FloatingButton
        onClick={handleStartSelection}
        commentCount={comments.length}
        isSelecting={isSelecting}
      />

      {comments.map((comment) => (
        <CommentMarker
          key={comment.id}
          comment={comment}
          onClick={() => handleMarkerClick(comment)}
        />
      ))}

      {dialogContext && (
        <CommentDialog
          context={dialogContext}
          onClose={handleCloseDialog}
          onSubmit={handleSubmitComment}
        />
      )}

      {activeThreadId && (
        <CommentThread
          threadId={activeThreadId}
          stateManager={stateManager}
          onClose={handleCloseThread}
        />
      )}
    </div>
  );
};
