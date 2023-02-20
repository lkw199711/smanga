<template>
  <div class="browse-pager">
    <!--分页-->
    <el-pagination
        :class="['pagination',{android:config.android}]"
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
import i18n from '@/i18n';
const {t} = i18n.global;
export default defineComponent({
  name: 'browse-pager',
  // 数据
  data() {
    return {
      page: 1, pageSize: 1, disabled: false, background: true, pageSizeArray: [1, 2, 3, 4],
      config:{android:false},
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
          return 5;
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
     * 重载数据 不改变页码
     */
    reload_static() {
      this.$emit('pageChange', this.page, false);
    },

    /**
     * 上一页
     */
    before() {
      if (this.page > 1) {
        this.page_change(--this.page);
      } else {
        ElMessage.warning(t('page.firstPage'));
      }
    },

    /**
     * 下一页
     */
    next() {
      console.log(this.count);
      console.log(this.page);
      if (this.page < this.count / this.pageSize) {
        this.page_change(++this.page);
      } else {
        ElMessage.warning(t('page.lastPage'));
      }
    },
    direction_key(event: any) {
      const key = event.keyCode;
      switch (key) {
        case 37://"按了←键！"
          this.before();
          break;
          // case 38://"按了↑键！"
          //   alert("按了↑键！");
          //   break;
        case 39://"按了→键！"
          this.next();
          break;
          // case 40://"按了↓键！"
          //   alert("按了↓键！");
          //   break;
      }
    },
  },

  // 生命周期
  created() {
    // 设置页容量
    if (this.setPageSize) {
      this.pageSize = this.setPageSize;
    }

    // window.addEventListener('keypress',this.direction_key);
    window.addEventListener('keydown', this.direction_key);

    this.config = config;
  },
})
</script>

<style scoped lang='less'>
.pagination.android{
  padding-bottom: 2rem;
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
