<template>
  <div class="table-pager">
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

export default defineComponent({
  name: 'table-pager',
  // 数据
  data() {
    return {
      page: 1, pageSize: 10, disabled: false, background: true, pageSizeArray: [10, 20, 30, 40],

    }
  },

  // 传值
  props: ['count'],

  // 计算
  computed: {
    computedCount() {
      return Number(this.count);
    },
    pageCount() {
      const screenType = config.screenType;
      switch (screenType) {
        case 'large':
          return 15;
        case 'middle':
          return 11;
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
          return 'total, sizes, prev, pager, next, jumper';
        case 'middle':
          return 'sizes, prev, pager, next, jumper';
        case 'small':
          return 'prev, pager, next, jumper';
        default:
          return 'total, sizes, prev, pager, next, jumper';
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
    /**
     * 页码变更
     * @param page
     */
    page_change(page = 1) {
      this.$emit('pageChange', page, this.pageSize);
    },
    /**
     * 重载数据 不改变页码
     */
    reload_page() {
      this.$emit('pageChange', this.page, this.pageSize);
    },
  },

  // 生命周期
  created() {
  },
})
</script>

<style scoped lang='less'>
.table-pager {
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
