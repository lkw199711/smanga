<template>
  <div class="wiki">
    <div class="version">当前版本
      <span class="version-text">{{ version }}</span>
    </div>
    <div class="content">
      <p>github: <a href="https://github.com/lkw199711/smanga" target="_blank">https://github.com/lkw199711/smanga</a></p>
      <p>docker: <a href="https://hub.docker.com/r/lkw199711/smanga" target="_blank">https://hub.docker.com/r/lkw199711/smanga</a></p>
    </div>
    <div class="content">
      媒体库名称
    </div>
    <div class="content op-demo">
      <operationCover/>
    </div>

  </div>
</template>

<script src='./script/index.ts' lang='ts'></script>

<style src='./style/index.less' scoped lang='less'></style>
