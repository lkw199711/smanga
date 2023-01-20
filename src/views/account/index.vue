<template>
  <div class="account">
    <div class="account-table-box">
      <div class="add-btn-box">
        <el-button class="add-btn" type="primary" :icon="Plus" @click="add_dialog_open">新增账户</el-button>
      </div>
      <!--表格-->
      <el-table
          :data="tableData" stripe border>
        <el-table-column type="index" label="序号" width="50">
        </el-table-column>

        <el-table-column
            prop="userId"
            label="用户id"
            width="70">
        </el-table-column>

        <el-table-column
            prop="userName"
            label="用户名"
            width="140">
        </el-table-column>

        <el-table-column
            prop="registerTime"
            label="注册日期"
            width="180">
        </el-table-column>

        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button
                size="small"
                type="primary"
                :icon="Edit"
                @click="handleEdit(scope.$index, scope.row)">编辑
            </el-button>
            <el-button
                size="small"
                type="danger"
                :icon="Delete"
                @click="handleDelete(scope.$index, scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <table-pager ref="pager" @pageChange="load_table" :count="count"/>
    </div>

    <el-dialog title="新增账户" v-model="addDialog" :before-close="add_dialog_close">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名:">
          <el-input v-model="form.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>

        <el-form-item label="密码:">
          <el-input v-model="form.passWord" placeholder="请输入密码"></el-input>
        </el-form-item>
      </el-form>

      <template v-slot:footer>
        <div class="dialog-footer">
          <!--按钮盒子-->
          <div class="btn-box">
            <el-button type="primary" @click="do_register">确定</el-button>
            <el-button type="warning" @click="add_dialog_close">取消</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="修改账户" v-model="dialogFormVisible" :before-close="dialog_close">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名:">
          <el-input v-model="form.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>

        <el-form-item label="密码:">
          <el-input v-model="form.passWord" placeholder="请输入新密码(留空则不修改)"></el-input>
        </el-form-item>
      </el-form>

      <template v-slot:footer>
        <div class="dialog-footer">
          <!--按钮盒子-->
          <div class="btn-box">
            <el-button type="primary" @click="do_update">修改</el-button>
            <el-button type="warning" @click="dialogFormVisible=false">取消</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang='ts' src="./script/index.ts"></script>

<style scoped lang='less'>
.btn-box {
  display: flex;
  justify-content: flex-end;
}

.add-btn-box {
  margin-bottom: 1.4rem;
}

@media only screen and (min-width: 1200px) {
  .account-table-box {
    width: 100rem;
    margin: 3rem auto;
  }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  .account-table-box {
    width: 70rem;
    margin: 2rem auto;
  }
}

@media only screen and (max-width: 767px) {
  .account-table-box {
    width: 70rem;
    margin: 1rem auto;
  }
}

</style>
