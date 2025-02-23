import { BaseWidget } from "../base-widget.js";

describe("BaseWidget", () => {
  let widget;
  let target;

  beforeEach(() => {
    class TestWidget extends BaseWidget {
      async beforeSubtreeInit() {}
      async afterSubtreeInit() {}
    }

    widget = new TestWidget();
    target = document.createElement("div");
  });

  it("should track initialization stages", async () => {
    const initPromise = new Promise((resolve) => {
      widget.init(target, () => {
        expect(widget.isInitialized()).toBe(true);
        expect(widget.getInitializationStage()).toBe("complete");
        resolve();
      });
    });

    setTimeout(() => widget._subtreeReady(), 0);

    await initPromise;
  });

  it("should prevent multiple initializations", async () => {
    const firstInit = new Promise((resolve) => {
      widget.init(target, () => {
        resolve();
      });
    });

    setTimeout(() => widget._subtreeReady(), 0);
    await firstInit;

    let error;
    try {
      await widget.init(target, () => {});
    } catch (e) {
      error = e;
    }
    expect(error.message).toBe("Widget already initialized");
  });

  it("should bind handler methods", () => {
    class HandlerTestWidget extends BaseWidget {
      constructor() {
        super();
        this.value = "test";
      }

      clickHandler() {
        return this.value;
      }

      async beforeSubtreeInit() {}
      async afterSubtreeInit() {}
    }

    const testWidget = new HandlerTestWidget();
    testWidget._bindHandlers();

    expect(testWidget.clickHandler()).toBe("test");
  });

  it("should handle initialization failure", async () => {
    class FailingWidget extends BaseWidget {
      async beforeSubtreeInit() {
        throw new Error("Init failed");
      }

      async afterSubtreeInit() {}
    }

    const failingWidget = new FailingWidget();
    let error;

    try {
      await failingWidget.init(target, () => {});
    } catch (e) {
      error = e;
    }

    expect(error.message).toBe("Init failed");
    expect(failingWidget.isInitialized()).toBe(false);
  });

  it("should execute initialization stages in order", async () => {
    const stages = [];

    class OrderTestWidget extends BaseWidget {
      async beforeSubtreeInit() {
        stages.push("before");
      }

      async afterSubtreeInit() {
        stages.push("after");
      }
    }

    const orderWidget = new OrderTestWidget();

    const initPromise = new Promise((resolve) => {
      orderWidget.init(target, () => {
        expect(stages).toEqual(["before", "after"]);
        expect(orderWidget.getInitializationStage()).toBe("complete");
        resolve();
      });
    });

    setTimeout(() => orderWidget._subtreeReady(), 0);
    await initPromise;
  });
});
