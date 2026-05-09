<template>
  <div class="td-manage">
    <h2 class="td-page-title">管理面板</h2>
    <div class="td-manage-grid">
      <div class="td-manage-card">
        <h3>媒体库管理</h3>
        <p>管理和扫描媒体库</p>
        <button class="td-btn" disabled>扫描全部</button>
      </div>
      <div class="td-manage-card">
        <h3>用户管理</h3>
        <p>管理系统用户</p>
        <button class="td-btn" disabled>添加用户</button>
      </div>
      <div class="td-manage-card">
        <h3>系统信息</h3>
        <p>查看系统运行状态</p>
        <div class="td-info-row"><span>版本</span><span>开发中</span></div>
      </div>
      <div class="td-manage-card">
        <h3>缓存管理</h3>
        <p>清理系统缓存</p>
        <button class="td-btn" disabled>清理缓存</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
</script>

<style scoped>
.td-manage { max-width: 900px; margin: 0 auto; }
.td-page-title { font-size: 20px; font-weight: 700; color: var(--fg); margin-bottom: 20px; }
.td-manage-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.td-manage-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
.td-manage-card h3 { font-size: 15px; font-weight: 600; color: var(--fg); margin: 0 0 6px; }
.td-manage-card p { font-size: 13px; color: var(--fg2); margin: 0 0 14px; }
.td-btn { padding: 6px 16px; border-radius: 6px; background: var(--accent); color: #fff; border: none; font-size: 13px; cursor: pointer; }
.td-btn:disabled { opacity: 0.5; cursor: default; }
.td-info-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--fg2); }
</style>
