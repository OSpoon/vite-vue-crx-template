import { immediateRoute } from "@/api/request";

console.log("service worker started !!!");

chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  // 接收来自content script的消息，requset里不允许传递function和file类型的参数
  chrome.tabs.query(
    { currentWindow: true, active: true },
    async function (_tabs) {
      const { contentRequest, message } = request;
      // 接收来自content的api请求
      if (contentRequest === "api-request") {
        const { method, path, options } = request.data;
        try {
          const data: any = await immediateRoute(method, path, options);
          sendResponse({
            _code: "success",
            data,
          });
        } catch (error) {
          if (typeof error === "string") {
            sendResponse({
              _code: "fail",
              error: {
                message: error,
              },
            });
          } else if (error instanceof Error) {
            sendResponse({
              _code: "fail",
              error: {
                message: error.message,
              },
            });
          }
        }
      }
      // WATCH 模式生效: 监听来自 background 的 reload 请求
      if (message == "WATCH_RELOAD") {
        sendResponse({ message: "WATCH_RELOAD_PAGE" });
        chrome.runtime.reload();
      }
    }
  );
  return true;
});
