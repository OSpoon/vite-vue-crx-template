<script setup lang="ts">
import { onMounted, reactive } from "vue";
import type { UnwrapRef } from "vue";

const state = reactive({
  branch_merge_filtering: false,
});

const formState: UnwrapRef<{ prefix: string }> = reactive({
  prefix: "",
});

const onSubmitRefresh = (reload: boolean) => {
  state.branch_merge_filtering = false;
  saveStateChange(reload);
};

onMounted(async () => {
  const result = await chrome.storage.local.get([
    "prefix",
    "branch_merge_filtering",
  ]);
  if (result) {
    const { prefix } = result;
    formState.prefix = prefix;
    state.branch_merge_filtering = result.branch_merge_filtering;
  }
});

const saveStateChange = async (reload: boolean) => {
  const updateState = {
    prefix: formState.prefix,
    branch_merge_filtering: state.branch_merge_filtering,
  };
  await chrome.storage.local.set(updateState);
  reload && (await chrome.tabs.reload());
};
</script>

<template>
  <a-card title="GFE开发助手" :bordered="false">
    <a-list :itemLayout="'vertical'" :size="'large'">
      <a-list-item>
        <a-list-item-meta
          description="使用工蜂合并代码时根据源分支对目标分支列表进行过滤"
        >
          <template #title> 分支合并筛选 </template>
        </a-list-item-meta>
        <a-form :model="formState">
          <a-form-item>
            <a-textarea
              v-model:value="formState.prefix"
              placeholder="请输入分支前缀,多个用英文分号隔开,如:branchName01;branchName02;branchName03;"
              :autoSize="{ minRows: 3, maxRows: 5 }"
            />
          </a-form-item>
        </a-form>
        <template #actions>
          <a-space>
            <a-button type="primary" @click="onSubmitRefresh(false)">
              保存配置
            </a-button>
            <a-switch
              v-model:checked="state.branch_merge_filtering"
              checked-children="启用"
              un-checked-children="关闭"
              @change="saveStateChange(true)"
            />
          </a-space>
        </template>
      </a-list-item>
    </a-list>
  </a-card>
</template>

<style scoped></style>
