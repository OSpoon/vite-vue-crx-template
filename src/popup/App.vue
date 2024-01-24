<template>
  <a-layout>
    <a-layout-header :style="{ position: 'fixed', zIndex: 1, width: '100%' }">
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="horizontal"
        :style="{ lineHeight: '64px' }"
      >
        <a-menu-item key="home">
          <router-link to="/home">Home</router-link>
        </a-menu-item>
        <a-menu-item key="account">
          <router-link to="/account">Account</router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout-content :style="{ padding: '12px', marginTop: '64px' }">
      <div :style="{ background: '#fff', padding: '24px', minHeight: '380px' }">
        <router-view></router-view>
      </div>
    </a-layout-content>
    <a-layout-footer :style="{ textAlign: 'center' }">
      Vite-Vue-Crx-Template ©2024 Created by 小鑫同学
    </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
// import "@/content";
const selectedKeys = ref<string[]>(["home"]);
</script>

<style scoped lang="less"></style>
