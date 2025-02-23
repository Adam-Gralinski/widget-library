import { InitializationQueue } from "../InitializationQueue.js";

describe("InitializationQueue", () => {
  let initQueue;
  let mockWidgetManager;
  let mockTreeWalker;
  let mockElement;
  let mockWidget;
  let mockResolver;

  beforeEach(() => {
    mockElement = document.createElement("div");
    mockElement.setAttribute("widget", "test-widget");

    mockWidget = {
      init: jest.fn(),
      getInitializationStage: jest.fn().mockReturnValue("complete"),
      _subtreeReady: jest.fn(),
    };

    const MockWidgetClass = jest.fn(() => mockWidget);

    mockResolver = jest.fn().mockResolvedValue(MockWidgetClass);

    mockWidgetManager = {
      markInitializing: jest.fn(),
      unmarkInitializing: jest.fn(),
      registerInstance: jest.fn(),
    };

    mockTreeWalker = {
      getWidgetPath: jest.fn().mockReturnValue("test-widget"),
      findWidgetElements: jest.fn().mockReturnValue([]),
    };

    initQueue = new InitializationQueue({
      widgetManager: mockWidgetManager,
      treeWalker: mockTreeWalker,
    });
  });

  describe("initializeWidget", () => {
    it("should return existing promise if widget is already in queue", async () => {
      let resolvePromise;
      const existingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      initQueue.queue.set(mockElement, existingPromise);

      const result = initQueue.initializeWidget(mockElement, mockResolver);

      resolvePromise();

      const [existingResult, initResult] = await Promise.all([
        existingPromise,
        result,
      ]);

      expect(initResult).toBe(existingResult);
      expect(mockResolver).not.toHaveBeenCalled();
    });

    it("should create new initialization promise if widget is not in queue", async () => {
      const initPromise = initQueue.initializeWidget(mockElement, mockResolver);

      expect(initPromise).toBeInstanceOf(Promise);
      expect(initQueue.queue.has(mockElement)).toBe(true);
      expect(mockResolver).toHaveBeenCalled();
    });
  });

  describe("_markElementInitializing", () => {
    it("should mark element as initializing", () => {
      initQueue._markElementInitializing(mockElement);

      expect(mockWidgetManager.markInitializing).toHaveBeenCalledWith(
        mockElement,
      );
      expect(mockElement.classList.contains("widget-initializing")).toBe(true);
    });
  });

  describe("_createStageClassUpdater", () => {
    it("should create function that updates stage classes", () => {
      const updateStageClass = initQueue._createStageClassUpdater(mockElement);

      updateStageClass("before");

      expect(mockElement.classList.contains("widget-stage-before")).toBe(true);
      expect(mockElement.classList.contains("widget-stage-after")).toBe(false);
      expect(mockElement.classList.contains("widget-stage-complete")).toBe(
        false,
      );
    });

    it("should remove all stage classes when stage is none", () => {
      const updateStageClass = initQueue._createStageClassUpdater(mockElement);
      mockElement.classList.add("widget-stage-before");

      updateStageClass("none");

      expect(mockElement.classList.contains("widget-stage-before")).toBe(false);
    });
  });

  describe("_initializeWidgetInstance", () => {
    it("should initialize widget and call resolve when done", async () => {
      const mockResolve = jest.fn();

      await initQueue._initializeWidgetInstance(
        mockWidget,
        mockElement,
        mockResolve,
      );

      expect(mockWidget.init).toHaveBeenCalled();
      mockWidget.init.mock.calls[0][1]();

      expect(mockElement.classList.contains("widget-initialized")).toBe(true);
      expect(mockWidgetManager.registerInstance).toHaveBeenCalledWith(
        mockElement,
        mockWidget,
      );
      expect(mockResolve).toHaveBeenCalled();
    });
  });

  describe("_initializeChildWidgets", () => {
    it("should initialize all child widgets", async () => {
      const childElement = document.createElement("div");
      childElement.setAttribute("widget", "child-widget");

      mockTreeWalker.findWidgetElements.mockReturnValue([childElement]);

      const childInitPromise = Promise.resolve();
      jest
        .spyOn(initQueue, "initializeWidget")
        .mockResolvedValue(childInitPromise);

      await initQueue._initializeChildWidgets(mockElement, mockResolver);

      expect(initQueue.initializeWidget).toHaveBeenCalledWith(
        childElement,
        mockResolver,
      );
      expect(mockTreeWalker.findWidgetElements).toHaveBeenCalledWith(
        mockElement,
      );
    });
  });

  describe("_completeWidgetInitialization", () => {
    it("should call _subtreeReady if it exists", () => {
      initQueue._completeWidgetInitialization(mockWidget);

      expect(mockWidget._subtreeReady).toHaveBeenCalled();
    });

    it("should not throw if _subtreeReady does not exist", () => {
      delete mockWidget._subtreeReady;

      expect(() => {
        initQueue._completeWidgetInitialization(mockWidget);
      }).not.toThrow();
    });
  });

  describe("_handleInitializationError", () => {
    it("should add destroyed class and reject with error", () => {
      const error = new Error("Test error");
      const mockReject = jest.fn();

      initQueue._handleInitializationError(mockElement, error, mockReject);

      expect(mockElement.classList.contains("widget-destroyed")).toBe(true);
      expect(mockReject).toHaveBeenCalledWith(error);
    });
  });

  describe("_cleanupInitialization", () => {
    it("should unmark element as initializing", () => {
      initQueue._cleanupInitialization(mockElement);

      expect(mockWidgetManager.unmarkInitializing).toHaveBeenCalledWith(
        mockElement,
      );
    });
  });

  describe("Error handling", () => {
    it("should handle initialization errors properly", async () => {
      const error = new Error("Initialization failed");
      mockWidget.init.mockImplementation(() => {
        throw error;
      });

      await expect(
        initQueue.initializeWidget(mockElement, mockResolver),
      ).rejects.toThrow(error);
      expect(mockElement.classList.contains("widget-destroyed")).toBe(true);
    });

    it("should cleanup even if initialization fails", async () => {
      const error = new Error("Initialization failed");
      mockWidget.init.mockImplementation(() => {
        throw error;
      });

      await expect(
        initQueue.initializeWidget(mockElement, mockResolver),
      ).rejects.toThrow(error);
      expect(mockWidgetManager.unmarkInitializing).toHaveBeenCalledWith(
        mockElement,
      );
    });
  });

  describe("Widget-controlled initialization stages", () => {
    let element;
    let widget;
    let resolver;
    let initQueue;
    let mockWidgetManager;
    let mockTreeWalker;

    beforeEach(() => {
      element = document.createElement("div");
      element.setAttribute("widget", "test-widget");

      widget = {
        init: jest.fn(),
        getInitializationStage: jest.fn().mockReturnValue("complete"),
        _subtreeReady: jest.fn(),
      };

      const WidgetClass = jest.fn(() => widget);
      resolver = jest.fn().mockResolvedValue(WidgetClass);

      mockWidgetManager = {
        markInitializing: jest.fn(),
        unmarkInitializing: jest.fn(),
        registerInstance: jest.fn(),
      };

      mockTreeWalker = {
        getWidgetPath: jest.fn().mockReturnValue("test-widget"),
        findWidgetElements: jest.fn().mockReturnValue([]),
      };

      initQueue = new InitializationQueue({
        widgetManager: mockWidgetManager,
        treeWalker: mockTreeWalker,
      });
    });

    it("should track initialization stages", (done) => {
      const classChanges = [];
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "class"
          ) {
            classChanges.push([...element.classList]);
          }
        });
      });

      observer.observe(element, { attributes: true });

      widget.init.mockImplementation((_, callback) => {
        setTimeout(() => {
          callback();

          setTimeout(() => {
            try {
              const hasInitializing = classChanges.some((classes) =>
                classes.includes("widget-initializing"),
              );
              const hasInitialized = classChanges.some((classes) =>
                classes.includes("widget-initialized"),
              );
              const hasCompleteStage = classChanges.some((classes) =>
                classes.includes("widget-stage-complete"),
              );

              expect(hasInitializing).toBe(true);
              expect(hasInitialized).toBe(true);
              expect(hasCompleteStage).toBe(true);

              observer.disconnect();
              done();
            } catch (error) {
              observer.disconnect();
              done(error);
            }
          }, 0);
        }, 0);
      });

      initQueue.initializeWidget(element, resolver);
    });

    it("should handle stage updates during initialization", (done) => {
      let initCallback;

      widget.init.mockImplementation((_, callback) => {
        initCallback = callback;
        return new Promise((resolve) => {
          setTimeout(resolve, 0);
        });
      });

      const initPromise = initQueue.initializeWidget(element, resolver);

      setTimeout(() => {
        widget.getInitializationStage.mockReturnValue("complete");
        initCallback();

        initPromise.then(() => {
          try {
            expect(element.classList.contains("widget-initialized")).toBe(true);
            expect(element.classList.contains("widget-stage-complete")).toBe(
              true,
            );
            expect(mockWidgetManager.registerInstance).toHaveBeenCalledWith(
              element,
              widget,
            );
            done();
          } catch (error) {
            done(error);
          }
        });
      }, 0);
    });

    it("should maintain stage during async initialization", (done) => {
      widget.init.mockImplementation((_, callback) => {
        setTimeout(() => {
          try {
            expect(element.classList.contains("widget-initializing")).toBe(
              true,
            );
            callback();
            done();
          } catch (error) {
            done(error);
          }
        }, 0);
      });

      initQueue.initializeWidget(element, resolver);
    });
  });
});
