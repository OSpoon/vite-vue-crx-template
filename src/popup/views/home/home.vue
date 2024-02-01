<template>
  <a-spin :spinning="spinning">
    <a-typography-title :level="3">{{ profile.name }}</a-typography-title>
    <a-typography-title :level="4">{{ profile.gender }}</a-typography-title>
    <a-typography-title :level="5">{{ profile.email }}</a-typography-title>
    <a-typography-title :level="5">{{ profile.error }}</a-typography-title>
  </a-spin>
</template>

<script setup lang="ts">
import { getProfile } from "@/api";
import { request } from "@/message";
import { onMounted, reactive, ref } from "vue";

const spinning = ref(false);
const profile = reactive({
  name: "",
  gender: "",
  email: "",
  error: "",
});

onMounted(async () => {
  spinning.value = true;
  try {
    const data: any = await getProfile();
    if (data) {
      const { name, gender, email } = data;
      profile.name = name;
      profile.gender = gender;
      profile.email = email;
    }
    const result = await request({
      url: "cs://user-data",
    });
    console.log(result);
  } catch (error: any) {
    profile.error = error?.message;
  } finally {
    spinning.value = false;
  }
});
</script>

<style scoped></style>
@/api/fatch
