<template>
  <div class="account-table-box manage-container">
    <div class="btn-box">
      <el-button type="primary" :icon="Refresh" @click="reload_table">{{ $t('option.refresh') }}</el-button>
      <el-button class="add-btn" type="success" :icon="Plus" @click="add_dialog_open">{{ $t('option.add') }}</el-button>
      <el-button type="danger" :icon="Delete" @click="handleBatchDelete" :disabled="selectedUsers.length === 0">
        {{ $t('option.delete') }}
      </el-button>
    </div>
    <!--表格-->
    <el-table :data="tableData" stripe border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column type="index" :label="$t('account.serial')" width="54"></el-table-column>

      <el-table-column prop="userId" :label="$t('account.id')" width="70"></el-table-column>

      <el-table-column prop="userName" :label="$t('account.name')" width="140"></el-table-column>

      <el-table-column prop="createTime" :label="$t('account.registerTime')" width="180"></el-table-column>

      <el-table-column :label="$t('account.option')">
        <template v-slot="scope">
          <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(scope.$index, scope.row)">{{ $t('option.modify') }}</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(scope.$index, scope.row)">{{ $t('option.delete') }}</el-button>
          <!-- <el-button
                    size="small"
                    type="success"
                    :icon="Lollipop"
                    @click="handlePower(scope.$index, scope.row)">{{ $t('account.power') }}
            </el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <table-pager ref="pager" @pageChange="load_table" :page-size="browse.manageListPageSize" :count="count" />
  </div>

  <el-dialog :title="$t('account.add')" v-model="addDialog" :before-close="add_dialog_close">
    <el-form :model="form" label-width="100px">
      <el-form-item :label="$t('account.nameLabel')">
        <el-input v-model="form.userName" :placeholder="$t('account.namePlace')"></el-input>
      </el-form-item>

      <el-form-item :label="$t('account.passLabel')">
        <el-input v-model="form.passWord" type="password" :placeholder="$t('account.passPlace')"></el-input>
      </el-form-item>
    </el-form>

    <el-form-item :label="'设置为管理员'">
      <el-switch class="auto-compress" v-model="form.role" active-value="admin" inactive-value="user" />
    </el-form-item>

    <el-form-item :label="'开放全媒体库'">
      <el-switch class="auto-compress" v-model="form.mediaPermit" active-value="all" inactive-value="limit" />
    </el-form-item>

    <!--媒体库权限-->
    <template v-if="form.mediaPermit !== 'all'">
      <p class="s-form-title">{{ $t('account.form.title.mediaPower') }}</p>
      <el-checkbox v-for="i in medias" v-model="i.permit" :label="i.mediaName" :key="i.mediaId" size="large" />
    </template>

    <div class="form-note mt-4 text-gray-500 text-sm">
      <p>• 用户名: {{ $t('account.note.name') }}</p>
      <p>• 密码: {{ $t('account.note.pass') }}</p>
      <p>• 设置为管理员: 开放设置界面.</p>
      <p>• 开放全媒体库: 可浏览全部媒体库.</p>
    </div>

    <template v-slot:footer>
      <div class="dialog-footer">
        <!--按钮盒子-->
        <div class="dialog-btn-box">
          <el-button type="primary" @click="do_register">{{ $t('option.confirm') }}</el-button>
          <el-button type="warning" @click="add_dialog_close">{{ $t('option.cancel') }}</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
  <!-- 修改用户信息表单 -->
  <el-dialog :title="$t('account.modify')" v-model="dialogFormVisible" :before-close="dialog_close">
    <el-form :model="form" label-width="100px">
      <el-form-item :label="$t('account.nameLabel')">
        <el-input v-model="form.userName" :placeholder="$t('account.namePlace')"></el-input>
      </el-form-item>

      <el-form-item :label="$t('account.passLabel')">
        <el-input v-model="form.passWord" type="password" :placeholder="$t('account.passModifyPlace')"></el-input>
      </el-form-item>

      <el-form-item :label="'设置为管理员'">
        <el-switch class="auto-compress" v-model="form.role" active-value="admin" inactive-value="user" />
      </el-form-item>

      <el-form-item :label="'开放全媒体库'">
        <el-switch class="auto-compress" v-model="form.mediaPermit" active-value="all" inactive-value="limit" />
      </el-form-item>

      <!--媒体库权限-->
      <template v-if="form.mediaPermit !== 'all'">
        <p class="s-form-title">{{ $t('account.form.title.mediaPower') }}</p>
        <el-checkbox v-for="i in medias" v-model="i.permit" :label="i.mediaName" :key="i.mediaId" size="large" />
      </template>

      <div class="form-note mt-4 text-gray-500 text-sm">
        <p>• 用户名: {{ $t('account.note.name') }}</p>
        <p>• 密码: {{ $t('account.note.pass') }}</p>
        <p>• 设置为管理员: 开放设置界面.</p>
        <p>• 开放全媒体库: 可浏览全部媒体库.</p>
      </div>
    </el-form>

    <template v-slot:footer>
      <div class="dialog-footer">
        <!--按钮盒子-->
        <div class="dialog-btn-box">
          <el-button type="primary" @click="do_update">{{ $t('option.confirm') }}</el-button>
          <el-button type="warning" @click="dialogFormVisible = false">{{ $t('option.cancel') }}</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
