<template>
  <div class="media-index">
    <div class="media-box">
      <div class="btn-box">
        <el-button class="add-btn" type="primary" :icon="Plus" @click="dialog_open">新增媒体库</el-button>
      </div>

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
            prop="mediaName"
            label="媒体库名称"
            width="140">
        </el-table-column>

        <el-table-column
            prop="createTime"
            label="添加日期"
            width="180">
        </el-table-column>

        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button
                size="small"
                type="success"
                :icon="Edit"
                @click="edit_media(scope.$index, scope.row)">编辑
            </el-button>
            <el-button
                size="small"
                type="primary"
                :icon="FolderOpened"
                @click="path_dialog_open(scope.$index, scope.row)">路径
            </el-button>
            <el-button
                size="small"
                type="danger"
                :icon="Delete"
                @click="do_delete_media(scope.$index, scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页-->
      <table-pager ref="pager" @pageChange="load_table" :count="count"/>

      <!--新增媒体库弹框-->
      <el-dialog title="新增媒体库" v-model="addMediaDialog" :before-close="dialog_close">
        <el-form :model="form" label-width="100px">
          <el-form-item label="媒体库名称:">
            <el-input v-model="form.mediaName" placeholder="请输入媒体库名称"></el-input>
          </el-form-item>

          <el-form-item label="媒体类型:">
            <el-select v-model="form.mediaType" placeholder="please select your zone">
              <el-option label="漫画(漫画 -> 章节 -> 图片)" value="0"/>
              <el-option label="单本(漫画 -> 图片)" value="1" />
            </el-select>
          </el-form-item>

          <el-form-item label="文件类型:">
            <el-select v-model="form.fileType" placeholder="please select your zone">
              <el-option label="图片" value="0"/>
              <el-option label="zip" value="1"/>
              <el-option label="pdf" value="2"/>
            </el-select>
          </el-form-item>

          <el-form-item label="默认浏览方式:">
            <el-select v-model="form.defaultBrowse" placeholder="请选择默认浏览方式">
              <el-option label="瀑布" value="flow"/>
              <el-option label="单页" value="single"/>
              <el-option label="双页" value="double"/>
            </el-select>
          </el-form-item>

          <el-form-item label="文件夹结构:">
            <el-select v-model="form.directoryFormat" placeholder="please select your zone">
              <el-option label="漫画 -> 章节(或压缩包) -> 图片" value="0"/>
              <el-option label="目录 -> 漫画 -> 章节(或压缩包) -> 图片" value="1"/>
            </el-select>
          </el-form-item>
        </el-form>

        <template v-slot:footer>
          <div class="dialog-footer">
            <!--按钮盒子-->
            <div class="btn-box">
              <el-button type="primary" @click="do_add_media">确定</el-button>
              <el-button type="warning" @click="addMediaDialog=false">取消</el-button>
            </div>
          </div>
        </template>
      </el-dialog>
      <!--编辑媒体库弹框-->
      <el-dialog title="编辑媒体库" v-model="editMediaDialog" :before-close="dialog_close">
        <el-form :model="form" label-width="100px">
          <el-form-item label="媒体库名称:">
            <el-input v-model="form.mediaName" placeholder="请输入媒体库名称"></el-input>
          </el-form-item>

          <el-form-item label="媒体类型:">
            <el-select v-model="form.mediaType" placeholder="请选择媒体类型">
              <el-option label="漫画(漫画 -> 章节 -> 图片)" value="0"/>
              <el-option label="单本(漫画 -> 图片)" value="1" />
            </el-select>
          </el-form-item>

          <el-form-item label="文件类型:">
            <el-select v-model="form.fileType" placeholder="请选择默认文件类型">
              <el-option label="图片" value="0"/>
              <el-option label="zip" value="1"/>
              <el-option label="pdf" value="2"/>
            </el-select>
          </el-form-item>

          <el-form-item label="默认浏览方式:">
            <el-select v-model="form.defaultBrowse" placeholder="请选择默认浏览方式">
              <el-option label="瀑布" value="flow"/>
              <el-option label="单页" value="single"/>
              <el-option label="双页" value="double"/>
            </el-select>
          </el-form-item>

          <el-form-item label="文件夹结构:">
            <el-select v-model="form.directoryFormat" placeholder="please select your zone">
              <el-option label="漫画 -> 章节(或压缩包) -> 图片" value="0"/>
              <el-option label="目录 -> 漫画 -> 章节(或压缩包) -> 图片" value="1"/>
            </el-select>
          </el-form-item>
        </el-form>
        <template v-slot:footer>
          <div class="dialog-footer">
            <!--按钮盒子-->
            <div class="btn-box">
              <el-button type="primary" @click="update_media">确定</el-button>
              <el-button type="warning" @click="editMediaDialog=false">取消</el-button>
            </div>
          </div>
        </template>
      </el-dialog>
      <!--编辑媒体库路径弹框-->
      <el-dialog title="编辑路径" v-model="addPathDialog" :before-close="()=>{addPathDialog=false}">
        <el-form :model="form" label-width="100px">
          <el-form-item label="媒体库名称:">
            <el-input disabled v-model="form.mediaName" placeholder="请输入媒体库名称"></el-input>
          </el-form-item>

          <el-form-item label="新增路径:">
            <el-input v-model="pathCache" placeholder="请输入路径">
              <template #append>
                <el-button :icon="Plus" @click="add_path_cache"/>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="路径:">
            <div v-for="i in pathArr" :key="i" class="path-item">
              {{ i.path }}
              <div class="path-btn-box">
                <el-button class="path-item-btn" size="small" type="success" @click="scan_path(i)">增量扫描
                </el-button>
                <el-button class="path-item-btn" size="small" type="warning" @click="rescan_path(i)">重新扫描
                </el-button>
                <el-button class="path-item-btn" size="small" type="danger" @click="delete_path(i)">删除
                </el-button>
              </div>
            </div>
          </el-form-item>
        </el-form>

        <template v-slot:footer>
          <div class="dialog-footer">
            <!--按钮盒子-->
            <div class="btn-box">
              <el-button type="primary" @click="addPathDialog=false">确定</el-button>
              <el-button type="warning" @click="addPathDialog=false">取消</el-button>
            </div>
          </div>
        </template>
      </el-dialog>

    </div>
  </div>
</template>

<script lang='js' src="./script/index.ts"></script>

<style scoped lang='less'>
.btn-box {
  margin-bottom: 1.4rem;
}

.dialog-footer {
  .btn-box {
    display: flex;
    justify-content: flex-end;
  }
}

.path-item {
  display: flex;
  justify-content: space-between;
  line-height: 3.4rem;

  .path-item-btn {
    height: 2rem;
  }

}

@media only screen and (min-width: 1200px) {
  .media-box {
    width: 100rem;
    margin: 3rem auto;
  }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  .media-box {
    width: 74rem;
    margin: 2rem auto;
  }
}

@media only screen and (max-width: 767px) {
  .media-box {
    width: 72rem;
    margin: 1rem auto;
  }
}
</style>
