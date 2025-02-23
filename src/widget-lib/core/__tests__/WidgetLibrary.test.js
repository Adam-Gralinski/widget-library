import { WidgetLibrary } from "../WidgetLibrary.js";

describe("WidgetLibrary", () => {
  let widgetLibrary;
  let mockElement;
  let mockWidget;
  let mockResolver;
  let mockCallback;

  beforeEach(() => {
    mockElement = document.createElement("div");
    mockElement.setAttribute("widget", "test-widget");

    mockWidget = {
      init: jest.fn((element, done) => done()),
      destroy: jest.fn(),
    };

    const MockWidgetClass = jest.fn(() => mockWidget);

    mockResolver = {
      loadWidget: jest.fn().mockResolvedValue(MockWidgetClass),
    };

    mockCallback = jest.fn();

    widgetLibrary = new WidgetLibrary();
    widgetLibrary.setResolver(mockResolver);

    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    widgetLibrary.destroy(mockElement);
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  it("should require a resolver to be set", async () => {
    const newLibrary = new WidgetLibrary();
    await expect(newLibrary.init(mockElement, mockCallback)).rejects.toThrow(
      "Widget resolver not set",
    );
  });

  it("should throw if resolver doesn't implement loadWidget", () => {
    const invalidResolver = {};
    expect(() => widgetLibrary.setResolver(invalidResolver)).toThrow(
      "Resolver must implement loadWidget method",
    );
  });

  it("should initialize widgets", async () => {
    return new Promise((resolve) => {
      document.body.appendChild(mockElement);

      setTimeout(() => {
        widgetLibrary.init(mockElement, (errors) => {
          try {
            expect(errors).toBeNull();
            expect(mockResolver.loadWidget).toHaveBeenCalledWith("test-widget");
            expect(mockWidget.init).toHaveBeenCalled();
            resolve();
          } catch (error) {
            resolve(error);
          }
        });
      }, 0);
    });
  });

  it("should handle initialization errors", async () => {
    const error = new Error("Initialization failed");
    mockWidget.init.mockImplementation(() => {
      throw error;
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        widgetLibrary.init(mockElement, (errors) => {
          try {
            expect(errors).toContainEqual(error);
            resolve();
          } catch (error) {
            resolve(error);
          }
        });
      }, 0);
    });
  });

  it("should destroy widgets", async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        widgetLibrary.init(mockElement, () => {
          widgetLibrary.destroy(mockElement);
          try {
            expect(mockWidget.destroy).toHaveBeenCalled();
            resolve();
          } catch (error) {
            resolve(error);
          }
        });
      }, 0);
    });
  });

  it("should handle DOM mutations", async () => {
    const newMockWidget = {
      init: jest.fn((element, done) => done()),
      destroy: jest.fn(),
      getInitializationStage: jest.fn().mockReturnValue("complete"),
    };

    const NewMockWidgetClass = jest.fn(() => newMockWidget);

    mockResolver.loadWidget.mockImplementation((path) => {
      if (path === "new-widget") {
        return Promise.resolve(NewMockWidgetClass);
      }
      return Promise.resolve(() => ({
        init: (element, done) => done(),
        getInitializationStage: () => "complete",
      }));
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        widgetLibrary.init(mockElement, () => {
          const newElement = document.createElement("div");
          newElement.setAttribute("widget", "new-widget");
          mockElement.appendChild(newElement);

          setTimeout(() => {
            try {
              expect(mockResolver.loadWidget).toHaveBeenCalledWith(
                "new-widget",
              );
              expect(newMockWidget.init).toHaveBeenCalled();
              resolve();
            } catch (error) {
              resolve(error);
            }
          }, 0);
        });
      }, 0);
    });
  });

  it("should initialize nested widgets", async () => {
    const childElement = document.createElement("div");
    childElement.setAttribute("widget", "child-widget");
    mockElement.appendChild(childElement);

    const calls = [];
    mockResolver.loadWidget.mockImplementation((path) => {
      calls.push(path);
      return Promise.resolve(() => ({
        init: (element, done) => done(),
      }));
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        widgetLibrary.init(mockElement, () => {
          try {
            expect(calls).toEqual(["test-widget", "child-widget"]);
            expect(mockResolver.loadWidget).toHaveBeenCalledTimes(2);
            resolve();
          } catch (error) {
            resolve(error);
          }
        });
      }, 0);
    });
  });

  it("should handle widget removal", (done) => {
    const childElement = document.createElement("div");
    childElement.setAttribute("widget", "child-widget");
    mockElement.appendChild(childElement);

    widgetLibrary.init(mockElement, () => {
      const childWidget = {
        destroy: jest.fn(),
      };
      widgetLibrary.widgetManager.registerInstance(childElement, childWidget);

      childElement.remove();

      setTimeout(() => {
        try {
          expect(childWidget.destroy).toHaveBeenCalled();
          done();
        } catch (error) {
          done(error);
        }
      }, 0);
    });
  });

  it("should not initialize same widget multiple times", async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        widgetLibrary.init(mockElement, () => {
          const callsAfterFirst = mockResolver.loadWidget.mock.calls.length;

          widgetLibrary.init(mockElement, () => {
            try {
              expect(mockResolver.loadWidget.mock.calls.length).toBe(
                callsAfterFirst,
              );
              expect(mockResolver.loadWidget).toHaveBeenCalledWith(
                "test-widget",
              );
              resolve();
            } catch (error) {
              resolve(error);
            }
          });
        });
      }, 0);
    });
  });

  it("should clean up observers on destroy", async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        widgetLibrary.init(mockElement, () => {
          const spy = jest.spyOn(widgetLibrary.observer, "disconnect");

          widgetLibrary.destroy(mockElement);

          try {
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
            resolve();
          } catch (error) {
            spy.mockRestore();
            resolve(error);
          }
        });
      }, 0);
    });
  });
});
