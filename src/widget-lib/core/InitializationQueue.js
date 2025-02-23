/**
 * Manages the initialization queue for widgets
 * @class
 */
export class InitializationQueue {
  /**
   * Creates an InitializationQueue instance
   * @param {Object} options - Initialization options
   * @param {WidgetManager} options.widgetManager - Widget manager instance
   * @param {WidgetTreeWalker} options.treeWalker - Tree walker instance
   */
  constructor({ widgetManager, treeWalker }) {
    this.widgetManager = widgetManager;
    this.treeWalker = treeWalker;
    this.queue = new Map();
  }

  /**
   * Initializes a widget
   * @param {Element} element - Element to initialize
   * @param {function} resolver - Function to resolve the widget class
   * @returns {Promise<void>}
   */
  async initializeWidget(element, resolver) {
    if (this.queue.has(element)) {
      return this.queue.get(element);
    }

    const initPromise = this._createInitializationPromise(element, resolver);
    this.queue.set(element, initPromise);

    try {
      await initPromise;
    } finally {
      this.queue.delete(element);
    }
  }

  /**
   * Creates an initialization promise for a widget
   * @param {Element} element - Element to initialize
   * @param {function} resolver - Function to resolve the widget class
   * @returns {Promise<void>}
   * @private
   */
  async _createInitializationPromise(element, resolver) {
    const widgetPath = this.treeWalker.getWidgetPath(element);
    const WidgetClass = await resolver(widgetPath);
    const widget = new WidgetClass();

    return new Promise(async (resolve, reject) => {
      try {
        this._markElementInitializing(element);

        await this._initializeWidgetInstance(widget, element, resolve);

        await this._initializeChildWidgets(element, resolver);

        this._completeWidgetInitialization(widget);
      } catch (error) {
        this._handleInitializationError(element, error, reject);
      } finally {
        this._cleanupInitialization(element);
      }
    });
  }

  /**
   * Marks an element as initializing
   * @param {Element} element - Element to mark as initializing
   * @private
   */
  _markElementInitializing(element) {
    this.widgetManager.markInitializing(element);
    element.classList.add("widget-initializing");
  }

  /**
   * Initializes a widget instance
   * @param {Object} widget - Widget instance to initialize
   * @param {Element} element - Element to initialize the widget for
   * @param {Function} resolve - Promise resolve function
   * @returns {Promise<void>}
   * @private
   */
  async _initializeWidgetInstance(widget, element, resolve) {
    const updateStageClass = this._createStageClassUpdater(element);

    widget.init(element, () => {
      element.classList.remove("widget-initializing");
      element.classList.add("widget-initialized");
      updateStageClass(widget.getInitializationStage());
      this.widgetManager.registerInstance(element, widget);
      resolve();
    });
  }

  /**
   * Creates a function to update stage classes
   * @param {Element} element - Element to update classes for
   * @returns {Function} Stage class updater function
   * @private
   */
  _createStageClassUpdater(element) {
    return (stage) => {
      element.classList.remove(
        "widget-stage-before",
        "widget-stage-after",
        "widget-stage-complete",
      );
      if (stage !== "none") {
        element.classList.add(`widget-stage-${stage}`);
      }
    };
  }

  /**
   * Initializes child widgets
   * @param {Element} element - Parent element
   * @param {Function} resolver - Widget resolver function
   * @returns {Promise<void>}
   * @private
   */
  async _initializeChildWidgets(element, resolver) {
    const childWidgets = this.treeWalker.findWidgetElements(element);
    await Promise.all(
      childWidgets.map((child) => this.initializeWidget(child, resolver)),
    );
  }

  /**
   * Completes widget initialization
   * @param {Object} widget - Widget instance
   * @private
   */
  _completeWidgetInitialization(widget) {
    if (widget._subtreeReady) {
      widget._subtreeReady();
    }
  }

  /**
   * Handles initialization error
   * @param {Element} element - Element that failed to initialize
   * @param {Error} error - Error that occurred
   * @param {Function} reject - Promise reject function
   * @private
   */
  _handleInitializationError(element, error, reject) {
    element.classList.add("widget-destroyed");
    reject(error);
  }

  /**
   * Cleans up after initialization
   * @param {Element} element - Element to clean up
   * @private
   */
  _cleanupInitialization(element) {
    this.widgetManager.unmarkInitializing(element);
  }
}