export default {name: 'user-manage'};
</script>
<script lang="ts" setup>
import {ref, reactive, onMounted} from 'vue';
import userApi from '@/api/account';
import {Plus, Edit, Delete, Refresh} from '@element-plus/icons-vue';
import tablePager from '@/components/table-pager.vue';
import i18n from '@/i18n';
import mediaApi from '@/api/media';
import useBrowseStore from '@/store/browse';
import type {mediaType} from '@/type/media';
type mediaType1 = mediaType & {permit: boolean};
const browse = useBrowseStore();

const {t} = i18n.global;

const count = ref(0);
const addDialog = ref(false);
const dialogFormVisible = ref(false);
const dialogPower = ref(false);
const tableData = ref([]);
const selectedUsers = ref<any[]>([]);

/**
 * 处理多选框变化
 * @param selection
 */
function handleSelectionChange(selection: any[]) {
  selectedUsers.value = selection;
}
const form = reactive({
  userId: 0,
  userName: '',
  passWord: '',
  role: 'admin',
  mediaPermit: 'all',
});
const formInit = reactive({
  userId: 0,
  userName: '',
  passWord: '',
});
const medias = ref<mediaType1[]>([]);

onMounted(async () => {
  const res = await mediaApi.get(1, 10000);
  medias.value = res.list;
  load_table();
});

/**
 * 编辑用户
 * @param index
 * @param val
 */
function handleEdit(index: number, val: any) {
  dialogFormVisible.value = true;
  Object.assign(form, val);
  form.passWord = '';

  // 加载媒体库许可列表
  medias.value.map((i: any) => {
    i.permit = val.mediaPermissons.includes(i.mediaId);
  });
}

/**
 * 删除用户
 * @param index
 * @param val
 * @returns {Promise<void>}
 */
async function handleDelete(index: number, val: any) {
  ElMessageBox.confirm(t('account.confirmBoxTitle'), t('account.confirmBoxText'), {
    type: 'warning',
  })
    .then(async () => {
      const res = await userApi.delete_account(val.userId);

      if (res.code === 0) {
        reload_table();
      }
    })
    .catch(() => {});
}

function reload_table() {
  tableData.value = [];
  load_table(browse.manageListPage, browse.manageListPageSize);
}
/**
 * 加载表格
 * @returns {Promise<void>}
 */
async function load_table(page = 1, pageSize = browse.manageListPageSize) {
  const res = await userApi.get_account(page, pageSize);
  count.value = Number(res.count);
  tableData.value = res.list;

  browse.manageListPage = page;
  browse.manageListPageSizeCache = pageSize;
}
/**
 * 更改用户请求
 * @returns {Promise<void>}
 */
async function do_update() {
  const targetUserId = form.userId;
  const res = await userApi.update_account(targetUserId, Object.assign(form, {mediaLimit: medias}));

  if (res.code === 0) {
    reload_table();
    dialogFormVisible.value = false;
  }
}
/**
 * 关闭弹框
 */
function dialog_close() {
  dialogFormVisible.value = false;
}
function dialog_close_power() {
  dialogPower.value = false;
}
function add_dialog_open() {
  Object.assign(form, formInit);
  addDialog.value = true;
}
function add_dialog_close() {
  addDialog.value = false;
  reset();
}
/**
 * 注册行为
 * @returns {Promise<void>}
 */
async function do_register() {
  const data = form;

  if (!/^[a-zA-Z]\w{1,19}$/.test(data.userName)) {
    ElMessage({
      message: t('account.formWarning'),
      type: 'warning',
    });
    return;
  }
  if (!data.passWord) {
    ElMessage({
      message: '密码不能为空',
      type: 'warning',
    });
  }
  const res = await userApi.register(Object.assign(form, {mediaLimit: medias}));

  if (res.code === 0) {
    add_dialog_close();
    load_table();
  }
}

/**
 * 清空表单
 */
function reset() {
  Object.assign(form, {
    userName: '',
    passWord: '',
  });
}

function switch_change(val: any, activeVal: string, inactiveVal: string) {
  return val ? activeVal : inactiveVal;
}

/**
 * 批量删除用户
 */
async function handleBatchDelete() {
  if (selectedUsers.value.length === 0) {
    ElMessage({message: '请选择要删除的用户', type: 'warning'});
    return;
  }

  // 添加确认对话框
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可撤销。`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 保存选中用户的数量，以便在清空选中项后仍能显示正确的删除数量
    const deleteCount = selectedUsers.value.length;

    // 批量删除逻辑
    const promises = selectedUsers.value.map(async (user: any) => {
      try {
        await userApi.delete_account(user.userId);
      } catch (error) {
        console.error(`删除用户 ${user.userName} 失败:`, error);
      }
    });

    // 等待所有删除操作完成
    await Promise.all(promises);

    // 重新加载表格数据
    reload_table();

    // 清空选中项
    selectedUsers.value = [];
  } catch (error) {
    // 用户取消操作
  }
}
</script>

<style scoped lang="less" src="@/style/manage.less"></style>
