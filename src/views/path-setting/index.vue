<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2024-08-02 19:27:47
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2025-03-13 21:07:16
 * @FilePath: \smanga\src\views\path-setting\index.vue
-->
<template>
  <div class="path-setting-index">
    <div class="path-setting-box">
      <!--表格-->
      <el-table :data="tableData" stripe border>
        <el-table-column type="index" :label="$t('account.serial')" width="54">
        </el-table-column>

        <el-table-column prop="mediaId" :label="$t('mediaManage.id')" width="80">
        </el-table-column>

        <el-table-column prop="pathId" :label="$t('path.id')" width="80">
        </el-table-column>

        <el-table-column prop="pathContent" :label="$t('path.path')" width="160">
        </el-table-column>

        <el-table-column prop="createTime" :label="$t('path.createTime')" width="170">
        </el-table-column>

        <el-table-column :label="$t('account.option')">
          <template v-slot="scope">
            <el-button size="small" type="primary" :icon="Edit" @click="edit_path(scope.$index, scope.row)">{{
              $t('path.button.edit') }}
            </el-button>
            <el-button size="small" type="success" :icon="RefreshRight" @click="scan_path(scope.$index, scope.row)">{{
              $t('path.button.update') }}
            </el-button>
            <el-button size="small" type="warning" :icon="Refresh" @click="rescan_path(scope.$index, scope.row)">{{
              $t('path.button.re') }}
            </el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="delete_path(scope.$index, scope.row)">{{
              $t('option.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <table-pager ref="pager" @pageChange="load_table" :count="count" />

      <!--编辑路径弹框-->
      <el-dialog :title="$t('path.modify')" v-model="editPathDialogVisible" :before-close="() => {
        editPathDialogVisible = false;
      }
        ">
        <el-form :model="pathForm" label-width="100px">
          <el-form-item :label="$t('path.form.name')">
            <el-input disabled v-model="pathForm.pathContent" />
          </el-form-item>
          <p class="note form-note">
            {{ $t('path.note.disabledContent') }}
          </p>

          <!--扫描字段-->
          <p class="s-form-title">{{ $t('mediaManage.title.scan') }}</p>
          <!-- 自动扫描 -->
          <el-form-item :label="$t('mediaManage.form.autoScan')">
            <el-switch v-model.number="pathForm.autoScan" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <p class="note form-note">{{ $t('mediaManage.note.autoScan') }}</p>
          <el-form-item :label="$t('path.form.include')">
            <el-input v-model="pathForm.include" :placeholder="$t('path.place.include')" />
          </el-form-item>
          <el-form-item :label="$t('path.form.exclude')">
            <el-input v-model="pathForm.exclude" :placeholder="$t('path.place.exclude')" />
          </el-form-item>
          <p class="note form-note">
            {{ $t('path.note.clude', ['(aaa|bbb|ccc)']) }}
          </p>
        </el-form>

        <template v-slot:footer>
          <div class="dialog-footer">
            <!--按钮盒子-->
            <div class="btn-box">
              <el-button type="primary" @click="save_path">{{
                $t('option.confirm')
                }}</el-button>
              <el-button type="warning" @click="cancel_edit_path">{{
                $t('option.cancel')
                }}</el-button>
            </div>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script src='./script/index.ts' lang='ts'></script>

<style src='./style/index.less' scoped lang='less'></style>
