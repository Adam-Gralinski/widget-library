import { WidgetLibrary } from "../WidgetLibrary.js";

describe("Complex Tree Initialization", () => {
  let widgetLibrary;
  let rootElement;
  let mockResolver;

  beforeEach(() => {
    widgetLibrary = new WidgetLibrary();
    rootElement = document.createElement("div");
    document.body.appendChild(rootElement);
  });

  afterEach(() => {
    widgetLibrary.destroy(rootElement);
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  it("should handle deep nested widget structures", (done) => {
    const structure = createDeepStructure(3);
    rootElement.appendChild(structure.element);

    const initOrder = [];
    mockResolver = createMockResolver(initOrder);
    widgetLibrary.setResolver(mockResolver);

    setTimeout(() => {
      widgetLibrary.init(rootElement, (errors) => {
        try {
          expect(errors).toBeNull();
          expect(initOrder).toEqual(["level-0", "level-1", "level-2"]);
          done();
        } catch (error) {
          done(error);
        }
      });
    }, 0);
  });

  it("should handle sibling widgets initialization", (done) => {
    const structure = createSiblingStructure(3);
    rootElement.appendChild(structure.element);

    const initOrder = [];
    mockResolver = createMockResolver(initOrder);
    widgetLibrary.setResolver(mockResolver);

    setTimeout(() => {
      widgetLibrary.init(rootElement, (errors) => {
        try {
          expect(errors).toBeNull();
          expect(initOrder.length).toBe(3);
          done();
        } catch (error) {
          done(error);
        }
      });
    }, 0);
  });

  it("should handle mixed nested and sibling widgets", (done) => {
    const structure = createMixedStructure();
    rootElement.appendChild(structure.element);

    const initOrder = [];
    mockResolver = createMockResolver(initOrder);
    widgetLibrary.setResolver(mockResolver);

    setTimeout(() => {
      widgetLibrary.init(rootElement, (errors) => {
        try {
          expect(errors).toBeNull();
          expect(initOrder.length).toBe(structure.widgetCount);
          done();
        } catch (error) {
          done(error);
        }
      });
    }, 0);
  });
});

// Helper functions
function createDeepStructure(levels) {
  let current = document.createElement("div");
  current.setAttribute("widget", `level-0`);
  let parent = current;

  for (let i = 1; i < levels; i++) {
    const child = document.createElement("div");
    child.setAttribute("widget", `level-${i}`);
    parent.appendChild(child);
    parent = child;
  }

  return {
    element: current,
    widgetCount: levels,
  };
}

function createSiblingStructure(count) {
  const parent = document.createElement("div");

  for (let i = 0; i < count; i++) {
    const sibling = document.createElement("div");
    sibling.setAttribute("widget", `sibling-${i}`);
    parent.appendChild(sibling);
  }

  return {
    element: parent,
    widgetCount: count,
  };
}

function createMixedStructure() {
  const root = document.createElement("div");
  root.setAttribute("widget", "root");

  const sibling1 = document.createElement("div");
  sibling1.setAttribute("widget", "sibling-1");

  const sibling2 = document.createElement("div");
  sibling2.setAttribute("widget", "sibling-2");

  const nested = document.createElement("div");
  nested.setAttribute("widget", "nested");
  sibling2.appendChild(nested);

  root.appendChild(sibling1);
  root.appendChild(sibling2);

  return {
    element: root,
    widgetCount: 4,
  };
}

function createMockResolver(initOrder) {
  return {
    loadWidget: jest.fn().mockImplementation((path) => {
      return Promise.resolve(
        class MockWidget {
          constructor() {
            this.getInitializationStage = () => "complete";
          }

          init(element, done) {
            initOrder.push(path);
            setTimeout(done, 0);
          }

          destroy() {}
        },
      );
    }),
  };
}
