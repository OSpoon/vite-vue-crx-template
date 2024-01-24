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
import { onMounted, reactive, ref } from "vue";

const spinning = ref(false);
const profile = reactive({
  name: "",
  gender: "",
  email: "",
  error: "",
});

onMounted(() => {
  spinning.value = true;
  getProfile(
    (result) => {
      const { name, gender, email } = result;
      profile.name = name;
      profile.gender = gender;
      profile.email = email;
    },
    (error) => {
      profile.error = error;
    },
    () => {
      spinning.value = false;
    }
  );
});
</script>

<style scoped></style>
@/api/fatch