// assets/hook.js (MAIN world)
(function () {
  const sendToExtension = (source, message, stack) => {
    window.postMessage(
      {
        type: "FROM_PAGE_ERROR",
        source,
        message: typeof message === "object" ? JSON.stringify(message) : String(message),
        stack: stack || (new Error().stack),
      },
      "*"
    );
  };

  const postEvent = (event) => {
    window.postMessage({ type: "FROM_PAGE_EVENT", event }, "*");
  };

  const sanitizeUrl = (raw) => {
    try {
      const u = new URL(raw, location.href);
      u.search = ""; // 필요 시 allowlist 방식으로 일부만 남기기
      return u.toString();
    } catch {
      return String(raw);
    }
  };

  const rawFetch = window.fetch;
  if (typeof rawFetch === "function") {
    window.fetch = async function (...args) {
      const ts = Date.now();
      const start = performance.now();

      let method = "GET";
      let url = "";

      try {
        const input = args[0];
        const init = args[1];

        if (typeof input === "string") {
          url = input;
        } else if (input && typeof Request !== "undefined" && input instanceof Request) {
          url = input.url;
          method = input.method || method;
        } else {
          url = String(input);
        }

        if (init && init.method) method = init.method;

        const res = await rawFetch.apply(this, args);

        const durationMs = Math.round(performance.now() - start);
        postEvent({
          kind: "network",
          ts,
          transport: "fetch",
          phase: "end",
          method,
          url: sanitizeUrl(url),
          status: res.status,
          ok: res.ok,
          durationMs,
        });

        return res;
      } catch (err) {
        const durationMs = Math.round(performance.now() - start);

        postEvent({
          kind: "network",
          ts,
          transport: "fetch",
          phase: "end",
          method,
          url: sanitizeUrl(url),
          durationMs,
          errorType: "reject",
        });

        sendToExtension("network", `[FETCH_REJECT] ${method} ${sanitizeUrl(url)} :: ${String(err)}`, err && err.stack);

        throw err;
      }
    };
  }

  const XHR = window.XMLHttpRequest;
  if (XHR && XHR.prototype) {
    const rawOpen = XHR.prototype.open;
    const rawSend = XHR.prototype.send;

    XHR.prototype.open = function (method, url /*, async, user, password */) {
      try {
        this.__bt_method = String(method || "GET").toUpperCase();
        this.__bt_url = sanitizeUrl(url);
      } catch {
        this.__bt_method = "GET";
        this.__bt_url = "";
      }
      return rawOpen.apply(this, arguments);
    };

    XHR.prototype.send = function (body) {
      const ts = Date.now();
      const start = performance.now();
      const xhr = this;

      const finalize = (extra) => {
        const durationMs = Math.round(performance.now() - start);
        const status = typeof xhr.status === "number" ? xhr.status : undefined;
        const method = xhr.__bt_method || "GET";
        const url = xhr.__bt_url || "";

        postEvent({
          kind: "network",
          ts,
          transport: "xhr",
          phase: "end",
          method,
          url,
          status,
          ok: typeof status === "number" ? (status >= 200 && status < 300) : undefined,
          durationMs,
          ...(extra || {}),
        });
      };

      // loadend는 성공/실패 모두 호출
      xhr.addEventListener("loadend", function () {
        console.log("[BugTrace-Hook] XHR end:", xhr.status, xhr.__bt_method, xhr.__bt_url);
        console.log('어이구 왜 안되냐!')
        finalize();
      });

      xhr.addEventListener("timeout", function () {
        finalize({ errorType: "timeout" });
        sendToExtension("network", `[XHR_TIMEOUT] ${xhr.__bt_method} ${xhr.__bt_url}`);
      });

      xhr.addEventListener("abort", function () {
        finalize({ errorType: "abort" });
      });

      xhr.addEventListener("error", function () {
        finalize({ errorType: "error" });
        sendToExtension("network", `[XHR_ERROR] ${xhr.__bt_method} ${xhr.__bt_url}`);
      });

      return rawSend.apply(this, arguments);
    };
  }

  window.addEventListener("error", (e) => {
    // resource error는 e.error가 없을 수 있음
    sendToExtension("runtime", e.message || "Unknown error", e.error && e.error.stack);
  });

  window.addEventListener("unhandledrejection", (e) => {
    sendToExtension("promise", e.reason);
  });

  const rawError = console.error;
  console.error = (...args) => {
    sendToExtension("console", args.map(String).join(" "));
    rawError.apply(console, args);
  };

  console.log("[BugTrace] Page Hook Injected Successfully");
  window.postMessage({ type: "FROM_PAGE_ERROR", source: "debug", message: "HOOK_LOADED" }, "*");
})();