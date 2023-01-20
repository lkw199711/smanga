<template>

  <div class="main" id="app">
    <div class="view">
      <el-config-provider :locale="elLocale">
        <router-view/>
      </el-config-provider>
    </div>
  </div>


</template>

<script lang="ts" setup>
import {Cookies, global_set_json} from "@/utils";
import {get_bookmark} from "@/api/bookmark";
import {config} from "@/store";
import {useRouter} from "vue-router";
import {ElConfigProvider} from 'element-plus'
import languages from "@/store/language";
import {computed, onMounted} from "vue";
import {useI18n} from "vue-i18n";

const {locale} = useI18n();

const elLocale = computed(() => {
  const index = config.language;
  for (let i = 0; i < languages.length; i++) {
    if (languages[i].value === index) {
      return languages[i].components;
    }
  }
  return '';
})

const router = useRouter();

// 检查登录状态
check_login();

// 获取书签列表
set_bookmark();

// 生命周期
onMounted(() => {
  const language = localStorage.getItem('language');
  if (language) {
    config.language = language;
    locale.value = language;
  }
})

// 设置屏幕尺寸
set_screen_type();
window.addEventListener('resize', set_screen_type);

/**
 * 设置屏幕尺寸
 */
function set_screen_type() {
  // const screen = window.screen.width;
  const screen = document.body.scrollWidth;
  // ElMessage(String(screen));
  if (screen < 768) {
    config.screenType = 'small';
  } else if (screen < 1200) {
    config.screenType = 'middle';
  } else if (screen < 2000) {
    config.screenType = 'large';
  } else {
    config.screenType = '2k';
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
