import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/home",
    component: () => import("@/popup/views/home/home.vue"),
    exact: true,
  },
  {
    path: "/account",
    component: () => import("@/popup/views/account/account.vue"),
    exact: true,
  },
  // 空hash，则跳转至Home页面
  { path: "", redirect: "home" },
  // 未匹配，则跳转至Home页面
  { path: "/:pathMatch(.*)", redirect: "home" },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
