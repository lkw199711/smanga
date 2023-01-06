<template>
    <div class="manga-setting-index">
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
                        prop="mangaId"
                        label="漫画id"
                        width="80">
                </el-table-column>

                <el-table-column
                        prop="mangaName"
                        label="漫画名称"
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
                                size="mini"
                                type="primary"
                                :icon="Edit"
                                @click="edit_manga(scope.$index, scope.row)">编辑
                        </el-button>
                        <el-button
                                size="mini"
                                type="danger"
                                :icon="Delete"
                                @click="delete_manga(scope.$index, scope.row)">删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog title="编辑漫画" v-model="editMangaDialog" :before-close="dialog_close">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="漫画名称:">
                        <el-input v-model="form.mangaName" placeholder="请输入媒体库名称"></el-input>
                    </el-form-item>

                    <el-form-item label="浏览方式:">
                      <el-select v-model="form.browseType" placeholder="请选择浏览方式">
                        <el-option label="瀑布" value="flow"/>
                        <el-option label="单页" value="single" />
                        <el-option label="双页" value="double" />
                      </el-select>
                    </el-form-item>


                    <el-form-item label="漫画路径:">
                        <el-input v-model="form.mangaPath" placeholder="请输入媒体库名称"></el-input>
                    </el-form-item>

                    <el-form-item label="漫画封面:">
                        <el-input v-model="form.mangaCover" placeholder="请输入媒体库名称"></el-input>
                    </el-form-item>
                </el-form>

                <template v-slot:footer>
                  <div class="dialog-footer">
                    <!--按钮盒子-->
                    <div class="btn-box">
                      <el-button type="primary" @click="update_manga">确定</el-button>
                      <el-button type="warning" @click="editMangaDialog=false">取消</el-button>
                    </div>
                  </div>
                </template>

            </el-dialog>
        </div>
    </div>
</template>

<script src='./script/index.ts' lang='ts'></script>

<style src='./style/index.less' scoped lang='less'></style>
