import { WidgetHelper, NotificationSystem } from "../../widget-lib/index.js";

export default class WidgetComplex {
  constructor() {
    this._state = {
      contentReady: false,
      dataLoaded: false,
      eventsBound: false,
    };
    this.counter = 1;
  }

  async loadData() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const items = [
      `Item ${this.counter} - ${new Date().toLocaleTimeString()}`,
      `Item ${this.counter + 1} - ${new Date().toLocaleTimeString()}`,
      `Item ${this.counter + 2} - ${new Date().toLocaleTimeString()}`,
    ];
    this.counter += 3;
    return {
      title: "Complex Widget",
      items,
    };
  }

  async beforeSubtreeInit() {
    const data = await this.loadData();
    this._state.dataLoaded = true;

    this.wrapper = WidgetHelper.inject(this.target, {
      className: "widget-complex-content",
      html: `
                <div class="complex-header">
                    <h2>${data.title}</h2>
                    <span class="status">Initializing...</span>
                </div>
                <div class="complex-body">
                    <ul id="itemsList">
                        ${data.items.map((item) => `<li>${item}</li>`).join("")}
                    </ul>
                    <div class="nested-widgets"></div>
                    <div class="controls">
                        <button id="addNestedBtn">Add Widget</button>
                        <button id="toggleDataBtn">Refresh Data</button>
                    </div>
                </div>
            `,
      setup: (wrapper) => {
        console.log("Setting up complex widget...");
        const addNestedBtn = wrapper.querySelector("#addNestedBtn");
        const toggleDataBtn = wrapper.querySelector("#toggleDataBtn");
        const status = wrapper.querySelector(".status");
        const nestedWidgets = wrapper.querySelector(".nested-widgets");
        const itemsList = wrapper.querySelector("#itemsList");

        addNestedBtn.addEventListener("click", () => {
          console.log("Adding nested widget...");
          const widget = document.createElement("div");
          widget.setAttribute("widget", "widgets/a");
          nestedWidgets.appendChild(widget);
          NotificationSystem.notify("Added new widget", "info");
        });

        toggleDataBtn.addEventListener("click", async () => {
          console.log("Refreshing data...");
          status.textContent = "Refreshing...";
          status.classList.add("loading");

          try {
            const newData = await this.loadData();
            itemsList.innerHTML = newData.items
              .map((item) => `<li>${item}</li>`)
              .join("");

            status.textContent = "Ready";
            status.classList.remove("loading");
            NotificationSystem.notify("Data refreshed", "info");
          } catch (error) {
            console.error("Refresh error:", error);
            status.textContent = "Error";
            status.classList.remove("loading");
            NotificationSystem.notify("Failed to refresh data", "error");
          }
        });

        this.addNestedBtn = addNestedBtn;
        this.toggleDataBtn = toggleDataBtn;
        this.status = status;
        this.itemsList = itemsList;
      },
    });

    this._state.contentReady = true;
    return this.wrapper;
  }

  async afterSubtreeInit() {
    this.status.textContent = "Ready";
    this._state.eventsBound = true;
  }

  destroy() {
    this.wrapper?.remove();
  }
}
