// src/content/hook.ts
(function () {
  const sendToExtension = (source, message, stack) => {
    window.postMessage(
      {
        type: "FROM_PAGE_ERROR",
        source,
        message: typeof message === "object" ? JSON.stringify(message) : String(message),
        stack: stack || new Error().stack,
      },
      "*"
    );
  };

  window.addEventListener("error", (e) => sendToExtension("runtime", e.message, e.error?.stack));
  window.addEventListener("unhandledrejection", (e) => sendToExtension("promise", e.reason));

  const rawError = console.error;
  console.error = (...args) => {
    sendToExtension("console", args.map(String).join(" "));
    rawError.apply(console, args);
  };

  console.log("[BugTrace] Page Hook Injected Successfully");
  window.postMessage({ type: "FROM_PAGE_ERROR", source: "debug", message: "HOOK_LOADED" }, "*");
})();
