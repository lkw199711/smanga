<template>
  <div class="media-index">
    <div class="media-box">
      <div class="btn-box">
        <el-button class="add-btn" type="primary" :icon="Plus" @click="dialog_open">{{ $t('mediaManage.add') }}
        </el-button>
      </div>

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
            prop="mediaName"
            :label="$t('mediaManage.name')"
            width="140">
        </el-table-column>

        <el-table-column
            prop="createTime"
            :label="$t('mediaManage.createTime')"
            width="180">
        </el-table-column>

        <el-table-column :label="$t('account.option')">
          <template v-slot="scope">
            <el-button
                size="small"
                type="success"
                :icon="Edit"
                @click="edit_media(scope.$index, scope.row)">{{ $t('option.modify') }}
            </el-button>
            <el-button
                size="small"
                type="primary"
                :icon="FolderOpened"
                @click="path_dialog_open(scope.$index, scope.row)">{{ $t('mediaManage.path') }}
            </el-button>
            <el-button
                size="small"
                type="danger"
                :icon="Delete"
                @click="do_delete_media(scope.$index, scope.row)">{{ $t('option.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页-->
      <table-pager ref="pager" @pageChange="load_table" :count="count"/>

      <!--新增媒体库弹框-->
      <el-dialog :title="$t('mediaManage.add')" v-model="addMediaDialog" :before-close="dialog_close">
        <el-form :model="form" label-width="11rem">
          <el-form-item :label="$t('mediaManage.form.name')">
            <el-input v-model="form.mediaName" :placeholder="$t('mediaManage.place.name')"></el-input>
          </el-form-item>

          <el-form-item :label="$t('mediaManage.form.type')">
            <el-select v-model="form.mediaType" placeholder="">
              <el-option :label="$t('mediaManage.select.mediaType0')" value="0"/>
              <el-option :label="$t('mediaManage.select.mediaType1')" value="1"/>
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('mediaManage.form.file')">
            <el-select v-model="form.fileType" placeholder="">
              <el-option :label="$t('mediaManage.select.fileType0')" value="0"/>
              <el-option label="zip" value="1"/>
              <el-option label="pdf" value="2"/>
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('mediaManage.form.browse')">
            <el-select v-model="form.defaultBrowse" placeholder="">
              <el-option :label="$t('mediaManage.select.browse0')" value="flow"/>
              <el-option :label="$t('mediaManage.select.browse1')" value="single"/>
              <el-option :label="$t('mediaManage.select.browse2')" value="double"/>
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('mediaManage.form.directory')">
            <el-select v-model="form.directoryFormat" placeholder="">
              <el-option :label="$t('mediaManage.select.directory0')" value="0"/>
              <el-option :label="$t('mediaManage.select.directory1')" value="1"/>
            </el-select>
          </el-form-item>
        </el-form>

        <template v-slot:footer>
          <div class="dialog-footer">
            <!--按钮盒子-->
            <div class="btn-box">
              <el-button type="primary" @click="do_add_media">{{ $t('option.confirm') }}</el-button>
              <el-button type="warning" @click="addMediaDialog=false">{{ $t('option.cancel') }}</el-button>
            </div>
          </div>
        </template>
      </el-dialog>
      <!--编辑媒体库弹框-->
      <el-dialog :title="$t('mediaManage.modify')" v-model="editMediaDialog" :before-close="dialog_close">
        <el-form :model="form" label-width="11rem">
          <el-form-item :label="$t('mediaManage.form.name')">
            <el-input v-model="form.mediaName" :placeholder="$t('mediaManage.place.name')"></el-input>
          </el-form-item>

          <el-form-item :label="$t('mediaManage.form.type')">
            <el-select v-model="form.mediaType" placeholder="">
              <el-option :label="$t('mediaManage.select.mediaType0')" value="0"/>
              <el-option :label="$t('mediaManage.select.mediaType1')" value="1"/>
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('mediaManage.form.file')">
            <el-select v-model="form.fileType" placeholder="">
              <el-option :label="$t('mediaManage.select.fileType0')" value="0"/>
              <el-option label="zip" value="1"/>
              <el-option label="pdf" value="2"/>
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('mediaManage.form.browse')">
            <el-select v-model="form.defaultBrowse" placeholder="">
              <el-option :label="$t('mediaManage.select.browse0')" value="flow"/>
              <el-option :label="$t('mediaManage.select.browse1')" value="single"/>
              <el-option :label="$t('mediaManage.select.browse2')" value="double"/>
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('mediaManage.form.directory')">
            <el-select v-model="form.directoryFormat" placeholder="">
              <el-option :label="$t('mediaManage.select.directory0')" value="0"/>
              <el-option :label="$t('mediaManage.select.directory1')" value="1"/>
            </el-select>
          </el-form-item>
        </el-form>
        <template v-slot:footer>
          <div class="dialog-footer">
            <!--按钮盒子-->
            <div class="btn-box">
              <el-button type="primary" @click="update_media">{{ $t('option.confirm') }}</el-button>
              <el-button type="warning" @click="editMediaDialog=false">{{ $t('option.cancel') }}</el-button>
            </div>
          </div>
        </template>
      </el-dialog>
      <!--编辑媒体库路径弹框-->
      <el-dialog :title="$t('path.modify')" v-model="addPathDialog" :before-close="()=>{addPathDialog=false}">
        <el-form :model="form" label-width="100px">
          <el-form-item :label="$t('mediaManage.form.name')">
            <el-input disabled v-model="form.mediaName" :placeholder="$t('mediaManage.place.name')"/>
          </el-form-item>

          <el-form-item :label="$t('path.form.add')">
            <el-input v-model="pathCache" :placeholder="$t('path.place.add')">
              <template #append>
                <el-button :icon="Plus" @click="add_path_cache"/>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item :label="$t('path.form.path')">
            <div v-for="i in pathArr" :key="i" class="path-item">
              {{ i.path }}
              <div class="path-btn-box">
                <el-button class="path-item-btn" size="small" type="success" @click="scan_path(i)">
                  {{ $t('path.button.update') }}
                </el-button>
                <el-button class="path-item-btn" size="small" type="warning" @click="rescan_path(i)">
                  {{ $t('path.button.re') }}
                </el-button>
                <el-button class="path-item-btn" size="small" type="danger" @click="delete_path(i)">
                  {{ $t('option.delete') }}
                </el-button>
              </div>
            </div>
          </el-form-item>
        </el-form>

        <template v-slot:footer>
          <div class="dialog-footer">
            <!--按钮盒子-->
            <div class="btn-box">
              <el-button type="primary" @click="addPathDialog=false">{{ $t('option.delete') }}</el-button>
              <el-button type="warning" @click="addPathDialog=false">{{ $t('option.cancel') }}</el-button>
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
