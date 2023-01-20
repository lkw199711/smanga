<template>
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

    <el-select v-model="config.language" class="language" size="middle" @change="language_change">
      <el-option
          v-for="item in languages"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
  </div>
</template>

<script lang='ts' setup>
import {config} from "@/store";
import languages from "@/store/language";
import {computed, ref} from 'vue'
import {useI18n} from "vue-i18n";

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
</script>

<style scoped lang='less'>
.top-nav.posted {
  //background-color: #ffffff;
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
    //color:  #f4f4f5;
  }
}

.language {
  display: flex;
  margin-right: 2rem;
  width: 10rem;
  flex-direction: column;
  justify-content: center;
}
</style>
