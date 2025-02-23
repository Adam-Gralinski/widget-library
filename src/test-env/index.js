import { X, RegistryResolver } from "../widget-lib/index.js";
import * as widgets from "./widgets/index.js";
import { DemoManager } from "./demo-manager.js";

const registry = new RegistryResolver();
registry.registerAll(widgets);
X.setResolver(registry);

const root = document.getElementById("root");
X.init(root, (errors) => {
  if (errors) {
    console.error("Initialization failed:", errors);
  } else {
    console.log("All widgets initialized successfully");
  }
});

// Complex widget - uncomment to test together with the code in index.html
// no need to remove other parts
// const complexContainer = document.getElementById("complex-container");
// X.init(complexContainer, (errors) => {
//   if (errors) {
//     console.error("Complex widget initialization failed:", errors);
//   } else {
//     console.log("Complex widget initialized successfully");
//   }
// });

new DemoManager();
