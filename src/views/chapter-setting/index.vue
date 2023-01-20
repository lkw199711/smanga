<template>
  <div class="chapter-setting-index">
    <div class="chapter-setting-box">
      <div class="manga-setting-box">
        <el-table :data="tableData" stripe border>
          <el-table-column type="index" label="序号" width="50">
          </el-table-column>

          <el-table-column
              prop="mediaId"
              label="媒体库id"
              width="80">
          </el-table-column>

          <el-table-column
              prop="chapterId"
              label="章节id"
              width="80">
          </el-table-column>

          <el-table-column
              prop="chapterName"
              label="章节名称"
              width="180">
          </el-table-column>

          <el-table-column
              prop="createTime"
              label="添加日期"
              width="160">
          </el-table-column>

          <el-table-column
              prop="updateTime"
              label="更新日期"
              width="160">
          </el-table-column>

          <el-table-column label="操作">
            <template v-slot="scope">
              <el-button
                  size="small"
                  type="primary"
                  :icon="Edit"
                  @click="edit_chapter(scope.$index, scope.row)">编辑
              </el-button>
              <el-button
                  size="small"
                  type="danger"
                  :icon="Delete"
                  @click="delete_chapter(scope.$index, scope.row)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--表格-->
        <el-dialog title="编辑章节" v-model="editChapterDialog" :before-close="dialog_close">
          <el-form :model="form" label-width="100px">
            <el-form-item label="章节名称:">
              <el-input v-model="form.chapterName" placeholder="请输入媒体库名称"></el-input>
            </el-form-item>

            <el-form-item label="章节路径:">
              <el-input v-model="form.chapterPath" placeholder="请输入媒体库名称"></el-input>
            </el-form-item>

            <el-form-item label="章节封面:">
              <el-input v-model="form.chapterCover" placeholder="请输入媒体库名称"></el-input>
            </el-form-item>
          </el-form>

          <template v-slot:footer>
            <div class="dialog-footer">
              <!--按钮盒子-->
              <div class="btn-box">
                <el-button type="primary" @click="update_chapter">确定</el-button>
                <el-button type="warning" @click="editChapterDialog=false">取消</el-button>
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
