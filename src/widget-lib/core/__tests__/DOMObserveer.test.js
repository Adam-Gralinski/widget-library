import { DOMObserver } from "../DOMObserver.js";

describe("DOMObserver", () => {
  let observer;
  let mockHandlers;
  let rootElement;

  beforeEach(() => {
    mockHandlers = {
      onNodeAdded: jest.fn(),
      onNodeRemoved: jest.fn(),
    };

    rootElement = document.createElement("div");
    document.body.appendChild(rootElement);

    observer = new DOMObserver(mockHandlers);
  });

  afterEach(() => {
    observer.disconnect();
    document.body.innerHTML = "";
  });

  describe("observe", () => {
    it("should call onNodeAdded when element is added", (done) => {
      observer.observe(rootElement);

      const newElement = document.createElement("div");
      rootElement.appendChild(newElement);

      setTimeout(() => {
        try {
          expect(mockHandlers.onNodeAdded).toHaveBeenCalledWith(newElement);
          done();
        } catch (error) {
          done(error);
        }
      }, 0);
    });

    it("should call onNodeRemoved when element is removed", (done) => {
      const elementToRemove = document.createElement("div");
      rootElement.appendChild(elementToRemove);

      observer.observe(rootElement);

      elementToRemove.remove();

      setTimeout(() => {
        try {
          expect(mockHandlers.onNodeRemoved).toHaveBeenCalledWith(
            elementToRemove,
          );
          done();
        } catch (error) {
          done(error);
        }
      }, 0);
    });

    it("should observe nested elements separately when added separately", (done) => {
      observer.observe(rootElement);

      const parent = document.createElement("div");
      rootElement.appendChild(parent);

      const child = document.createElement("div");

      setTimeout(() => {
        parent.appendChild(child);

        setTimeout(() => {
          try {
            expect(mockHandlers.onNodeAdded).toHaveBeenCalledWith(parent);
            expect(mockHandlers.onNodeAdded).toHaveBeenCalledWith(child);
            done();
          } catch (error) {
            done(error);
          }
        }, 0);
      }, 0);
    });

    it("should observe parent element when added with children", (done) => {
      observer.observe(rootElement);

      const parent = document.createElement("div");
      const child = document.createElement("div");
      parent.appendChild(child);
      rootElement.appendChild(parent);

      setTimeout(() => {
        try {
          expect(mockHandlers.onNodeAdded).toHaveBeenCalledWith(parent);
          expect(mockHandlers.onNodeAdded).toHaveBeenCalledTimes(1);
          done();
        } catch (error) {
          done(error);
        }
      }, 0);
    });

    it("should not handle text nodes", (done) => {
      observer.observe(rootElement);

      rootElement.appendChild(document.createTextNode("test"));

      setTimeout(() => {
        try {
          expect(mockHandlers.onNodeAdded).not.toHaveBeenCalled();
          done();
        } catch (error) {
          done(error);
        }
      }, 0);
    });
  });

  describe("disconnect", () => {
    it("should stop observing mutations", (done) => {
      observer.observe(rootElement);

      observer.disconnect();

      const newElement = document.createElement("div");
      rootElement.appendChild(newElement);

      setTimeout(() => {
        try {
          expect(mockHandlers.onNodeAdded).not.toHaveBeenCalled();
          done();
        } catch (error) {
          done(error);
        }
      }, 0);
    });
  });
});
