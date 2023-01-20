<template>
  <div class="manga-setting-index">
    <div class="manga-setting-box">
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
            prop="mangaId"
            :label="$t('mangaManage.id')"
            width="86">
        </el-table-column>

        <el-table-column
            prop="mangaName"
            :label="$t('mangaManage.name')"
            width="180">
        </el-table-column>

        <el-table-column
            prop="createTime"
            :label="$t('mangaManage.createTime')"
            width="160">
        </el-table-column>

        <el-table-column
            prop="updateTime"
            :label="$t('mangaManage.updateTime')"
            width="160">
        </el-table-column>

        <el-table-column :label="$t('account.option')">
          <template v-slot="scope">
            <el-button
                size="small"
                type="primary"
                :icon="Edit"
                @click="edit_manga(scope.$index, scope.row)">{{ $t('option.modify') }}
            </el-button>
            <el-button
                size="small"
                type="danger"
                :icon="Delete"
                @click="delete_manga(scope.$index, scope.row)">{{ $t('option.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页-->
      <table-pager ref="pager" @pageChange="load_table" :count="count"/>

      <el-dialog :title="$t('mangaManage.modify')" v-model="editMangaDialog" :before-close="dialog_close">
        <el-form :model="form" label-width="11rem">
          <el-form-item :label="$t('mangaManage.form.name')">
            <el-input v-model="form.mangaName" :placeholder="$t('mangaManage.place.name')"></el-input>
          </el-form-item>

          <el-form-item :label="$t('mangaManage.form.browse')">
            <el-select v-model="form.browseType" :placeholder="$t('mangaManage.place.browse')">
              <el-option label="瀑布" value="flow"/>
              <el-option label="单页" value="single"/>
              <el-option label="双页" value="double"/>
            </el-select>
          </el-form-item>


          <el-form-item :label="$t('mangaManage.form.path')">
            <el-input v-model="form.mangaPath" :placeholder="$t('mangaManage.place.path')"></el-input>
          </el-form-item>

          <el-form-item :label="$t('mangaManage.form.poster')">
            <el-input v-model="form.mangaCover" :placeholder="$t('mangaManage.place.poster')"></el-input>
          </el-form-item>
        </el-form>

        <template v-slot:footer>
          <div class="dialog-footer">
            <!--按钮盒子-->
            <div class="btn-box">
              <el-button type="primary" @click="update_manga">{{ $t('option.confirm') }}</el-button>
              <el-button type="warning" @click="editMangaDialog=false">{{ $t('option.cancel') }}</el-button>
            </div>
          </div>
        </template>

      </el-dialog>
    </div>
  </div>
</template>

<script src='./script/index.ts' lang='ts'></script>

<style src='./style/index.less' scoped lang='less'></style>
