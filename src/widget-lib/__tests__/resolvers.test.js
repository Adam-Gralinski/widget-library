import { DefaultResolver, RegistryResolver } from "../resolvers.js";
import { BaseWidget } from "../base-widget.js";

describe("Resolvers", () => {
  describe("RegistryResolver", () => {
    let resolver;

    beforeEach(() => {
      resolver = new RegistryResolver();
    });

    it("should register and load widgets", async () => {
      class TestWidget {
        init(element, done) {
          done();
        }
        destroy() {}
      }

      resolver.register("test/widget", TestWidget);
      const WidgetClass = await resolver.loadWidget("test/widget");

      expect(WidgetClass.prototype instanceof BaseWidget).toBe(true);
    });

    it("should throw when loading non-existent widget", async () => {
      await expect(resolver.loadWidget("non/existent")).rejects.toThrow(
        "Widget not found",
      );
    });

    it("should register multiple widgets", () => {
      const widgets = {
        TestWidget: class {},
        AnotherWidget: class {},
      };

      resolver.registerAll(widgets);

      expect(resolver.widgets.has("widgets/test")).toBe(true);
      expect(resolver.widgets.has("widgets/another")).toBe(true);
    });

    it("should bind widget methods properly", async () => {
      class TestWidget {
        constructor() {
          this.value = "test";
        }

        getValue() {
          return this.value;
        }
      }

      resolver.register("test/widget", TestWidget);
      const WidgetClass = await resolver.loadWidget("test/widget");
      const instance = new WidgetClass();

      expect(instance.getValue()).toBe("test");
    });
  });
});
