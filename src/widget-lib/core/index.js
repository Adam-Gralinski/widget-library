import { WidgetLibrary } from "./WidgetLibrary.js";
import { WidgetManager } from "./WidgetManager.js";
import { WidgetTreeWalker } from "./TreeWalker.js";
import { DOMObserver } from "./DOMObserver.js";
import { InitializationQueue } from "./InitializationQueue.js";

// Create single instance
const widgetLibrary = new WidgetLibrary();

// Export the instance
export const X = widgetLibrary;

// Export classes for extensibility
export {
  WidgetLibrary,
  WidgetManager,
  WidgetTreeWalker,
  DOMObserver,
  InitializationQueue,
};
