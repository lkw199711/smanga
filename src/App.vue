<template>
  <div class="main" id="app">
    <div class="view">
      <router-view/>
    </div>
  </div>

</template>

<script lang="ts" setup>
import {Cookies, global_set_json} from "@/utils";
import {get_bookmark} from "@/api/bookmark";
import {config} from "@/store";
import {useRouter} from "vue-router";

const router = useRouter();

// 检查登录状态
check_login();

// 获取书签列表
set_bookmark();

// 设置屏幕尺寸
set_screen_type();
window.addEventListener('resize', set_screen_type);

/**
 * 设置屏幕尺寸
 */
function set_screen_type() {
  const screen = window.screen.width;
  if (screen < 768) {
    config.screenType = 'small';
  } else if (screen < 1200) {
    config.screenType = 'middle';
  } else {
    config.screenType = 'large';
  }
}

/**
 * 检查登录状态
 */
function check_login() {
  const id = Cookies.get('userId');
  const name = Cookies.get('userName');

  if (!name || !id) {
    router.push('/login');
  }
}

/**
 * 获取书签列表
 */
async function set_bookmark() {
  const res = await get_bookmark();
  global_set_json('bookmarkList', res.data.list);
}

</script>

<style lang="less">
.main {
  background-color: #d9d9d9;
  min-height: 100vh;
}
</style>
