<template>
  <div class="sidebar-pc">
    <el-menu router :default-active="menuActive" :class="['sidebar', 'sidebar-pc', { close: config.sidebarCollapse }]"
      :collapse="config.sidebarCollapse" :collapse-transition="true">
      <!-- 顶部占位符 -->
      <div class="top-seat" v-if="config.android"></div>
      <el-menu-item index="/" class="no-padding">
        <div :class="['logo', 'posted', { 'collapse': !config.sidebarCollapse }]">
          <img v-show="config.sidebarCollapse" src="@/assets/logo2.png" alt="logo">
          <logo v-show="!config.sidebarCollapse" />
        </div>
      </el-menu-item>

      <template v-for="routeItem in routes" :key="routeItem.path">
        <template v-if="routeItem.meta.sidebar && userLimit(routeItem)">

          <el-sub-menu :index="routeItem.path" v-if="routeItem.meta.submenu">
            <template #title>
              <!-- <i :class="['sidebar-sub-icon', 'colour', 'colour-' + routeItem.meta.icon]"></i> -->
              <i :class="['sidebar-sub-icon', 'colour']">
                <svg class="icon" aria-hidden="true">
                  <use :xlink:href="'#colour-' + routeItem.meta.icon"></use>
                </svg>
              </i>

              <span>{{ $t(`sidebar.${routeItem.meta.title}`) }}</span>
            </template>

            <template v-for="childrenItem in routeItem.children" :key="childrenItem.path">
              <template v-if="childrenItem.meta.sidebar">
                <el-menu-item :index="childrenItem.path">
                  <i :class="['sidebar-icon', 'colour', { 'collapse': config.sidebarCollapse }]">
                    <svg class="icon" aria-hidden="true">
                      <use :xlink:href="'#colour-' + childrenItem.meta.icon"></use>
                    </svg>
                  </i>
                  <template #title>{{ $t(`sidebar.${childrenItem.meta.title}`) }}</template>
                </el-menu-item>
              </template>

            </template>

          </el-sub-menu>

          <el-menu-item :index="routeItem.path" v-else>
            <i :class="['sidebar-icon', 'colour', 'colour-' + routeItem.meta.icon]"></i>
            <template #title>{{ $t(`sidebar.${routeItem.meta.title}`) }}</template>
          </el-menu-item>

        </template>
      </template>

    </el-menu>
  </div>

  <div class="sidebar-phone">
    <el-drawer v-model="config.sidebarCollapse" size="auto" direction="ltr" :with-header="false">
      <!-- 顶部占位符 -->
      <div class="top-seat" v-if="config.android"></div>
      <el-menu router class="sidebar sidebar-phone" :default-active="menuActive">
        <!--<logo/>-->
        <el-menu-item index="/" class="no-padding">
          <div :class="['logo', 'posted']">
            <logo />
          </div>
        </el-menu-item>

        <template v-for="routeItem in routes" :key="routeItem.path">
          <template v-if="routeItem.meta.sidebar && userLimit(routeItem)">

            <el-sub-menu :index="routeItem.path" v-if="routeItem.meta.submenu">
              <template #title>
                <!-- <i :class="['sidebar-sub-icon', 'colour', 'colour-' + routeItem.meta.icon]"></i> -->
                <i :class="['sidebar-sub-icon', 'colour']">
                  <svg class="icon" aria-hidden="true">
                    <use :xlink:href="'#colour-' + routeItem.meta.icon"></use>
                  </svg>
                </i>

                <span>{{ $t(`sidebar.${routeItem.meta.title}`) }}</span>
              </template>

              <template v-for="childrenItem in routeItem.children" :key="childrenItem.path">
                <template v-if="childrenItem.meta.sidebar">
                  <el-menu-item :index="childrenItem.path">
                    <i :class="['sidebar-icon', 'colour', { 'collapse': config.sidebarCollapse }]">
                      <svg class="icon" aria-hidden="true">
                        <use :xlink:href="'#colour-' + childrenItem.meta.icon"></use>
                      </svg>
                    </i>
                    <template #title>{{ $t(`sidebar.${childrenItem.meta.title}`) }}</template>
                  </el-menu-item>
                </template>

              </template>

            </el-sub-menu>

            <el-menu-item :index="routeItem.path" v-else>
              <i :class="['sidebar-icon', 'colour', 'colour-' + routeItem.meta.icon]"></i>
              <template #title>{{ $t(`sidebar.${routeItem.meta.title}`) }}</template>
            </el-menu-item>

          </template>
        </template>

      </el-menu>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import router from '@/router';
import { config, power } from '@/store';
import Logo from "@/layout/components/logo.vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const uRouter = useRouter();
const { t } = useI18n();

type routeItem = {
  meta: {
    submenu?: boolean;
    sidebar: boolean;
    icon: string;
    title: string;
  },
  path: string;
  name: string;
  children: routeItem[];
}

const show = ref(true);

const go_home = () => {
  router.push('/');
}

const routes = computed<routeItem[]>(() => {
  return router.options.routes as any;
})

const menuActive = computed(() => {
  switch (route.path) {
    case '/manga-list':
      return '/media-list';
    case '/chapter-list':
      return '/media-list';
    case '/manga-info':
      return '/media-list';
    default:
      return route.path;
  }

})

const userLimit = computed(() => (item: any) => {

  const title = item.meta.title;

  if (title === 'mediaManage' && !power.editMedia) {
    return false;
  }

  if (title === 'account' && !power.editUser) {
    return false;
  }

  return true;

})

onMounted(() => {
  config.sidebarCollapse = false;
  console.log(routes.value);

})
</script>

<style>
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
<style scoped lang="less">
.sidebar-sub-icon {
  font-size: 4.2rem;
  transform: translate(-.8rem, -.6rem);
}

.sidebar-icon {
  font-size: 2.6rem;
  transform: translate(-1rem, -1.2rem);
}

.sidebar-icon.collapse {
  transform: translate(-1rem, -1.4rem);
}

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

.top-seat {
  height: 4rem;
  background-color: @s-background;
}

.el-menu {
  border: 0;
}

.sidebar {
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
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
