import { WidgetHelper, NotificationSystem } from "../../widget-lib/index.js";

export default class WidgetB {
  async beforeSubtreeInit() {
    this.wrapper = WidgetHelper.inject(this.target, {
      className: "widget-b-content",
      html: `
                <h3>Widget B</h3>
                <p>Nested widget content</p>
                <button id="widgetBButton">Click me</button>
                <button id="removeWidgetButton">Remove ME! :(</button>
            `,
    });
  }

  async afterSubtreeInit() {
    const button = this.wrapper.querySelector("#widgetBButton");
    button.addEventListener("click", this.clickHandler);
    this.button = button;

    const removeButton = this.wrapper.querySelector("#removeWidgetButton");
    removeButton.addEventListener("click", this.removeHandler);
  }

  clickHandler() {
    console.log("Widget B button clicked");
  }

  removeHandler = () => {
    this.target.classList.add("widget-destroying");
    setTimeout(() => {
      this.target.remove();
      NotificationSystem.notify("Widget B removed", "info");
    }, 300);
  };

  destroy() {
    this.button?.removeEventListener("click", this.clickHandler);
    this.wrapper?.remove();
  }
}
