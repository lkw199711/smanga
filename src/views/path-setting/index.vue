<template>
  <div class="path-setting-index">
    <div class="path-setting-box">
      <!--表格-->
      <el-table :data="tableData" stripe border>
        <el-table-column type="index" label="序号" width="50">
        </el-table-column>

        <el-table-column
            prop="mediaId"
            label="媒体库id"
            width="80">
        </el-table-column>

        <el-table-column
            prop="pathId"
            label="路径id"
            width="80">
        </el-table-column>

        <el-table-column
            prop="path"
            label="路径"
            width="160">
        </el-table-column>

        <el-table-column
            prop="createTime"
            label="添加日期"
            width="160">
        </el-table-column>

        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button
                size="small"
                type="success"
                :icon="RefreshRight"
                @click="scan_path(scope.$index, scope.row)">增量扫描
            </el-button>
            <el-button
                size="small"
                type="warning"
                :icon="Refresh"
                @click="rescan_path(scope.$index, scope.row)">重新扫描
            </el-button>
            <el-button
                size="small"
                type="danger"
                :icon="Delete"
                @click="delete_path(scope.$index, scope.row)">删除
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
