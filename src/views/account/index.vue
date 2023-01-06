<template>
  <div class="account-index">
    <div class="account-box">
      <div class="add-btn-box">
        <el-button class="add-btn" type="primary" :icon="Plus" @click="add_dialog_open">新增账户</el-button>
      </div>
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
                size="mini"
                type="primary"
                :icon="Edit"
                @click="handleEdit(scope.$index, scope.row)">编辑
            </el-button>
            <el-button
                size="mini"
                type="danger"
                :icon="Delete"
                @click="handleDelete(scope.$index, scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
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
.account-box {
  width: 120rem;
  margin: 10rem auto;
}

.btn-box {
  display: flex;
  justify-content: flex-end;
}

.add-btn-box {
  margin-bottom: 1.4rem;
}
</style>
