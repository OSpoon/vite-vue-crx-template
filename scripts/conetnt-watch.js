(function () {
  var ws = new WebSocket(`ws://localhost:18001`);
  var timer;

  ws.onopen = function () {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      ws.send(JSON.stringify({ type: "ping" }));
    }, 5000);
    console.log(`[CONTENT_WATCH] connection established`);
  };
  ws.onmessage = function (e) {
    if (e.data === "WATCH_RELOAD" && chrome.runtime?.id) {
      chrome.runtime.sendMessage({ url: "sw://watch_reload_extend" }, (result) => {
        if (result?.url === "cs://watch_reload_page") {
          window.location.reload()
        } else {
          console.log(
            `[CONTENT_WATCH] extension reload, pls refresh the page manually`
          );
        }
      });
    }
  };
  ws.onclose = function () {
    if (timer) clearInterval(timer);
    console.log(`[CONTENT_WATCH] connection closed.`);
  };
})();
