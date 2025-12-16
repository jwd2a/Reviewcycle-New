import { ElementInfo } from '@reviewcycle/shared';

export function isReviewCycleElement(element: Element): boolean {
  const el = element as HTMLElement;
  return (
    el.id === 'reviewcycle-root' ||
    el.classList?.contains('rc-hover-overlay') ||
    el.closest('#reviewcycle-root') !== null
  );
}

export function generateUniqueSelector(element: HTMLElement): string {
  // Priority: ID > unique class > nth-child path
  if (element.id) {
    return `#${element.id}`;
  }

  // Try class-based selector
  const classes = Array.from(element.classList).filter(
    (c) => !c.startsWith('rc-')
  );
  if (classes.length > 0) {
    const selector = `${element.tagName.toLowerCase()}.${classes.join('.')}`;
    if (document.querySelectorAll(selector).length === 1) {
      return selector;
    }
  }

  // Fall back to nth-child path
  return getNthChildPath(element);
}

export function getNthChildPath(element: HTMLElement): string {
  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    let index = 1;
    let sibling = current.previousElementSibling;

    while (sibling) {
      if (sibling.tagName === current.tagName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }

    const tag = current.tagName.toLowerCase();
    path.unshift(`${tag}:nth-child(${index})`);
    current = current.parentElement;
  }

  return path.join(' > ');
}

export function generateXPath(element: HTMLElement): string {
  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 0;
    let sibling = current.previousSibling;

    while (sibling) {
      if (
        sibling.nodeType === Node.ELEMENT_NODE &&
        sibling.nodeName === current.nodeName
      ) {
        index++;
      }
      sibling = sibling.previousSibling;
    }

    const tagName = current.nodeName.toLowerCase();
    const pathIndex = index ? `[${index + 1}]` : '';
    parts.unshift(`${tagName}${pathIndex}`);

    current = current.parentElement;
  }

  return '/' + parts.join('/');
}

export function getAncestorPath(element: HTMLElement, levels: number = 5): ElementInfo[] {
  const ancestors: ElementInfo[] = [];
  let current: HTMLElement | null = element.parentElement;
  let count = 0;

  while (current && count < levels && current !== document.body) {
    ancestors.push({
      tag: current.tagName.toLowerCase(),
      id: current.id || undefined,
      classes: current.classList.length > 0 ? Array.from(current.classList) : undefined,
      text: current.textContent?.trim().substring(0, 50) || undefined,
    });
    current = current.parentElement;
    count++;
  }

  return ancestors;
}

export function getSiblings(element: HTMLElement): ElementInfo[] {
  const siblings: ElementInfo[] = [];
  const parent = element.parentElement;

  if (!parent) return siblings;

  let sibling = parent.firstElementChild;
  while (sibling) {
    if (sibling !== element) {
      siblings.push({
        tag: sibling.tagName.toLowerCase(),
        id: (sibling as HTMLElement).id || undefined,
        classes:
          sibling.classList.length > 0 ? Array.from(sibling.classList) : undefined,
      });
    }
    sibling = sibling.nextElementSibling;
  }

  return siblings;
}

export function getRelevantStyles(element: HTMLElement): Record<string, string> {
  const computed = window.getComputedStyle(element);
  const relevant = [
    'display',
    'position',
    'width',
    'height',
    'padding',
    'margin',
    'border',
    'background-color',
    'color',
    'font-size',
    'font-weight',
    'text-align',
  ];

  const styles: Record<string, string> = {};
  relevant.forEach((prop) => {
    const value = computed.getPropertyValue(prop);
    if (value) {
      styles[prop] = value;
    }
  });

  return styles;
}

export function getRelevantAttributes(element: HTMLElement): Record<string, string> {
  const attributes: Record<string, string> = {};
  const relevant = ['href', 'src', 'alt', 'title', 'placeholder', 'type', 'name'];

  relevant.forEach((attr) => {
    const value = element.getAttribute(attr);
    if (value) {
      attributes[attr] = value;
    }
  });

  // Include all data-* attributes
  Array.from(element.attributes).forEach((attr) => {
    if (attr.name.startsWith('data-') || attr.name.startsWith('aria-')) {
      attributes[attr.name] = attr.value;
    }
  });

  return attributes;
}
