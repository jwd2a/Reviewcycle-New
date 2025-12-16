export function getInjectedStyles(): string {
  return `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #1f2937;
    }

    * {
      box-sizing: border-box;
    }

    /* Floating Button */
    .rc-floating-button {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999998;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .rc-floating-button:hover {
      background: #2563eb;
      transform: scale(1.05);
    }

    .rc-floating-button:active {
      transform: scale(0.95);
    }

    .rc-floating-button-icon {
      width: 24px;
      height: 24px;
    }

    .rc-floating-button-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: white;
      border-radius: 12px;
      padding: 2px 6px;
      font-size: 11px;
      font-weight: 600;
      min-width: 20px;
      text-align: center;
    }

    /* Comment Marker */
    .rc-marker {
      position: fixed;
      z-index: 999997;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .rc-marker:hover {
      transform: scale(1.1);
    }

    .rc-marker-badge {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      position: relative;
    }

    .rc-marker-pulse {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #3b82f6;
      opacity: 0;
      animation: rc-pulse 2s ease-out infinite;
    }

    @keyframes rc-pulse {
      0% {
        transform: scale(1);
        opacity: 0.5;
      }
      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }

    /* Hover Overlay */
    .rc-hover-overlay {
      position: fixed;
      pointer-events: none;
      z-index: 999996;
      border: 2px solid #3b82f6;
      background: rgba(59, 130, 246, 0.1);
      transition: all 0.1s ease;
    }

    /* Modal Overlay */
    .rc-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    /* Modal */
    .rc-modal {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-width: 500px;
      width: 100%;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .rc-modal-header {
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .rc-modal-title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .rc-modal-close {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .rc-modal-close:hover {
      background: #f3f4f6;
      color: #111827;
    }

    .rc-modal-body {
      padding: 20px;
      overflow-y: auto;
    }

    .rc-modal-footer {
      padding: 20px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    /* Form Elements */
    .rc-form-group {
      margin-bottom: 16px;
    }

    .rc-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }

    .rc-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .rc-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .rc-textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      min-height: 100px;
      transition: all 0.2s ease;
    }

    .rc-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* Buttons */
    .rc-button {
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .rc-button-primary {
      background: #3b82f6;
      color: white;
    }

    .rc-button-primary:hover {
      background: #2563eb;
    }

    .rc-button-primary:active {
      transform: scale(0.98);
    }

    .rc-button-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .rc-button-secondary:hover {
      background: #e5e7eb;
    }

    .rc-button-secondary:active {
      transform: scale(0.98);
    }

    /* Comment Thread */
    .rc-comment {
      padding: 16px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .rc-comment:last-child {
      border-bottom: none;
    }

    .rc-comment-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .rc-comment-author {
      font-weight: 600;
      color: #111827;
      font-size: 14px;
    }

    .rc-comment-date {
      font-size: 12px;
      color: #6b7280;
    }

    .rc-comment-text {
      color: #374151;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .rc-comment-element-info {
      margin-top: 8px;
      padding: 8px 12px;
      background: #f9fafb;
      border-radius: 6px;
      font-size: 12px;
      color: #6b7280;
    }

    .rc-comment-element-selector {
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
      color: #3b82f6;
    }

    /* Loading Spinner */
    .rc-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: rc-spin 0.6s linear infinite;
    }

    @keyframes rc-spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Empty State */
    .rc-empty {
      text-align: center;
      padding: 40px 20px;
      color: #6b7280;
    }

    .rc-empty-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      opacity: 0.5;
    }

    .rc-empty-text {
      font-size: 14px;
    }
  `;
}
