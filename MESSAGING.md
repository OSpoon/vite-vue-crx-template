# 消息机制

**Chrome Extension 消息机制** 主要围绕着 **默认弹窗** (`default_popup`), **内容脚本内容脚本** (`content_script`)以及 **后台服务** (`service_worker`) 三块内容展开.

要实现 **消息机制** 所依赖的 **API** 包括发送端 **API** `runtime.sendMessage`,`tabs.sendMessage` 和接收端 **API** `runtime.onMessage`;

## 内容脚本获取后台服务数据

1. 在后台服务注入模块并为内容脚本实现获取数据的接口函数

```Typescript
import { inject } from "@/message";

/***
 * 参数 1: 提供给内容脚本数据的接口函数
 * 参数 2: 标明注入的为 sw 服务;
 */
inject(
  {
    userData: () => {
      return {
        name: "张三",
        age: 18,
      };
    },
  },
  "sw"
);
```

2. 在内容脚本中执行 `request` 函数获取数据

```Typescript
/**
 * url 为约定格式(协议://接口函数名),在内部通过羊肉串转小驼峰命名获取目标函数并执行
 * data 为可缺省参数,按照实际需要进行设置
 */
const result = await request({
    url: "sw://user-data",
});
console.log(result);
```

## 默认弹窗获取内容脚本数据

1. 在内容脚本注入模块并为默认弹窗实现获取数据的接口函数

```Typescript
import { inject } from "../message";

/***
 * 参数 1: 提供给默认弹窗数据的接口函数
 * 参数 2: 标明注入的为 cs 服务;
 */
inject(
  {
    userData: () => {
      return {
        name: "张三",
        age: 35,
      };
    },
  },
  "cs"
);
```

2. 在默认弹窗中执行 `request` 函数获取数据

```Typescript
const result = await request({
    url: "cs://user-data",
});
console.log(result);
```

## 消息机制封装实现

1. 约定参数格式:

```Typescript
export interface Payload {
  url: string;
  data?: any;
}
```

2. 通过 URL 中的协议名称调用不用的底层 API 实现消息发送

```Typescript
const ContentScriptRegex = /^cs:\/\/[a-zA-Z0-9-]+$/;
const serviceWorkerRegex = /^sw:\/\/[a-zA-Z0-9-]+$/;

export const request = (payload: Payload) => {
  return new Promise((resolve, reject) => {
    try {
      const { url } = payload;
      if (ContentScriptRegex.test(url)) {
        chrome.tabs
          .query({ active: true, currentWindow: true })
          .then((tabs) => {
            chrome.tabs.sendMessage(tabs[0]?.id || 0, payload, (response) =>
              resolve(response)
            );
          });
      } else if (serviceWorkerRegex.test(url)) {
        chrome.runtime.sendMessage(payload, (response) => resolve(response));
      }
    } catch (error) {
      reject(error);
    }
  });
};
```

3. 在接收端通过羊肉串转小驼峰命名对 URL 中的接口函数进行转换并在注入的 Target 中查找函数执行.

```Typescript
import camelCase from "camelcase";

export function inject(target: any, prefix: "sw" | "cs") {
  chrome.runtime.onMessage.addListener(
    async (request: Payload, _sender, sendResponse) => {
      const { url, data } = request;
      if (url && url.startsWith(`${prefix}://`)) {
        const postId = camelCase(url.split("//")[1]);
        const response = await Reflect.get(target, postId)(data);
        sendResponse(response);
      }
    }
  );
}
```
