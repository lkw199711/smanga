<template>
  <div class="compress-setting">
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
              size="mini"
              type="danger"
              :icon="Delete"
              @click="handleDelete(scope.$index, scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue'
import {ElMessageBox} from "element-plus";
import {Delete, Edit, Plus} from '@element-plus/icons'
import {delete_compress, get_compress} from "@/api/compress";

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
      addDialog: false,
      dialogFormVisible: false,
      tableData: [],
      formLabelWidth: '120px'
    }
  },

  // 传值
  props: [],

  // 引用
  computed: {},

  // 组件
  components: {},

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
          this.load_table();
        }
      }).catch(() => {})
    },

    /**
     * 加载表格
     * @returns {Promise<void>}
     */
    async load_table() {
      const res = await get_compress();
      this.tableData = res.data.list;
    },
  },

  // 生命周期
  created() {
    this.load_table();
  },
})
</script>

<style scoped lang='less'>
.compress-setting {
  width: 120rem;
  margin: 10rem auto;
}
</style>
