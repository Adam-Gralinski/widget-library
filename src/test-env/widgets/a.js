import { WidgetHelper, NotificationSystem } from "../../widget-lib/index.js";

export default class WidgetA {
  constructor() {
    this._initialized = false;
    this._initializationChecks = {
      contentRendered: false,
      eventsBound: false,
      childrenReady: false,
    };
  }

  isInitialized() {
    return (
      this._initialized &&
      Object.values(this._initializationChecks).every((check) => check)
    );
  }

  async beforeSubtreeInit() {
    this.wrapper = WidgetHelper.inject(this.target, {
      className: "widget-a-content",
      html: `
                <h2>Widget A</h2>
                <p>This is widget A content</p>
                <div class="child-widget-container">
                    <span>child widget:</span>
                    <div widget="widgets/c"></div>
                </div>
                <button id="widgetAButton">Click me</button>
                <button id="addWidgetButton">Add Widget B</button>
                <button id="removeWidgetButton">Remove child Widget (c)</button>
            `,
    });
    this._initializationChecks.contentRendered = true;
  }

  async afterSubtreeInit() {
    const button = this.wrapper.querySelector("#widgetAButton");
    button.addEventListener("click", this.clickHandler);
    this.button = button;

    const addButton = this.wrapper.querySelector("#addWidgetButton");
    addButton.addEventListener("click", this.addWidgetHandler);

    const removeButton = this.wrapper.querySelector("#removeWidgetButton");
    removeButton.addEventListener("click", this.removeWidgetHandler);

    this._initializationChecks.eventsBound = true;
    this._initializationChecks.childrenReady = true;
    this._initialized = true;
  }

  verifyInitialization() {
    const isValid = this.isInitialized();
    if (!isValid) {
      console.warn(
        "Widget A initialization checks:",
        this._initializationChecks,
      );
    }
    return isValid;
  }

  clickHandler = () => {
    console.log("Widget A button clicked");
  };

  addWidgetHandler = () => {
    const newWidget = document.createElement("div");
    newWidget.setAttribute("widget", "widgets/b");
    this.wrapper.appendChild(newWidget);
  };

  removeWidgetHandler = () => {
    const widgetC = this.wrapper.querySelector('[widget="widgets/c"]');
    if (widgetC) {
      widgetC.classList.add("widget-destroying");
      setTimeout(() => {
        widgetC.remove();
        NotificationSystem.notify("Widget C removed", "info");
      }, 300);
    }
  };

  destroy() {
    try {
      this.button?.removeEventListener("click", this.clickHandler);
      this.wrapper?.remove();
    } catch (error) {
      console.warn("Error during widget destruction:", error);
    }
  }
}
