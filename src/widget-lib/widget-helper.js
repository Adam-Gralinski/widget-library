/**
 * Helper class providing utility functions for widget implementations
 * @class
 */
export class WidgetHelper {
  /**
   * Injects HTML content into a target element while preserving existing widgets
   * @param {Element} target - The target element to inject content into
   * @param {Object} options - Injection options
   * @param {string} [options.className] - CSS class name to add to the wrapper
   * @param {string} options.html - HTML content to inject
   * @param {Function} [options.setup] - Setup function to run after injection
   * @returns {Element} The created wrapper element
   *
   * @example
   * // Basic usage - injecting simple content
   * const wrapper = WidgetHelper.inject(targetElement, {
   *   html: '<h1>Hello World</h1>'
   * });
   *
   * @example
   * // Injecting with a class name
   * const wrapper = WidgetHelper.inject(targetElement, {
   *   className: 'my-widget-content',
   *   html: '<div>Widget content</div>'
   * });
   *
   * @example
   * // Using the setup callback
   * const wrapper = WidgetHelper.inject(targetElement, {
   *   className: 'widget-wrapper',
   *   html: `
   *     <button id="myButton">Click Me</button>
   *     <div class="content"></div>
   *   `,
   *   setup: (wrapper) => {
   *     const button = wrapper.querySelector('#myButton');
   *     button.addEventListener('click', () => {
   *       wrapper.querySelector('.content').textContent = 'Button clicked!';
   *     });
   *   }
   * });
   *
   * @example
   * // Preserving existing widgets
   * class MyWidget {
   *   async beforeSubtreeInit() {
   *     // This will preserve any existing widgets in this.target
   *     this.wrapper = WidgetHelper.inject(this.target, {
   *       className: 'my-widget',
   *       html: `
   *         <h2>My Widget</h2>
   *         <div class="widget-content">
   *           <div>Some content</div>
   *           <!-- Existing widgets in this.target will be preserved -->
   *         </div>
   *       `
   *     });
   *   }
   * }
   *
   * @example
   * // Complex widget with dynamic content and event handling
   * class ComplexWidget {
   *   async beforeSubtreeInit() {
   *     this.wrapper = WidgetHelper.inject(this.target, {
   *       className: 'complex-widget',
   *       html: `
   *         <div class="widget-header">
   *           <h2>Complex Widget</h2>
   *           <button id="refreshBtn">Refresh</button>
   *         </div>
   *         <div class="widget-body">
   *           <div id="content"></div>
   *           <div class="nested-widgets"></div>
   *         </div>
   *       `,
   *       setup: (wrapper) => {
   *         // Store references to elements
   *         this.content = wrapper.querySelector('#content');
   *         this.refreshBtn = wrapper.querySelector('#refreshBtn');
   *
   *         // Set up event listeners
   *         this.refreshBtn.addEventListener('click', this.handleRefresh);
   *
   *         // Initialize content
   *         this.updateContent();
   *       }
   *     });
   *   }
   *
   *   handleRefresh = () => {
   *     this.updateContent();
   *   }
   *
   *   updateContent() {
   *     this.content.textContent = `Updated: ${new Date().toLocaleString()}`;
   *   }
   * }
   */
  static inject(target, options) {
    // Save existing widgets
    const existingWidgets = Array.from(target.children).filter((child) =>
      child.hasAttribute("widget"),
    );

    // Clear target's content
    target.innerHTML = "";

    // Create wrapper if className provided
    const wrapper = document.createElement("div");
    if (options.className) {
      wrapper.className = options.className;
    }

    // Insert HTML content
    wrapper.innerHTML = options.html;

    // Insert wrapper into target
    target.appendChild(wrapper);

    // Restore existing widgets at the end of target
    existingWidgets.forEach((widget) => {
      target.appendChild(widget);
    });

    // Execute setup function if provided
    if (options.setup) {
      options.setup(wrapper);
    }

    return wrapper;
  }
}
