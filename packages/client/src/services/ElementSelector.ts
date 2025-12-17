import { ElementContext } from 'reviewcycle-shared';
import {
  isReviewCycleElement,
  generateUniqueSelector,
  generateXPath,
  getAncestorPath,
  getSiblings,
  getRelevantStyles,
  getRelevantAttributes,
} from '../utils/dom.js';
import { getElementPosition } from '../utils/positioning.js';

export class ElementSelector {
  private isActive = false;
  private hoverOverlay: HTMLElement | null = null;
  private onSelect?: (context: ElementContext) => void;

  constructor(onSelect?: (context: ElementContext) => void) {
    this.onSelect = onSelect;
  }

  activate(onSelect?: (context: ElementContext) => void): void {
    if (this.isActive) return;

    if (onSelect) {
      this.onSelect = onSelect;
    }

    this.isActive = true;
    this.createHoverOverlay();

    document.addEventListener('mousemove', this.handleMouseMove, { capture: true });
    document.addEventListener('click', this.handleClick, { capture: true });
    document.body.style.cursor = 'crosshair';
  }

  deactivate(): void {
    if (!this.isActive) return;

    this.isActive = false;
    this.removeHoverOverlay();

    document.removeEventListener('mousemove', this.handleMouseMove, { capture: true });
    document.removeEventListener('click', this.handleClick, { capture: true });
    document.body.style.cursor = '';
  }

  private createHoverOverlay(): void {
    if (this.hoverOverlay) return;

    this.hoverOverlay = document.createElement('div');
    this.hoverOverlay.className = 'rc-hover-overlay';
    this.hoverOverlay.style.display = 'none';
    document.body.appendChild(this.hoverOverlay);
  }

  private removeHoverOverlay(): void {
    if (this.hoverOverlay) {
      this.hoverOverlay.remove();
      this.hoverOverlay = null;
    }
  }

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isActive || !this.hoverOverlay) return;

    const element = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
    if (!element || isReviewCycleElement(element)) {
      this.hoverOverlay.style.display = 'none';
      return;
    }

    const bounds = element.getBoundingClientRect();
    this.hoverOverlay.style.display = 'block';
    this.hoverOverlay.style.left = `${bounds.left + window.scrollX}px`;
    this.hoverOverlay.style.top = `${bounds.top + window.scrollY}px`;
    this.hoverOverlay.style.width = `${bounds.width}px`;
    this.hoverOverlay.style.height = `${bounds.height}px`;
  };

  private handleClick = (e: MouseEvent): void => {
    if (!this.isActive) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const element = e.target as HTMLElement;
    if (!element || isReviewCycleElement(element)) {
      return;
    }

    const context = this.captureElementContext(element);
    this.deactivate();

    if (this.onSelect) {
      this.onSelect(context);
    }
  };

  captureElementContext(element: HTMLElement): ElementContext {
    return {
      selector: generateUniqueSelector(element),
      xpath: generateXPath(element),
      boundingRect: getElementPosition(element),
      computedStyles: getRelevantStyles(element),
      textContent: element.textContent?.trim() || undefined,
      attributes: getRelevantAttributes(element),
      ancestorPath: getAncestorPath(element, 5),
      siblings: getSiblings(element),
    };
  }
}
