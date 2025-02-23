import { X } from "../widget-lib/index.js";

export class DemoManager {
  constructor() {
    this.selectedElement = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById("root").addEventListener("click", (e) => {
      this.handleNodeSelection(e);
    });
  }

  handleNodeSelection(e) {
    if (this.selectedElement) {
      this.selectedElement.classList.remove("selected");
    }

    const target = e.target.closest("[widget], #root div");
    if (target) {
      this.selectedElement = target;
      target.classList.add("selected");
      this.updateInfo(target);
    }

    e.stopPropagation();
  }

  getRelativePath(element) {
    const path = [];
    let current = element;
    const root = document.getElementById("root");

    while (current && current !== root) {
      const parent = current.parentElement;
      if (!parent) break;

      const index = Array.from(parent.children).indexOf(current);
      path.unshift(`${current.tagName.toLowerCase()}:nth-child(${index + 1})`);
      current = parent;
    }

    return path.join(" > ") || "root";
  }

  getWidgetState(element) {
    if (!element.hasAttribute("widget")) return "Regular node";
    if (element.classList.contains("widget-initialized")) return "Initialized";
    if (element.classList.contains("widget-initializing"))
      return "Initializing";
    if (element.classList.contains("widget-destroyed")) return "Destroyed";
    return "Not initialized";
  }

  updateInfo(element) {
    document.getElementById("selectedPath").textContent =
      this.getRelativePath(element);
    document.getElementById("selectedState").textContent =
      this.getWidgetState(element);

    const info = {
      type: element.getAttribute("widget") || "regular node",
      path: this.getRelativePath(element),
      state: this.getWidgetState(element),
      children: element.querySelectorAll("[widget]").length,
      isInitializing: X.widgetManager.initializing.has(element),
      attributes: Object.fromEntries(
        Array.from(element.attributes).map((attr) => [attr.name, attr.value]),
      ),
    };

    this.updateTechInfo(info);
  }

  showError(error) {
    let errorInfo;
    if (error instanceof WidgetDestroyedError) {
      errorInfo = {
        type: "WidgetDestroyed",
        widget: error.widgetPath,
        message: error.message,
      };
    } else {
      errorInfo = {
        type: error.name,
        message: error.message,
      };
    }
    this.updateTechInfo(errorInfo);
  }

  updateTechInfo(info) {
    document.getElementById("techInfo").textContent = JSON.stringify(
      info,
      null,
      2,
    );
  }
}
