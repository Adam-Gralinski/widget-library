# NOTE

THIS IS NOT A LIBRARY THAT WILL BE PUBLISHED TO NPM.
NOR SHOULD NOT BE USED IN REAL APPLICATIONS SINCE IT WON"T BE FURTHER DEVELOPED.

# Widget Library

A ~~lightweight~~, environment-agnostic library for managing dynamic widget initialization and lifecycle in both browser and Node.js environments.

## Features

- 🌍 Environment agnostic (works in browser and Node.js)
- 🔄 Automatic widget initialization and cleanup
- 🌲 Handles nested widget structures
- 🎯 Precise control over widget lifecycle
- 🔍 DOM mutation observation
- ⚡ Async initialization support
- 🛡️ Built-in error handling
- 🔌 Flexible widget loading strategies

## Installation for development

```bash
npm install
```

## Quick Start

```js
import { X, RegistryResolver } from "widget-lib";
import MyWidget from "./widgets/MyWidget";

// Register your widgets
const registry = new RegistryResolver();
registry.register("widgets/my-widget", MyWidget);

// Configure the library
X.setResolver(registry);

// Initialize widgets
X.init(document.getElementById("root"), (errors) => {
  if (errors) {
    console.error("Initialization failed:", errors);
  } else {
    console.log("All widgets initialized successfully");
  }
});
```

## Creating Widgets

Widgets can be created as simple classes with lifecycle methods:

```js
import { WidgetHelper } from "widget-lib";

export default class MyWidget {
  async beforeSubtreeInit() {
    this.wrapper = WidgetHelper.inject(this.target, {
      className: "my-widget",
      html: `
        <h2>My Widget</h2>
        <button id="actionBtn">Click Me</button>
        <div class="content"></div>
      `,
      setup: (wrapper) => {
        const btn = wrapper.querySelector("#actionBtn");
        btn.addEventListener("click", this.handleClick);
      },
    });
  }

  async afterSubtreeInit() {
    // Called after all child widgets are initialized
    this.wrapper.querySelector(".content").textContent = "Ready!";
  }

  handleClick = () => {
    console.log("Button clicked!");
  };

  destroy() {
    // Cleanup when widget is removed
    this.wrapper?.remove();
  }
}
```

## HTML Structure

```html
<div id="root">
  <div widget="widgets/my-widget">
    <!-- Widget content will be injected here -->
  </div>
</div>
```

## Widget Loading Strategies

### Registry Resolver

Best for bundled applications where widgets are part of the codebase:

```js
const registry = new RegistryResolver();
registry.registerAll({
  MyWidget,
  AnotherWidget,
  // ... more widgets
});
```

### Dynamic Import Resolver

For code-splitting and dynamic loading:

```js
class DynamicResolver {
  async loadWidget(path) {
    const module = await import(`./widgets/${path}.js`);
    return module.default;
  }
}

X.setResolver(new DynamicResolver());
```

## Widget Lifecycle

1. **Initialization**

   - `beforeSubtreeInit`: Setup widget structure
   - Child widgets initialization
   - `afterSubtreeInit`: Post-initialization tasks

2. **Destruction**
   - Automatic cleanup on removal
   - Manual destruction via `X.destroy(element)`

## Widget Helper Features

The `WidgetHelper` provides utilities for widget implementation:

```js
WidgetHelper.inject(target, {
  className: "widget-wrapper",
  html: "<div>Content</div>",
  setup: (wrapper) => {
    // Setup code runs after injection
  },
});
```

## Advanced Features

### Notification System

```js
import { NotificationSystem } from "widget-lib";

NotificationSystem.notify("Operation completed", "success");
NotificationSystem.notify("Something went wrong", "error");
```

### Initialization Stages

Monitor widget initialization stages:

```js
widget.getInitializationStage(); // 'before' | 'after' | 'complete'
```

### Error Handling

```js
X.init(element, (errors) => {
  if (errors) {
    errors.forEach((error) => {
      if (error instanceof WidgetDestroyedError) {
        console.warn("Widget was destroyed during initialization");
      }
    });
  }
});
```

## Best Practices

1. Always implement `destroy` method for cleanup
2. Use `WidgetHelper` for consistent DOM manipulation
3. Handle initialization errors appropriately
4. Keep widgets focused and modular
5. Use proper lifecycle methods for setup and teardown

## Features breakdown

Please visit the `/widget-lib/code/FEATURES.md` file for a detailed breakdown of the library features and their implementations.
