<template>
  <div class="compress-setting">
    <!--表格-->
    <el-table
        :data="tableData" stripe border>
      <el-table-column type="index" :label="$t('account.serial')" width="54">
      </el-table-column>

      <el-table-column
          prop="compressId"
          :label="$t('compressManage.id')"
          width="104">
      </el-table-column>

      <el-table-column
          prop="compressType"
          :label="$t('compressManage.type')"
          width="82">
      </el-table-column>

      <el-table-column
          prop="chapterPath"
          :label="$t('compressManage.source')"
          width="320">
      </el-table-column>

      <el-table-column
          prop="compressPath"
          :label="$t('compressManage.path')"
          width="320">
      </el-table-column>

      <el-table-column
          prop="imageCount"
          :label="$t('compressManage.num')"
          width="82">
      </el-table-column>

      <el-table-column
          prop="createTime"
          :label="$t('compressManage.createTime')"
          width="170">
      </el-table-column>

      <el-table-column :label="$t('option.option')">
        <template v-slot="scope">
          <el-button
              size="small"
              type="danger"
              :icon="Delete"
              @click="handleDelete(scope.$index, scope.row)">{{ $t('option.delete') }}
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
import compressApi from "@/api/compress";
import tablePager from "@/components/table-pager.vue";
import i18n from '@/i18n';

const {t} = i18n.global;
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

      ElMessageBox.confirm(
          t('compressManage.confirm.text'),
          t('compressManage.confirm.title'), {
            type: 'warning'
          }).then(async () => {
        const res = await compressApi.delete_compress(val.compressId);

        if (res.code === 0) {
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
      const res = await compressApi.get_compress(page, pageSize);
      this.count = Number(res.count);
      this.tableData = res.list;
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
    width: 123rem;
    margin: 3rem auto;
  }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  .compress-setting {
    width: 123rem;
    margin: 2rem auto;
  }
}

@media only screen and (max-width: 767px) {
  .compress-setting {
    width: 123rem;
    margin: 1rem auto;
  }
}

</style>
