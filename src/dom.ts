
export function isInputElement(el: Element | null): el is HTMLInputElement {
  return el instanceof HTMLInputElement;
}

export function isSelectElement(el: Element | null): el is HTMLSelectElement {
  return el instanceof HTMLSelectElement;
}

export function isTextAreaElement(
  el: Element | null,
): el is HTMLTextAreaElement {
  return el instanceof HTMLTextAreaElement;
}

export function qs<T extends Element>(
  selector: string,
  parent: ParentNode = document,
): T {
  const el = parent.querySelector<T>(selector);
  if (el === null) {
    throw new Error(`Element not found: "${selector}"`);
  }
  return el;
}

export function qsAll<T extends Element>(
  selector: string,
  parent: ParentNode = document,
): NodeListOf<T> {
  return parent.querySelectorAll<T>(selector);
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Partial<Record<string, string>> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (val !== undefined) el.setAttribute(key, val);
  }
  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  }
  return el;
}

export function show(el: HTMLElement): void {
  el.style.display = '';
}

export function hide(el: HTMLElement): void {
  el.style.display = 'none';
}

export function setVisible(el: HTMLElement, visible: boolean): void {
  visible ? show(el) : hide(el);
}
