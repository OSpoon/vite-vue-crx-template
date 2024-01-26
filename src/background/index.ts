import { immediateRoute } from "@/api/request";

console.log("service worker started");

chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  // 接收来自content script的消息，requset里不允许传递function和file类型的参数
  chrome.tabs.query(
    { currentWindow: true, active: true },
    async function (_tabs) {
      const { contentRequest } = request;
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
    }
  );
  return true;
});
