<template>
  <div class="sidebar-pc">
    <el-menu
        router
        active-text-color="#ffd04b"
        background-color="#545c64"
        text-color="#fff"
        default-active="/"
        :class="['sidebar','sidebar-pc',{close:config.sidebarCollapse}]"
        :collapse="config.sidebarCollapse"
        :collapse-transition="true"
    >
      <!--<logo/>-->
      <el-menu-item index="/" class="no-padding">
        <div :class="['logo','posted',{'collapse':!config.sidebarCollapse}]">
          <img v-if="config.sidebarCollapse" src="@/assets/logo2.png" alt="logo">
          <logo v-else/>
        </div>
      </el-menu-item>

      <template v-for="(item,key) in routes" :key="key">
        <el-menu-item v-if="item.meta.sidebar" :index="item.path">
          <el-icon v-if="item.meta.icon">
            <component :is="item.meta.icon"></component>
          </el-icon>
          <template #title>{{ item.meta.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>

  <div class="sidebar-phone">
    <van-popup v-model:show="config.sidebarCollapse" position="left" class="sidebar-popup">
      <el-menu
          router
          active-text-color="#ffd04b"
          background-color="#545c64"
          text-color="#fff"
          default-active="/"
          class="sidebar"
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
            <template #title>{{ item.meta.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </van-popup>
  </div>

</template>

<script lang="ts" setup>
import {ref, onMounted, computed} from 'vue'
import {useRouter} from "vue-router";
import {config} from '@/store';
import Logo from "@/layout/components/logo.vue";

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
@media only screen and (max-width: 999px) {
  .sidebar-pc {
    display: none;
  }
}

@media only screen and (min-width: 1000px) {
  .sidebar-phone {
    display: none;
  }
}

.sidebar-popup {
  width: 80vw;
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
