import { DOMObserver } from "./DOMObserver.js";
import { WidgetTreeWalker } from "./TreeWalker.js";
import { WidgetManager } from "./WidgetManager.js";
import { InitializationQueue } from "./InitializationQueue.js";

/**
 * Main library class for managing widgets
 * @class
 */
export class WidgetLibrary {
  constructor() {
    this.treeWalker = new WidgetTreeWalker();
    this.widgetManager = new WidgetManager();
    this.initQueue = new InitializationQueue({
      widgetManager: this.widgetManager,
      treeWalker: this.treeWalker,
    });
    this.resolver = null;

    this._handleNodeAdded = this._handleNodeAdded.bind(this);
    this._handleNodeRemoved = this._handleNodeRemoved.bind(this);

    this.observer = new DOMObserver({
      onNodeAdded: this._handleNodeAdded,
      onNodeRemoved: this._handleNodeRemoved,
    });
  }

  /**
   * Sets the widget resolver
   * @param {Object} resolver - Resolver instance
   * @throws {Error} - If resolver does not implement loadWidget method
   */
  setResolver(resolver) {
    if (typeof resolver.loadWidget !== "function") {
      throw new Error("Resolver must implement loadWidget method");
    }
    this.resolver = resolver;
  }

  /**
   * Initializes the widget tree
   * @param {Element} rootElement - Root element to start initialization
   * @param {function} callback - Callback function to be called after initialization
   * @returns {Promise<void>}
   * @throws {Error[]} - If there are errors during initialization
   */
  async init(rootElement, callback) {
    if (!this.resolver) {
      throw new Error("Widget resolver not set");
    }

    try {
      this.observer.observe(rootElement);
      await this._initializeTree(rootElement);
      callback(null);
    } catch (errors) {
      callback(errors);
    }
  }

  /**
   * Destroys the widget tree
   * @param {Element} target - Target element to start destruction
   */
  destroy(target) {
    if (target === this.observer.target) {
      this.observer.disconnect();
    }
    this.widgetManager.destroyTree(target);
  }

  /**
   * Initializes the widget tree
   * @param {Element} element - Element to start initialization
   * @returns {Promise<void>}
   * @throws {Error[]} - If there are errors during initialization
   * @private
   */
  async _initializeTree(element) {
    const errors = [];
    const widgets = this.treeWalker.findWidgetElements(element);

    for (const el of widgets) {
      try {
        await this.initQueue.initializeWidget(el, (path) =>
          this.resolver.loadWidget(path),
        );
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      throw errors;
    }
  }

  /**
   * Handles node added event
   * @param {Element} node - Node that was added
   * @private
   */
  _handleNodeAdded(node) {
    if (node.hasAttribute("widget")) {
      this.initQueue.initializeWidget(node, (path) =>
        this.resolver.loadWidget(path),
      );
    }

    const widgets = this.treeWalker.findWidgetElements(node);
    widgets.forEach((el) => {
      this.initQueue.initializeWidget(el, (path) =>
        this.resolver.loadWidget(path),
      );
    });
  }

  /**
   * Handles node removed event
   * @param {Element} node - Node that was removed
   * @private
   */
  _handleNodeRemoved(node) {
    this.widgetManager.destroyTree(node);
  }

  get initializingElements() {
    return this.widgetManager.initializing;
  }

  get widgetInstances() {
    return this.widgetManager.instances;
  }
}
