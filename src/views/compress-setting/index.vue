<template>
  <div class="compress-setting">
    <!--表格-->
    <el-table
        :data="tableData" stripe border>
      <el-table-column type="index" label="序号" width="50">
      </el-table-column>

      <el-table-column
          prop="compressId"
          label="转换id"
          width="70">
      </el-table-column>

      <el-table-column
          prop="compressType"
          label="转换类型"
          width="50">
      </el-table-column>

      <el-table-column
          prop="chapterPath"
          label="原路径"
          width="320">
      </el-table-column>

      <el-table-column
          prop="compressPath"
          label="转换路径"
          width="320">
      </el-table-column>

      <el-table-column
          prop="imageCount"
          label="图片数量"
          width="50">
      </el-table-column>

      <el-table-column
          prop="createTime"
          label="转换日期"
          width="180">
      </el-table-column>

      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button
              size="small"
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
import {delete_compress, get_compress} from "@/api/compress";
import tablePager from "@/components/table-pager.vue";

export default defineComponent({
  name: 'compress-setting',
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
        const res = await delete_compress(val.compressId);

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
      const res = await get_compress(start, pageSize);
      this.count = Number(res.data.count);
      this.tableData = res.data.list;
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
  .compress-setting {
    width: 116rem;
    margin: 3rem auto;
  }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  .compress-setting {
    width: 114rem;
    margin: 2rem auto;
  }
}

@media only screen and (max-width: 767px) {
  .compress-setting {
    width: 114rem;
    margin: 1rem auto;
  }
}

</style>
