// 监听模式下注入自动刷新功能
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message == "RELOAD") {
    chrome.runtime.reload();
    sendResponse({ message: "RELOAD" });
  }
});
