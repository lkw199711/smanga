<template>
  <div class="not-found-index">
    <h3>{{ $t('404') }}</h3>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang='less'>
.not-found-index {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
  background-color: #444;
}

h3 {
  font-size: 6rem;
  color: #eee;
  text-align: center;
  font-weight: normal;
}
</style>
