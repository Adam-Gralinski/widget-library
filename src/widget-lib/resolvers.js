import { BaseWidget } from "./base-widget.js";

/**
 * Default resolver for loading widgets using dynamic imports
 * @class
 */
export class DefaultResolver {
  /**
   * Loads a widget class from the specified path
   * @param {string} path - Path to the widget module
   * @returns {Promise<typeof BaseWidget>} Promise resolving to the widget class
   * @throws {Error} If widget loading fails
   */
  async loadWidget(path) {
    try {
      const module = await import(`../../test-env/${path}.js`);
      return module.default;
    } catch (error) {
      throw new Error(`Failed to load widget: ${path}`);
    }
  }
}

/**
 * HTTP-based resolver for loading widgets from a remote server
 * @class
 */
class HttpResolver {
  /**
   * Creates a new HttpResolver instance
   * @param {string} baseUrl - Base URL for loading widgets
   */
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Loads a widget class from the specified path using HTTP
   * @param {string} path - Path to the widget module
   * @returns {Promise<typeof BaseWidget>} Promise resolving to the widget class
   * @throws {Error} If widget loading fails
   */
  async loadWidget(path) {
    const response = await fetch(`${this.baseUrl}/${path}.js`);
    if (!response.ok) {
      throw new Error(`Failed to load widget: ${path}`);
    }
    const text = await response.text();
    // Create module from text
    const module = new Function("exports", text);
    const exports = {};
    module(exports);
    return exports.default;
  }
}

/**
 * Registry-based resolver for pre-registered widget classes
 * @class
 */
export class RegistryResolver {
  /**
   * Creates a new RegistryResolver instance
   */
  constructor() {
    this.widgets = new Map();
  }

  /**
   * Registers a widget class for a specific path
   * @param {string} path - Path identifier for the widget
   * @param {typeof BaseWidget} WidgetClass - Widget class to register
   */
  register(path, WidgetClass) {
    const WrappedWidget = class extends BaseWidget {
      /**
       * Creates a new wrapped widget instance
       */
      constructor() {
        super();
        this.userWidget = new WidgetClass();
        this._bindUserWidgetMethods();
      }

      /**
       * Binds all methods from the user widget to maintain proper 'this' context
       * @private
       */
      _bindUserWidgetMethods() {
        // Bind all methods from userWidget prototype
        const methods = Object.getOwnPropertyNames(
          Object.getPrototypeOf(this.userWidget),
        );
        methods.forEach((method) => {
          if (
            typeof this.userWidget[method] === "function" &&
            method !== "constructor"
          ) {
            const boundMethod = this.userWidget[method].bind(this.userWidget);
            this.userWidget[method] = boundMethod;
            this[method] = boundMethod;
          }
        });

        // Also bind own properties (including arrow functions)
        Object.getOwnPropertyNames(this.userWidget).forEach((prop) => {
          const value = this.userWidget[prop];
          if (typeof value === "function") {
            const boundMethod = value.bind(this.userWidget);
            this.userWidget[prop] = boundMethod;
            this[prop] = boundMethod;
          }
        });
      }

      /**
       * Initializes the wrapped widget
       * @param {Element} target - Target element
       * @param {Function} done - Callback for completion
       */
      async init(target, done) {
        this.target = target;
        this.userWidget.target = target;
        await super.init(target, done);
      }

      /**
       * Handles pre-subtree initialization
       */
      async beforeSubtreeInit() {
        await super.beforeSubtreeInit();
        if (this.userWidget.beforeSubtreeInit) {
          this.userWidget.target = this.target;
          this.wrapper = await this.userWidget.beforeSubtreeInit();
          this.userWidget.wrapper = this.wrapper;
        }
      }

      /**
       * Handles post-subtree initialization
       */
      async afterSubtreeInit() {
        await super.afterSubtreeInit();
        if (this.userWidget.afterSubtreeInit) {
          await this.userWidget.afterSubtreeInit();
        }
      }

      /**
       * Verifies widget initialization
       * @returns {boolean} True if initialization is valid
       */
      verifyInitialization() {
        return (
          this.userWidget.verifyInitialization?.() ??
          super.verifyInitialization()
        );
      }

      /**
       * Destroys the wrapped widget
       */
      destroy() {
        if (this.userWidget.destroy) {
          this.userWidget.destroy();
        }
        super.destroy();
      }
    };

    this.widgets.set(path, WrappedWidget);
  }

  /**
   * Registers multiple widgets at once
   * @param {Object.<string, typeof BaseWidget>} widgets - Object mapping widget names to their classes
   */
  registerAll(widgets) {
    Object.values(widgets).forEach((Widget) => {
      const name = Widget.name.replace("Widget", "").toLowerCase();
      const path = `widgets/${name}`;
      this.register(path, Widget);
    });
  }

  /**
   * Loads a widget class from the registry
   * @param {string} path - Path identifier for the widget
   * @returns {Promise<typeof BaseWidget>} Promise resolving to the widget class
   * @throws {Error} If widget is not found in registry
   */
  async loadWidget(path) {
    const widget = this.widgets.get(path);
    if (!widget) {
      throw new Error(`Widget not found: ${path}`);
    }
    return widget;
  }
}
