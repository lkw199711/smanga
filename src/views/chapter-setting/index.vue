<template>
  <div class="chapter-setting-index">
    <div class="chapter-setting-box">
      <div class="manga-setting-box">
        <el-table :data="tableData" stripe border>
          <el-table-column type="index" :label="$t('account.serial')" width="54">
          </el-table-column>

          <el-table-column
              prop="mediaId"
              :label="$t('mediaManage.id')"
              width="80">
          </el-table-column>

          <el-table-column
              prop="chapterId"
              :label="$t('chapterManage.id')"
              width="90">
          </el-table-column>

          <el-table-column
              prop="chapterName"
              :label="$t('chapterManage.name')"
              width="180">
          </el-table-column>

          <el-table-column
              prop="createTime"
              :label="$t('chapterManage.createTime')"
              width="170">
          </el-table-column>

          <el-table-column
              prop="updateTime"
              :label="$t('chapterManage.updateTime')"
              width="170">
          </el-table-column>

          <el-table-column :label="$t('option.option')">
            <template v-slot="scope">
              <el-button
                  size="small"
                  type="primary"
                  :icon="Edit"
                  @click="edit_chapter(scope.$index, scope.row)">{{ $t('option.modify') }}
              </el-button>
              <el-button
                  size="small"
                  type="danger"
                  :icon="Delete"
                  @click="delete_chapter(scope.$index, scope.row)">{{ $t('option.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--表格-->
        <el-dialog :title="$t('chapterManage.modify')" v-model="editChapterDialog" :before-close="dialog_close">
          <el-form :model="form" label-width="11rem">
            <el-form-item :label="$t('chapterManage.form.name')">
              <el-input v-model="form.chapterName" :placeholder="$t('chapterManage.place.name')"></el-input>
            </el-form-item>

            <el-form-item :label="$t('chapterManage.form.path')">
              <el-input v-model="form.chapterPath" :placeholder="$t('chapterManage.place.path')"></el-input>
            </el-form-item>

            <el-form-item :label="$t('chapterManage.form.poster')">
              <el-input v-model="form.chapterCover" :placeholder="$t('chapterManage.place.poster')"></el-input>
            </el-form-item>
          </el-form>

          <template v-slot:footer>
            <div class="dialog-footer">
              <!--按钮盒子-->
              <div class="btn-box">
                <el-button type="primary" @click="update_chapter">{{ $t('option.confirm') }}</el-button>
                <el-button type="warning" @click="editChapterDialog=false">{{ $t('option.cancel') }}</el-button>
              </div>
            </div>
          </template>
        </el-dialog>
        <!--分页-->
        <table-pager ref="pager" @pageChange="load_table" :count="count"/>
      </div>
    </div>
  </div>
</template>

<script src='./script/index.ts' lang='ts'></script>

<style src='./style/index.less' scoped lang='less'></style>
