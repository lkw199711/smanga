<template>
  <div class="browse-pager">
    <!--分页-->
    <el-pagination
        class="pagination"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :default-current-page="1"
        :page-sizes="pageSizeArray"
        :pager-count="pageCount"
        :small="pageSmall"
        :disabled="disabled"
        :background="background"
        :layout="pageLayout"
        :total="computedCount"
        @size-change="size_change"
        @current-change="page_change"
    />
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue'
import {config} from "@/store";
import {ElMessage} from "element-plus";

export default defineComponent({
  name: 'browse-pager',
  // 数据
  data() {
    return {
      page: 1, pageSize: 1, disabled: false, background: true, pageSizeArray: [1, 2, 3, 4],

    }
  },

  // 传值
  props: ['count', 'setPageSize'],

  // 计算
  computed: {
    computedCount() {
      return this.count;
    },
    pageCount() {
      const screenType = config.screenType;
      switch (screenType) {
        case 'large':
          return 21;
        case 'middle':
          return 9;
        case 'small':
          return 7;
        default:
          return 21;
      }
    },
    pageSmall() {
      const screenType = config.screenType;
      switch (screenType) {
        case 'large':
          return false;
        case 'middle':
          return false;
        case 'small':
          return true;
        default:
          return false;
      }
    },
    pageBackground() {
      return true;
    },
    pageLayout() {
      const screenType = config.screenType;
      switch (screenType) {
        case 'large':
          return 'total,  prev, pager, next, jumper';
        case 'middle':
          return ' prev, pager, next, jumper';
        case 'small':
          return 'prev, pager, next, jumper';
        default:
          return 'total,  prev, pager, next, jumper';
      }
    },
  },

  // 组件
  components: {},

  // 方法
  methods: {
    /**
     * 页码尺寸变更
     * @param size
     */
    size_change(size: number) {
      this.pageSize = size;
      this.page_change();
    },
    set_page(page: number) {
      this.page = page;
    },
    /**
     * 页码变更
     * @param page
     */
    page_change(page = 1) {
      this.page = page;
      this.$emit('pageChange', page, this.pageSize);
    },
    /**
     * 重载数据 不改变页码
     */
    reload() {
      this.$emit('reloadPage', this.page, false);
    },

    /**
     * 上一页
     */
    before() {
      if (this.page > 1) {
        this.page_change(--this.page);
      } else {
        ElMessage.warning('已近位于首页');
      }
    },

    /**
     * 下一页
     */
    next() {
      if (this.page < this.count / this.pageSize) {
        this.page_change(++this.page);
      } else {
        ElMessage.warning('已近位于尾页');
      }
    },
  },

  // 生命周期
  created() {
    // 设置页容量
    if (this.setPageSize) {
      this.pageSize = this.setPageSize;
    }
  },
})
</script>

<style scoped lang='less'>
.browse-pager {
  margin-top: 1.4rem;
}

@media only screen and (min-width: 1200px) {
  :deep(.el-pagination__jump) {
    margin-left: .12rem;
  }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  :deep(.el-pagination__jump) {
    margin-left: .8rem;
  }
}

@media only screen and (max-width: 767px) {
  :deep(.el-pagination__jump) {
    margin-left: .4rem;
  }
}


</style>