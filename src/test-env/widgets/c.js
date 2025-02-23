import { WidgetHelper } from "../../widget-lib/index.js";

export default class WidgetC {
  async beforeSubtreeInit() {
    this.wrapper = WidgetHelper.inject(this.target, {
      className: "widget-c-content",
      html: `
                <h3>Widget C</h3>
                <p>Sibling widget content</p>
                <button id="widgetCButton">Click me</button>
            `,
    });
  }

  async afterSubtreeInit() {
    this.button = this.wrapper.querySelector("#widgetCButton");
    this.button.addEventListener("click", this.clickHandler);
  }

  clickHandler = () => {
    console.log("Widget C button clicked");
  };

  destroy() {
    this.button?.removeEventListener("click", this.clickHandler);
    this.wrapper?.remove();
  }
}
