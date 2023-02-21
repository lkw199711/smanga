<template>
  <!-- 安卓端占位 -->
  <div class="android-seat" v-if="config.android"></div>

  <div class="top-nav posted">
    <div class="menu_collapse" @click="handleSelect('switch_sidebar')">
      <!--大屏幕-->
      <template v-if="screenType">
        <expand v-show="config.sidebarCollapse" class="icon-operation"/>
        <fold v-show="!config.sidebarCollapse" class="icon-operation"/>
      </template>
      <!--小屏幕-->
      <Operation v-else class="icon-operation"></Operation>
      <!--<expand v-else class="icon-operation"/>-->
    </div>

    <!--右侧菜单-->
    <div class="right-option">
      <div class="theme">
        <span class="theme-label"/>
        <el-select v-model="config.theme" class="theme-select" size="default" @change="theme_change">
          <el-option
              v-for="item in theme"
              :key="item.value"
              :label="$t(`theme.${item.value}`)"
              :value="item.value"
          >
            <span class="op-color" :style="theme_color(item.value)"/>
            <span class="op-text">{{ $t(`theme.${item.value}`) }}</span>
          </el-option>
        </el-select>
      </div>

      <!--切换语言-->
      <div class="language">
        <i class="colour colour-yuyanqiehuan"/>
        <el-select v-model="config.language" class="language-select" size="default" @change="language_change">
          <el-option
              v-for="item in languages"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </div>
    </div>

  </div>
</template>

<script lang='ts' setup>
import {config} from "@/store";
import languages from "@/store/language";
import theme from "@/store/theme";
import {computed, ref} from 'vue'
import {useI18n} from "vue-i18n";
import { set_theme, themes } from "@/style/theme";

const value = ref(config.language);
const {locale} = useI18n();

const screenType = computed(() => {
  const screenType = config.screenType;
  switch (screenType) {
    case 'large':
      return true;
    case 'middle':
      return false;
    case 'small':
      return false;
    default:
      return true;
  }
})

function handleSelect(key: string) {
  switch (key) {
    case 'switch_sidebar':
      config.sidebarCollapse = !config.sidebarCollapse;
      break;
    default:
      break;
  }
}

function language_change(val: string) {
  locale.value = val;
  localStorage.setItem('language', val);
}

function theme_change(val: string) {
  set_theme(val);
  localStorage.setItem('theme', val);
}

function theme_color(theme: string) {
  // @ts-ignore
  const color = themes[theme]['s-back'];
  return {
    backgroundColor: color
  };
}

</script>

<style scoped lang='less'>
.android-seat {
  height: 4rem;
}
.top-nav.posted {
  display: flex;
  justify-content: space-between;
  height: 60px;
  box-shadow: 0 1px 4px #b1b3b8;

  .menu_collapse {
    width: 60px;
  }

  .icon-operation {
    display: block;
    padding: 20px;
    width: 20px;
    color: #909399;
  }
}

.block-middle {
  display: flex;
  flex-direction: column;
  justify-content: center;
}


// 右侧
.right-option {
  display: flex;
  margin-top: 1.4rem;
}

.theme {
  &-label {
    display: inline-block;
    margin-right: .6rem;
    width: 3rem;
    height: 3rem;
    line-height: 3rem;
    vertical-align: middle;
    background-color: @s-background;
  }

  &-select {
    width: 10rem;
    margin-right: 2rem;
  }
}

.language{
  display: flex;
  margin-right: 2rem;
  i{
    margin-right: .6rem;
    font-size: 3.2rem;
    //line-height: 3rem;
    transform: translateY(-.1rem);
  }
  &-select {
    width: 10rem;
  }
}

.op-color {
  display: inline-block;
  width: 1.4rem;
  height: 1.4rem;
  margin-right: 1rem;
  background-color: @s-background;
  transform: translateY(.1rem);
}

</style>
