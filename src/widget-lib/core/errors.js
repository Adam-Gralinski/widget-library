export class WidgetDestroyedError extends Error {
  constructor(widgetPath) {
    super(`Widget "${widgetPath}" was destroyed during initialization`);
    this.name = "WidgetDestroyedError";
    this.widgetPath = widgetPath;
  }
}
