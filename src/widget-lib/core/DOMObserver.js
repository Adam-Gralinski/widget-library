/**
 * Handles DOM mutations for widget lifecycle
 * @class
 */
export class DOMObserver {
  /**
   * Creates a DOMObserver instance
   * @param {Object} handlers - Mutation handlers
   * @param {function} handlers.onNodeAdded - Handler for added nodes
   * @param {function} handlers.onNodeRemoved - Handler for removed nodes
   */
  constructor({ onNodeAdded, onNodeRemoved }) {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            onNodeAdded(node);
          }
        });

        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            onNodeRemoved(node);
          }
        });
      });
    });
  }

  /**
   * Starts observing DOM mutations
   * @param {Element} target - Element to observe
   * @example
   * const observer = new DOMObserver({
   *     onNodeAdded: (node) => console.log('Added:', node),
   *     onNodeRemoved: (node) => console.log('Removed:', node)
   * });
   * observer.observe(document.body);
   */
  observe(target) {
    this.observer.observe(target, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Stops observing DOM mutations
   */
  disconnect() {
    this.observer.disconnect();
  }
}
