<template>
  <div class="account">
    <div class="account-table-box">
      <div class="add-btn-box">
        <el-button class="add-btn" type="primary" :icon="Plus" @click="add_dialog_open">{{ $t('account.add') }}
        </el-button>
      </div>
      <!--表格-->
      <el-table :data="tableData" stripe border>
        <el-table-column type="index" :label="$t('account.serial')" width="54">
        </el-table-column>

        <el-table-column prop="userId" :label="$t('account.id')" width="70">
        </el-table-column>

        <el-table-column prop="userName" :label="$t('account.name')" width="140">
        </el-table-column>

        <el-table-column prop="createTime" :label="$t('account.registerTime')" width="180">
        </el-table-column>

        <el-table-column :label="$t('account.option')">
          <template v-slot="scope">
            <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(scope.$index, scope.row)">{{
              $t('option.modify') }}
            </el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(scope.$index, scope.row)">{{
              $t('option.delete') }}
            </el-button>
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
        <p class="note form-note">{{ $t('account.note.name') }}</p>

        <el-form-item :label="$t('account.passLabel')">
          <el-input v-model="form.passWord" :placeholder="$t('account.passPlace')"></el-input>
        </el-form-item>
        <p class="note form-note">{{ $t('account.note.pass') }}</p>
      </el-form>

      <el-form-item :label="'设置为管理员'">
        <el-switch class="auto-compress" v-model="form.role" active-value="admin" inactive-value="user" />
      </el-form-item>
      <p class="note form-note">开放设置界面</p>

      <el-form-item :label="'开放全媒体库'">
        <el-switch class="auto-compress" v-model="form.mediaPermit" active-value="all" inactive-value="limit" />
      </el-form-item>
      <p class="note form-note">可浏览全部媒体库</p>

      <!--媒体库权限-->
      <template v-if="form.mediaPermit !== 'all'">
        <p class="s-form-title">{{ $t('account.form.title.mediaPower') }}</p>
        <el-checkbox v-for="i in medias" v-model="i.permit" :label="i.mediaName" :key="i.mediaId" size="large" />
      </template>

      <template v-slot:footer>
        <div class="dialog-footer">
          <!--按钮盒子-->
          <div class="btn-box">
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
        <p class="note form-note">{{ $t('account.note.name') }}</p>

        <el-form-item :label="$t('account.passLabel')">
          <el-input v-model="form.passWord" :placeholder="$t('account.passModifyPlace')"></el-input>
        </el-form-item>
        <p class="note form-note">{{ $t('account.note.pass') }}</p>

        <el-form-item :label="'设置为管理员'">
          <el-switch class="auto-compress" v-model="form.role" active-value="admin" inactive-value="user" />
        </el-form-item>
        <p class="note form-note">开放设置界面</p>

        <el-form-item :label="'开放全媒体库'">
          <el-switch class="auto-compress" v-model="form.mediaPermit" active-value="all" inactive-value="limit" />
        </el-form-item>
        <p class="note form-note">可浏览全部媒体库</p>

        <!--媒体库权限-->
        <template v-if="form.mediaPermit !== 'all'">
          <p class="s-form-title">{{ $t('account.form.title.mediaPower') }}</p>
          <el-checkbox v-for="i in medias" v-model="i.permit" :label="i.mediaName" :key="i.mediaId" size="large" />
        </template>

      </el-form>

      <template v-slot:footer>
        <div class="dialog-footer">
          <!--按钮盒子-->
          <div class="btn-box">
            <el-button type="primary" @click="do_update">{{ $t('option.confirm') }}</el-button>
            <el-button type="warning" @click="dialogFormVisible = false">{{ $t('option.cancel') }}</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script lang="ts">export default { name: 'user-manage' }</script>
<script lang='ts' setup>
import { ref, reactive, onMounted } from 'vue';
import userApi from '@/api/account';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import tablePager from '@/components/table-pager.vue';
import i18n from '@/i18n';
import mediaApi from '@/api/media';
import useBrowseStore from '@/store/browse';
import type { mediaType } from '@/type/media';
type mediaType1 = mediaType & { permit: boolean };
const browse = useBrowseStore();

const { t } = i18n.global;

const count = ref(0);
const addDialog = ref(false);
const dialogFormVisible = ref(false);
const dialogPower = ref(false);
const tableData = ref([]);
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
})


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
  ElMessageBox.confirm(
    t('account.confirmBoxTitle'),
    t('account.confirmBoxText'),
    {
      type: 'warning',
    }
  )
    .then(async () => {
      const res = await userApi.delete_account(val.userId);

      if (res.code === 0) {
        reload_table();
      }
    })
    .catch(() => { });
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
  const res = await userApi.update_account(
    targetUserId,
    Object.assign(form, { mediaLimit: medias })
  );

  if (res.code === 0) {
    reload_table()
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
  const res = await userApi.register(
    Object.assign(form, { mediaLimit: medias })
  );

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

</script>

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
