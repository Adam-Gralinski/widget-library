/**
 * Walks the DOM tree to find widget elements
 * @class
 */
export class WidgetTreeWalker {
  constructor() {
    this.widgetAttribute = "widget";
  }

  /**
   * Finds widget elements in the DOM tree
   * @param {Element} root - Root element to start the search
   * @returns {Element[]} - Array of widget elements
   */
  findWidgetElements(root) {
    const elements = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        return node.hasAttribute(this.widgetAttribute)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    });

    let node;
    while ((node = walker.nextNode())) {
      elements.push(node);
    }
    return elements;
  }

  /**
   * Gets the widget path from an element
   * @param {Element} element - Element to get the widget path from
   * @returns {string} - Widget path
   */
  getWidgetPath(element) {
    return element.getAttribute(this.widgetAttribute);
  }
}
