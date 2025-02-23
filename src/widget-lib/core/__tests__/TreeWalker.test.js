import { WidgetTreeWalker } from "../TreeWalker";

describe("WidgetTreeWalker", () => {
  let treeWalker;
  let root;

  beforeEach(() => {
    treeWalker = new WidgetTreeWalker();
    root = document.createElement("div");
    document.body.appendChild(root);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("finds widget elements", () => {
    root.innerHTML = `
      <div widget="test-widget">
        <div>
          <div widget="nested-widget"></div>
        </div>
      </div>
    `;

    const widgets = treeWalker.findWidgetElements(root);
    expect(widgets).toHaveLength(2);
    expect(widgets[0].getAttribute("widget")).toBe("test-widget");
    expect(widgets[1].getAttribute("widget")).toBe("nested-widget");
  });
});
