<template>
  <a-float-button @click="showModal">
    <template #icon>
      <img style="width: inherit" src="../../public/favicon.ico" />
    </template>
  </a-float-button>
  <a-modal v-model:open="open" title="Profile" @ok="handleOk">
    <a-spin :spinning="spinning">
      <a-typography-title :level="3">{{ profile.name }}</a-typography-title>
      <a-typography-title :level="4">{{ profile.gender }}</a-typography-title>
      <a-typography-title :level="5">{{ profile.email }}</a-typography-title>
      <a-typography-title :level="5">{{ profile.error }}</a-typography-title>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { getProfileByBackground } from "@/api";
import { reactive, ref } from "vue";
import { inject } from "../message";

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

const open = ref<boolean>(false);

const spinning = ref(false);
const profile = reactive({
  name: "",
  gender: "",
  email: "",
  error: "",
});

const showModal = async () => {
  open.value = true;
  spinning.value = true;
  try {
    const data: any = await getProfileByBackground();
    const { name, gender, email } = data;
    profile.name = name;
    profile.gender = gender;
    profile.email = email;
  } catch (error: any) {
    profile.error = error?.message;
  } finally {
    spinning.value = false;
  }
};

const handleOk = (_e: MouseEvent) => {
  open.value = false;
};
</script>

<style scoped></style>
@/api/fatch
