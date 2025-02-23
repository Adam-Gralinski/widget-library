/**
 * Base class for widget implementations providing core widget lifecycle functionality
 * @class
 */
export class BaseWidget {
  /**
   * Creates a new BaseWidget instance
   */
  constructor() {
    this.initialized = false;
    this.destroyed = false;
    this.initializationStage = "none"; // 'none' | 'before' | 'after' | 'complete'
  }

  /**
   * Initializes the widget with the given target element
   * @param {Element} target - The DOM element to initialize the widget with
   * @param {Function} done - Callback to be called when initialization is complete
   * @throws {Error} If widget is already initialized or was destroyed
   * @returns {Promise<void>}
   */
  async init(target, done) {
    if (this.isInitialized()) {
      throw new Error("Widget already initialized");
    }
    if (this.destroyed) {
      throw new Error("Widget was destroyed");
    }

    this.target = target;

    try {
      // First stage
      this.initializationStage = "before";
      await this.beforeSubtreeInit();

      // Wait for subtree
      await this._waitForSubtree();

      // Second stage
      this.initializationStage = "after";
      await this.afterSubtreeInit();

      // Let widget verify its state
      if (!this.verifyInitialization()) {
        throw new Error("Widget initialization verification failed");
      }

      this.initializationStage = "complete";
      this.initialized = true;
      done();
    } catch (error) {
      this.initializationStage = "none";
      this.destroy();
      throw error;
    }
  }

  /**
   * Checks if the widget is fully initialized
   * @returns {boolean} True if widget is initialized and completed all stages
   */
  isInitialized() {
    return this.initialized && this.initializationStage === "complete";
  }

  /**
   * Gets the current initialization stage of the widget
   * @returns {string} Current initialization stage ('none' | 'before' | 'after' | 'complete')
   */
  getInitializationStage() {
    return this.initializationStage;
  }

  /**
   * Verifies the widget's initialization state
   * @returns {boolean} True if initialization is valid
   * @protected
   */
  verifyInitialization() {
    return true;
  }

  /**
   * Waits for subtree initialization to complete
   * @returns {Promise<void>}
   * @private
   */
  _waitForSubtree() {
    return new Promise((resolve) => {
      this._subtreeReady = resolve;
    });
  }

  /**
   * Automatically binds methods ending with 'Handler' to the widget instance
   * @protected
   */
  _bindHandlers() {
    const proto = Object.getPrototypeOf(this);
    Object.getOwnPropertyNames(proto).forEach((name) => {
      if (name.endsWith("Handler") && typeof this[name] === "function") {
        this[name] = this[name].bind(this);
      }
    });
  }

  /**
   * Destroys the widget, cleaning up any resources
   * @protected
   */
  destroy() {
    if (!this.initialized) return;
    this.initialized = false;
    this.destroyed = true;
    this.initializationStage = "none";
  }
}
