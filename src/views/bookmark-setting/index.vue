<template>
  <div class="bookmark-setting">
    <!--表格-->
    <el-table
        :data="tableData" stripe border>
      <el-table-column type="index" label="序号" width="50">
      </el-table-column>

      <el-table-column
          prop="bookmarkId"
          label="书签id"
          width="70">
      </el-table-column>

      <el-table-column
          prop="mangaName"
          label="漫画"
          width="160">
      </el-table-column>

      <el-table-column
          prop="chapterName"
          label="章节"
          width="320">
      </el-table-column>

      <el-table-column
          prop="page"
          label="页码"
          width="50">
      </el-table-column>

      <el-table-column
          prop="createTime"
          label="添加日期"
          width="180">
      </el-table-column>

      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button
              size="mini"
              type="danger"
              :icon="Delete"
              @click="handleDelete(scope.$index, scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <table-pager ref="pager" @pageChange="load_table" :count="count"/>
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue'
import {ElMessageBox} from "element-plus";
import {Delete, Edit, Plus} from '@element-plus/icons-vue'
import {delete_bookmark, get_bookmark} from "@/api/bookmark";
import tablePager from "@/components/table-pager.vue";

export default defineComponent({
  name: 'bookmark-setting',
  setup() {
    return {
      Plus, Edit, Delete
    }
  },
  // 数据
  data() {
    return {
      count: 0,
      addDialog: false,
      dialogFormVisible: false,
      tableData: [],
      formLabelWidth: '120px'
    }
  },

  // 传值
  props: [],

  // 计算
  computed: {},

  // 组件
  components: {tablePager},

  // 方法
  methods: {
    /**
     * 删除书签
     * @param index
     * @param val
     * @returns {Promise<void>}
     */
    async handleDelete(index: number, val: any) {

      ElMessageBox.confirm('确认删除此书签?', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await delete_bookmark(val.bookmarkId);

        if (res.data.code === 0) {
          this.reload_table();
        }
      }).catch(() => {
      })
    },

    /**
     * 加载表格
     * @returns {Promise<void>}
     */
    async load_table(page = 1, pageSize = 10) {
      const start = (page - 1) * pageSize;
      const res = await get_bookmark(start, pageSize);
      this.tableData = res.data.list;
      this.count = Number(res.data.count);
    },
    /**
     * 重载数据 页码不变
     */
    reload_table() {
      (this.$refs as any).pager.reload_page();
    },
  },

  // 生命周期
  created() {
    this.load_table();
  },
})
</script>

<style scoped lang='less'>
@media only screen and (min-width: 1200px) {
  .bookmark-setting {
    width: 100rem;
    margin: 3rem auto;
  }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  .bookmark-setting {
    width: 93rem;
    margin: 2rem auto;
  }
}

@media only screen and (max-width: 767px) {
  .bookmark-setting {
    width: 92rem;
    margin: 1rem auto;
  }
}

</style>
