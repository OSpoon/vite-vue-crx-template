import { immediateRoute } from "@/api/fatch";

chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  // 接收来自content script的消息，requset里不允许传递function和file类型的参数
  chrome.tabs.query({ currentWindow: true, active: true }, function (_tabs) {
    const { contentRequest } = request;
    // 接收来自content的api请求
    if (contentRequest === "api-request") {
      let data = request.data;
      // 发起请求
      immediateRoute(data.url, data.method, data.body, {
        success: (data: any) => {
          data._code = "success";
          sendResponse(data);
        },
        fail: (error: any) => {
          let message = "未知错误";
          if (typeof error === "string") {
            message = error;
          } else if (error instanceof Error) {
            message = error.message;
          }
          sendResponse({
            _code: "fail",
            message,
          });
        },
      });
    }
  });
  return true;
});
