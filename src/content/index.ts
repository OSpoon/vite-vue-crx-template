function setup(prefixList: string[]) {
  // 处理 value 的变化
  function handleValueChange(targetValue: string) {
    // 获取源分支前缀
    const prefix = prefixList.filter((value) => targetValue.startsWith(value));
    // 获取目标分支列表 dom 元素
    const container =
      (document.querySelector(
        ".review-target .ref-content-item-container"
      ) as HTMLElement) || [];
    if (prefix && prefix.length === 1) {
      // 对目标分支列表中存在公共公共前缀的dom进行保留，不存在的则隐藏
      for (let n of container.childNodes) {
        const node = n as HTMLElement;
        if (node.getAttribute("data-item-name")?.startsWith(prefix[0])) {
          // @ts-ignore
          node.style = "";
        } else {
          // @ts-ignore
          node.style = "display: none";
        }
      }
    }
    // 不存在公共前缀则移除 style
    else {
      for (let node of container.childNodes) {
        // @ts-ignore
        node.style = "";
      }
    }
  }

  // 创建MutationObserver实例
  const sourceBranchObserver = new MutationObserver(
    (mutationsList, _observer) => {
      // 遍历mutation列表
      for (const mutation of mutationsList) {
        // 检查是否有感兴趣的变动
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "value"
        ) {
          // 处理value属性的变化
          // @ts-ignore
          if (mutation.target.value) {
            // @ts-ignore
            handleValueChange(mutation.target.value);
          }
        }
      }
    }
  );

  const merge_request_source_branch = document.querySelector(
    "#merge_request_source_branch"
  );

  if (merge_request_source_branch) {
    console.log("branch_merge_filtering start ...");
    // 启动观察
    sourceBranchObserver.observe(
      // 选中源分支后会更新此 dom 的 value 属性
      merge_request_source_branch,
      // 设置观察选项
      {
        attributes: true, // 观察属性变化
        childList: false, // 不观察子节点变化
        subtree: false, // 不观察子节点树的变化
      }
    );
  }
}

window.onload = () => {
  chrome.storage.local.get(
    ["prefix", "branch_merge_filtering"],
    function (result) {
      if (result) {
        const { branch_merge_filtering, prefix } = result;
        if (!branch_merge_filtering) {
          setup([]);
        } else {
          const prefixList =
            prefix.split(";").filter((p: string) => p !== "") || [];
          setup(prefixList);
        }
      }
    }
  );
};
