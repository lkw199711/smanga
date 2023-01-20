<template>
  <div class="path-setting-index">
    <div class="path-setting-box">
      <!--表格-->
      <el-table :data="tableData" stripe border>
        <el-table-column type="index" :label="$t('account.serial')" width="54">
        </el-table-column>

        <el-table-column
            prop="mediaId"
            :label="$t('mediaManage.id')"
            width="80">
        </el-table-column>

        <el-table-column
            prop="pathId"
            :label="$t('path.id')"
            width="80">
        </el-table-column>

        <el-table-column
            prop="path"
            :label="$t('path.path')"
            width="160">
        </el-table-column>

        <el-table-column
            prop="createTime"
            :label="$t('path.createTime')"
            width="170">
        </el-table-column>

        <el-table-column :label="$t('account.option')">
          <template v-slot="scope">
            <el-button
                size="small"
                type="success"
                :icon="RefreshRight"
                @click="scan_path(scope.$index, scope.row)">{{ $t('path.button.update') }}
            </el-button>
            <el-button
                size="small"
                type="warning"
                :icon="Refresh"
                @click="rescan_path(scope.$index, scope.row)">{{ $t('path.button.re') }}
            </el-button>
            <el-button
                size="small"
                type="danger"
                :icon="Delete"
                @click="delete_path(scope.$index, scope.row)">{{ $t('option.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <table-pager ref="pager" @pageChange="load_table" :count="count"/>
    </div>
  </div>
</template>

<script src='./script/index.ts' lang='ts'></script>

<style src='./style/index.less' scoped lang='less'></style>
