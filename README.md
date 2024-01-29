# vite-vue-crx-template

集成 Vite5、Vue3、Typescript5、AntdV4 等基础模块实现的 Chrome V3 插件模板

## 获取模板

1. 点击 `Use this template` 创建新的仓库;
2. 执行 `git clone <your-repo-url>` 克隆到本地;

## 安装依赖

执行 `npm install` 安装依赖;

## 开发模式

1. 执行 `npm run dev` 启动项目;
2. 打开 `http://localhost:3000` 查看效果;

PS: 仅支持调试 Popup, 或将 Content 挂在到 Popup 进行调试但部分功能受限;

## 监听模式

1. 执行 `npm run build:watch` 构建项目;
2. 打开 `chrome://extensions` 加载已解压的扩展程序;
3. 选择 `<root-dir>/build` 文件夹;

PS: 修改代码后可以自动构建并更新 Chrome 扩展程序, 减少重复执行构建命令;

## 构建模式

1. 执行 `npm run build` 构建项目;
2. 打开 `chrome://extensions` 打包扩展程序;
3. 选择 `<root-dir>/build` 文件夹;

## License

[MIT License Copyright (c) 2024 小鑫同学](./LICENSE)
