import { FunctionComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Comment, ReviewCycleConfig, ElementContext } from 'reviewcycle-shared';
import { StateManager } from '../services/StateManager.js';
import { ElementSelector } from '../services/ElementSelector.js';
import { FloatingButton } from './FloatingButton.js';
import { CommentMarker } from './CommentMarker.js';
import { CommentDialog } from './CommentDialog.js';
import { CommentThread } from './CommentThread.js';
import { UserButton } from './UserButton.js';

interface AppProps {
  config: ReviewCycleConfig;
  stateManager: StateManager;
  elementSelector: ElementSelector;
  clerkPublishableKey: string | null;
}

export const App: FunctionComponent<AppProps> = ({
  config: _config,
  stateManager,
  elementSelector,
  clerkPublishableKey,
}) => {
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [parentComments, setParentComments] = useState<Comment[]>([]);
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
    const comments = await stateManager.getComments(currentUrl);
    setAllComments(comments);

    // Only parent comments (those without parentId) get markers
    const parents = comments.filter(c => !c.parentId);
    setParentComments(parents);
  };

  // Calculate reply count for a thread (includes parent + all replies)
  const getThreadCount = (threadId: string): number => {
    const threadComments = allComments.filter(c => c.threadId === threadId);
    return threadComments.length;
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

  const handleSubmitComment = async (text: string) => {
    if (!dialogContext) return;

    await stateManager.addComment({
      text,
      url: window.location.href,
      elementSelector: dialogContext.selector,
      elementXPath: dialogContext.xpath,
      elementText: dialogContext.textContent,
      elementId: dialogContext.elementId, // Store unique element ID
      boundingRect: dialogContext.boundingRect,
      domContext: {
        ancestorPath: dialogContext.ancestorPath,
        siblings: dialogContext.siblings,
      },
      computedStyles: dialogContext.computedStyles,
      clickOffset: dialogContext.clickOffset, // Store precise click position
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
        commentCount={parentComments.length}
        isSelecting={isSelecting}
      />

      {clerkPublishableKey && <UserButton />}

      {parentComments.map((comment) => (
        <CommentMarker
          key={comment.id}
          comment={comment}
          replyCount={getThreadCount(comment.threadId)}
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
