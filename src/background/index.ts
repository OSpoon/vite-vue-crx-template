/*global chrome*/
import { immediateRoute } from "@/api";
// manifest.json的Permissions配置需添加declarativeContent权限
// chrome.runtime.onInstalled.addListener(function () {
//   // 默认先禁止Page Action。如果不加这一句，则无法生效下面的规则
//   chrome.action.disable();
//   chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
//     // 设置规则
//     let rule = {
//       // 运行插件运行的页面URL规则
//       conditions: [
//         new chrome.declarativeContent.PageStateMatcher({
//           pageUrl: {
//             // 适配所有域名以“www.”开头的网页
//             // hostPrefix: 'www.'
//             // 适配所有域名以“.element-plus.org”结尾的网页
//             // hostSuffix: '.element-plus.org',
//             // 适配域名为“element-plus.org”的网页
//             hostEquals: "element-plus.org",
//             // 适配https协议的网页
//             // schemes: ['https'],
//           },
//         }),
//       ],
//       actions: [new chrome.declarativeContent.ShowAction()],
//     };
//     // 整合所有规则
//     const rules = [rule];
//     // 执行规则
//     chrome.declarativeContent.onPageChanged.addRules(rules);
//   });
// });

chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  // 接收来自content script的消息，requset里不允许传递function和file类型的参数
  chrome.tabs.query({ currentWindow: true, active: true }, function (_tabs) {
    const { contentRequest } = request;
    // 接收来自content的api请求
    if (contentRequest === "api-request") {
      let options = request.options;
      // API请求成功的回调
      options.success = (data: any) => {
        data.result = "success";
        sendResponse(data);
      };
      // API请求失败的回调
      options.fail = (data: any) => {
        data.result = "fail";
        sendResponse(data);
      };
      // 发起请求
      immediateRoute(
        options.url,
        options.method,
        options.body,
        options.success,
        options.fail
      );
    }
  });
  return true;
});
