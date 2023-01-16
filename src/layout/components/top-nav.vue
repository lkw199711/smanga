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
  </div>
</template>

<script lang='ts'>
import {defineComponent, ref} from 'vue'
import {config} from "@/store";

export default defineComponent({
  setup() {
    const activeIndex = ref('1')
    const activeIndex2 = ref('1')
    const handleSelect = (key: string) => {

      switch (key) {
        case 'switch_sidebar':
          config.sidebarCollapse = !config.sidebarCollapse;
          break;
        default:
          break;
      }
    }
    return {
      activeIndex,
      activeIndex2,
      handleSelect,
    }
  },

  name: 'top-nav',
  // 数据
  data() {
    return {}
  },

  // 传值
  props: [],

  // 计算
  computed: {
    config() {
      return config
    },
    screenType() {
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
    },
  },

  // 组件
  components: {},

  // 方法
  methods: {},

  // 生命周期
  created() {
  },
})
</script>

<style scoped lang='less'>
.top-nav.posted {
  //background-color: #ffffff;
  height: 60px;
  //overflow: hidden;
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
</style>
