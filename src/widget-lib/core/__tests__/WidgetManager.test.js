import { WidgetManager } from "../WidgetManager.js";
import { WidgetDestroyedError } from "../errors.js";

describe("WidgetManager", () => {
  let widgetManager;
  let mockElement;
  let mockWidget;

  beforeEach(() => {
    widgetManager = new WidgetManager();
    mockElement = document.createElement("div");
    mockWidget = {
      destroy: jest.fn(),
    };
  });

  it("should track initializing elements", () => {
    widgetManager.markInitializing(mockElement);

    expect(widgetManager.initializing.has(mockElement)).toBe(true);

    widgetManager.unmarkInitializing(mockElement);

    expect(widgetManager.initializing.has(mockElement)).toBe(false);
  });

  it("should manage widget instances", () => {
    widgetManager.registerInstance(mockElement, mockWidget);

    expect(widgetManager.hasInstance(mockElement)).toBe(true);
    expect(widgetManager.getInstance(mockElement)).toBe(mockWidget);
  });

  it("should destroy single widget instance", () => {
    widgetManager.registerInstance(mockElement, mockWidget);
    widgetManager.destroyInstance(mockElement);

    expect(mockWidget.destroy).toHaveBeenCalled();
    expect(widgetManager.hasInstance(mockElement)).toBe(false);
  });

  it("should throw WidgetDestroyedError when destroying initializing widget", () => {
    widgetManager.markInitializing(mockElement);
    mockElement.setAttribute("widget", "test-widget");

    expect(() => widgetManager.destroyInstance(mockElement)).toThrow(
      WidgetDestroyedError,
    );
    expect(widgetManager.initializing.has(mockElement)).toBe(false);
  });

  it("should destroy widget tree in reverse order", () => {
    const parent = document.createElement("div");
    const child = document.createElement("div");
    parent.appendChild(child);

    const parentWidget = { destroy: jest.fn() };
    const childWidget = { destroy: jest.fn() };

    widgetManager.registerInstance(parent, parentWidget);
    widgetManager.registerInstance(child, childWidget);

    widgetManager.destroyTree(parent);

    const destroyCalls = jest.mocked(childWidget.destroy).mock
      .invocationCallOrder[0];
    const parentDestroyCalls = jest.mocked(parentWidget.destroy).mock
      .invocationCallOrder[0];

    expect(destroyCalls).toBeLessThan(parentDestroyCalls);
    expect(widgetManager.hasInstance(parent)).toBe(false);
    expect(widgetManager.hasInstance(child)).toBe(false);
  });

  it("should throw when widget has no destroy method", () => {
    const widgetWithoutDestroy = {};
    widgetManager.registerInstance(mockElement, widgetWithoutDestroy);

    expect(() => widgetManager.destroyInstance(mockElement)).toThrow(TypeError);
  });

  it("should ignore non-registered elements in destroy operations", () => {
    expect(() => widgetManager.destroyInstance(mockElement)).not.toThrow();
  });
});

describe("Post-destruction state", () => {
  let parentElement;
  let childElement;
  let parentWidget;
  let childWidget;
  let widgetManager;

  beforeEach(() => {
    widgetManager = new WidgetManager();
    parentElement = document.createElement("div");
    childElement = document.createElement("div");
    parentElement.appendChild(childElement);

    parentWidget = {
      init: jest.fn(),
      destroy: jest.fn(),
    };
    childWidget = {
      init: jest.fn(),
      destroy: jest.fn(),
    };

    widgetManager.registerInstance(parentElement, parentWidget);
    widgetManager.registerInstance(childElement, childWidget);
  });

  it("should remove all instances after tree destruction", () => {
    widgetManager.destroyTree(parentElement);

    expect(widgetManager.hasInstance(parentElement)).toBe(false);
    expect(widgetManager.hasInstance(childElement)).toBe(false);
  });

  it("should allow re-initialization after destruction", () => {
    widgetManager.destroyTree(parentElement);

    const newParentWidget = { init: jest.fn(), destroy: jest.fn() };
    widgetManager.registerInstance(parentElement, newParentWidget);

    expect(widgetManager.hasInstance(parentElement)).toBe(true);
    expect(widgetManager.getInstance(parentElement)).toBe(newParentWidget);
  });

  it("should maintain proper state when destroying subtrees", () => {
    const siblingElement = document.createElement("div");
    const siblingWidget = { init: jest.fn(), destroy: jest.fn() };
    parentElement.appendChild(siblingElement);
    widgetManager.registerInstance(siblingElement, siblingWidget);

    widgetManager.destroyTree(childElement);

    expect(widgetManager.hasInstance(childElement)).toBe(false);
    expect(widgetManager.hasInstance(parentElement)).toBe(true);
    expect(widgetManager.hasInstance(siblingElement)).toBe(true);
  });
});
