import { createApp } from "vue";
import "ant-design-vue/dist/reset.css";
import Content from "@/content/content.vue";

const crxApp = document.createElement("div");
crxApp.id = "content-container";
document.body.appendChild(crxApp);

const app = createApp(Content);
app.mount("#content-container");
