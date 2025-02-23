import { WidgetDestroyedError } from "./errors.js";

/**
 * Manages widget instances and their states
 * @class
 */
export class WidgetManager {
  constructor() {
    this.instances = new Map();
    this.initializing = new Set();
  }

  /**
   * Checks if an instance exists for the given element
   * @param {Element} element - Element to check
   * @returns {boolean} - True if instance exists, false otherwise
   */
  hasInstance(element) {
    return this.instances.has(element);
  }

  /**
   * Gets the instance for the given element
   * @param {Element} element - Element to get the instance for
   * @returns {Object} - Widget instance
   */
  getInstance(element) {
    return this.instances.get(element);
  }

  /**
   * Registers an instance for the given element
   * @param {Element} element - Element to register the instance for
   * @param {Object} widget - Widget instance
   */
  registerInstance(element, widget) {
    this.instances.set(element, widget);
  }

  /**
   * Marks an element as initializing
   * @param {Element} element - Element to mark as initializing
   */
  markInitializing(element) {
    this.initializing.add(element);
  }

  /**
   * Unmarks an element as initializing
   * @param {Element} element - Element to unmark as initializing
   */
  unmarkInitializing(element) {
    this.initializing.delete(element);
  }

  /**
   * Destroys the instance for the given element
   * @param {Element} element - Element to destroy the instance for
   * @throws {WidgetDestroyedError} - If the widget is being initialized
   */
  destroyInstance(element) {
    if (this.initializing.has(element)) {
      this.initializing.delete(element);
      const path = element.getAttribute("widget");
      throw new WidgetDestroyedError(path);
    }

    const widget = this.instances.get(element);
    if (widget) {
      widget.destroy();
      this.instances.delete(element);
    }
  }

  /**
   * Destroys the widget tree starting from the given root
   * @param {Element} root - Root element to start destruction
   */
  destroyTree(root) {
    const widgets = Array.from(this.instances.entries())
      .filter(([element]) => root.contains(element))
      .reverse();

    widgets.forEach(([element]) => {
      this.destroyInstance(element);
    });
  }
}
