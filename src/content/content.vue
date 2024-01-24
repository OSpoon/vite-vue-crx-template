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

const open = ref<boolean>(false);

const spinning = ref(false);
const profile = reactive({
  name: "",
  gender: "",
  email: "",
  error: "",
});

const showModal = () => {
  open.value = true;
  spinning.value = true;
  getProfileByBackground(
    (result) => {
      spinning.value = false;
      if (result) {
        const { name, gender, email } = result;
        profile.name = name;
        profile.gender = gender;
        profile.email = email;
      }
    },
    (error) => {
      spinning.value = false;
      profile.error = error;
    }
  );
};

const handleOk = (e: MouseEvent) => {
  console.log(e);
  open.value = false;
};
</script>

<style scoped></style>
