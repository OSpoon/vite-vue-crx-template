# vite-vue-crx-template

集成 Vite5、Vue3、Typescript5、AntdV4 等基础模块实现的 Chrome V3 插件模板

## 获取模板

1. 点击 `Use this template` 创建新的仓库;
2. 执行 `git clone <your-repo-url>` 克隆到本地;

## 开发调试

执行 `npm install` 安装依赖;

### Popup Script

1. 执行 `npm run dev` 启动项目;
2. 打开 `http://localhost:3000` 查看效果;

### Content & Background Script

1. 执行 `npm run build` 构建项目;
2. 打开 `chrome://extensions` 加载已解压的扩展程序;
3. 选择 `<root-dir>/build` 文件夹;

PS: 每次调试均需要执行 `npm run build` 构建项目;
