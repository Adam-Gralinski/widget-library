import { WidgetHelper, NotificationSystem } from "../../widget-lib/index.js";

export default class WidgetDelayed {
  constructor() {
    this._initStates = {
      contentRendered: false,
      processing: false,
      completed: false,
    };
  }

  async beforeSubtreeInit() {
    NotificationSystem.notify(
      "Delayed widget: Starting initialization...",
      "info",
    );

    this.wrapper = WidgetHelper.inject(this.target, {
      className: "widget-delayed-content",
      html: `
                <div class="delayed-header">
                    <h3>Delayed Widget</h3>
                    <span class="delayed-status">Stage: Before Init</span>
                </div>
                <div class="delayed-body">
                    <div class="progress-bar">
                        <div class="progress"></div>
                    </div>
                    <p class="state-info">Initializing...</p>
                </div>
                <button id="cancelBtn">Cancel Initialization</button>
            `,
      setup: (wrapper) => {
        const cancelBtn = wrapper.querySelector("#cancelBtn");
        cancelBtn.addEventListener("click", () => {
          NotificationSystem.notify("Initialization cancelled", "warning");
          this.wrapper.remove();
        });
      },
    });

    this._initStates.contentRendered = true;
    this.updateStatus("Processing will start after subtree init...");
  }

  async afterSubtreeInit() {
    this.updateStatus("Processing started (5 seconds)...");
    this._initStates.processing = true;

    try {
      await new Promise((resolve, reject) => {
        let progress = 0;
        const progressBar = this.wrapper.querySelector(".progress");

        const interval = setInterval(() => {
          progress += 2;
          progressBar.style.width = `${progress}%`;
          this.updateStatus(`Processing: ${progress}%`);

          if (progress >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, 100);

        this._processInterval = interval;
      });

      this._initStates.completed = true;
      this.updateStatus("Processing complete!");
      NotificationSystem.notify(
        "Delayed widget: Initialization complete",
        "info",
      );
    } catch (error) {
      this.updateStatus("Processing failed!");
      NotificationSystem.notify(
        "Delayed widget: Initialization failed",
        "error",
      );
      throw error;
    }
  }

  updateStatus(message) {
    const status = this.wrapper.querySelector(".delayed-status");
    const stateInfo = this.wrapper.querySelector(".state-info");
    if (status && stateInfo) {
      status.textContent = message;
      stateInfo.textContent = message;
    }
  }

  verifyInitialization() {
    const isValid = Object.values(this._initStates).every((state) => state);
    if (!isValid) {
      console.warn("Delayed widget initialization states:", this._initStates);
    }
    return isValid;
  }

  destroy() {
    if (this._processInterval) {
      clearInterval(this._processInterval);
    }
    this.wrapper?.remove();
  }
}
