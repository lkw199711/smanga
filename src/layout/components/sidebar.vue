<template>
  <div class="sidebar-pc">
    <el-menu
        router
        default-active="/"
        :class="['sidebar','sidebar-pc',{close:config.sidebarCollapse}]"
        :collapse="config.sidebarCollapse"
        :collapse-transition="true"
    >
      <el-menu-item index="/" class="no-padding">
        <div :class="['logo','posted',{'collapse':!config.sidebarCollapse}]">
          <img v-show="config.sidebarCollapse" src="@/assets/logo2.png" alt="logo">
          <logo v-show="!config.sidebarCollapse"/>
        </div>
      </el-menu-item>

      <template v-for="(item,key) in routes" :key="key">
        <el-menu-item v-if="item.meta.sidebar" :index="item.path">
          <el-icon v-if="item.meta.icon">
            <component :is="item.meta.icon"></component>
          </el-icon>
          <template #title>{{ $t(`sidebar.${item.meta.title}`) }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>

  <div class="sidebar-phone">
    <el-drawer
        v-model="config.sidebarCollapse"
        size="auto"
        direction="ltr"
        :with-header="false"
    >
      <el-menu
          router
          class="sidebar sidebar-phone"
          default-active="/"
      >
        <!--<logo/>-->
        <el-menu-item index="/" class="no-padding">
          <div :class="['logo','posted']">
            <logo/>
          </div>
        </el-menu-item>

        <template v-for="(item,key) in routes" :key="key">
          <el-menu-item v-if="item.meta.sidebar" :index="item.path">
            <el-icon v-if="item.meta.icon">
              <component :is="item.meta.icon"></component>
            </el-icon>
            <template #title>{{ $t(`sidebar.${item.meta.title}`) }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-drawer>
  </div>

</template>

<script lang="ts" setup>
import {ref, onMounted, computed} from 'vue'
import {useRouter} from "vue-router";
import {config} from '@/store';
import Logo from "@/layout/components/logo.vue";
import {useI18n} from "vue-i18n";
const {t} = useI18n();

const router = useRouter();

const show = ref(true);

const go_home = () => {
  router.push('/');
}

const routes = computed(() => {
  return router.options.routes;
})

onMounted(() => {
  config.sidebarCollapse = false;
})
</script>

<style scoped lang="less">

//响应式手机
@media only screen and (max-width: 1199px) {
  .sidebar-pc {
    display: none;
  }
}

@media only screen and (min-width: 1200px) {
  .sidebar-phone {
    display: none;
  }
}

.el-menu {
  border: 0;
}

.sidebar {
  height: 100vh;
  overflow: hidden;
}

.sidebar:not(.el-menu--collapse) {
  width: 20rem;
}

.posted {
  width: 100%;
  color: #5cdbd3;
  font-size: 30px;
  height: 60px;
  line-height: 60px;

  span {
    line-height: 60px;
    text-wrap: inherit;
  }

  img {
    width: 64px;
    height: 60px;
  }
}

.logo.collapse {
  display: flex;
}

.no-padding {
  padding: 0 !important;
}
</style>
