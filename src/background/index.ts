console.log("service worker started !");

chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  // 接收来自content script的消息，requset里不允许传递function和file类型的参数
  chrome.tabs.query(
    { currentWindow: true, active: true },
    async function (_tabs) {
      const { message } = request;
      // WATCH 模式生效: 监听来自 background 的 reload 请求
      if (message == "WATCH_RELOAD") {
        sendResponse({ message: "WATCH_RELOAD_PAGE" });
        chrome.runtime.reload();
      }
    }
  );
  return true;
});
