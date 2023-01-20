<template>
  <div class="chapter-list-menu">
    <!--目录列表-->
    <el-drawer
        v-model="popup"
        size="auto"
        direction="ltr"
        :with-header="false"
    >
      <el-menu
          class="chapter-list"
          active-text-color="#ee0a24"
          :default-active="String(chapterIndex)"
          @select="change_chapter"
      >
        <el-menu-item v-for="(k,i) in chapterList" :index="String(i)" :key="k.chapterId">{{ k.chapterName }}
        </el-menu-item>
        <seat height="4rem"/>
      </el-menu>

      <!--翻页按钮-->
      <div class="btn-box" v-show="popup">
        <el-button class="btn" type="warning" plain @click.stop="before">{{ $t('option.before') }}</el-button>
        <el-button class="btn" type="success" plain @click.stop="next">{{ $t('option.next') }}</el-button>
      </div>
    </el-drawer>


    <!--目录按钮-->
    <div v-show="browseTop" class="show-menu-btn" @click.stop="button_click">
      <i class="colour colour-mulu"/>
    </div>
  </div>
</template>

<script lang='ts'>
import {defineComponent, ref} from 'vue';
import {config} from "@/store";
import {global_get_array, global_set} from "@/utils";
import Seat from "@/components/seat.vue";

export default defineComponent({
  name: 'chapter-list-menu',
  setup() {
    const show = ref(false);
    const showPopup = () => {
      show.value = true;
    };
    return {
      show,
      showPopup,
    };
  },
  // 数据
  data() {
    return {
      popup: false,
    }
  },

  // 传值
  props: [],

  // 引用
  computed: {
    browseTop() {
      return config.browseTop;
    },
    chapterSelect() {
      return config.chapterSelect;
    },
    chapterName() {
      return this.$route.query.name;
    },
    // 章节列表
    chapterList() {
      return global_get_array('chapterList');
    },
    // 章节的坐标索引
    chapterIndex() {
      const chapterList = this.chapterList;

      for (let i = 0; i < chapterList.length; i++) {
        if (this.chapterName === chapterList[i].chapterName) {
          //缓存章节坐标
          global_set('chapterIndex', i);
          return i;
        }
      }

      return -1;
    },
  },

  // 组件
  components: {Seat},

  // 方法
  methods: {
    change_chapter(index: number) {
      this.$emit('changeChapter', index);
    },
    before() {
      this.$emit('before');
    },
    next() {
      this.$emit('next');
    },
    button_click() {
      this.popup = true;
    }
  },

  // 生命周期
  created() {
  },
})
</script>

<style scoped lang='less'>
// 使抽屉滚动
:deep(.el-drawer__body) {
  overflow-y: auto;
}

:deep(.is-active) {
  background-color: @button-back;
}

:deep(.el-menu-item) {
  line-height: initial;
  white-space: break-spaces;
}

// 菜单列表
.chapter-list {
  width: 60rem;
  max-width: 70vw;
  min-height: 100vh;
}

// 翻页按钮
.btn-box {
  position: fixed;
  bottom: 0;
  display: flex;
  width: 60rem;
  max-width: 70vw;
  //z-index: 100;
  transition: .15s;

  .btn {
    margin: 0;
    width: 50%;
    height: 4rem;
  }
}

// 展开按钮
.show-menu-btn {
  position: fixed;
  top: 10rem;
  left: 4rem;
  width: 5rem;
  height: 5rem;
  line-height: 5rem;
  text-align: center;
  background-color: @button-back;
  border-radius: 100%;
  opacity: .7;
  z-index: 1;

  i {
    color: #fff;
    font-size: 2.6rem;
  }
}
</style>
