const { TextEncoder, TextDecoder } = require("util");

// Polyfill TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill MutationObserver if needed
if (typeof global.MutationObserver === "undefined") {
  global.MutationObserver = class {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    disconnect() {}
  };
}
