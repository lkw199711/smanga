<template>
  <el-dialog :title="$t('mangaManage.modify')" v-model="editMangaDialog">
    <el-form :model="form" label-width="11rem">
      <el-form-item :label="$t('mangaManage.form.name')">
        <el-input v-model="form.mangaName" :placeholder="$t('mangaManage.place.name')"></el-input>
      </el-form-item>

      <el-form-item :label="$t('mangaManage.form.path')">
        <el-input v-model="form.mangaPath" :placeholder="$t('mangaManage.place.path')"></el-input>
      </el-form-item>

      <!-- 封面设置 -->
      <el-form-item :label="$t('mangaManage.form.poster')">
        <!-- 服务器路径输入 -->
        <el-input v-model="form.mangaCover" :placeholder="$t('mangaManage.place.poster')" class="mb-3"></el-input>
      </el-form-item>

      <!-- 使用全局封面上传组件 -->
      <el-form-item>
        <cover-upload cover-type="manga" :init-cover="form.mangaCover" :bind-id="form.mangaId" @update:value="value => (form.mangaCover = value)" />
      </el-form-item>

      <!--阅读字段-->
      <p class="s-form-title">{{ $t('mediaManage.title.read') }}</p>

      <el-form-item :label="$t('mangaManage.form.browse')">
        <el-select v-model="form.browseType" :placeholder="$t('mangaManage.place.browse')">
          <el-option :label="$t('mediaManage.select.browse0')" value="flow" />
          <el-option :label="$t('mediaManage.select.browse1')" value="single" />
          <el-option :label="$t('mediaManage.select.browse2')" value="double" />
          <el-option :label="$t('mediaManage.select.browse3')" value="half" />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('mediaManage.form.removeFirst')">
        <el-switch v-model.number="form.removeFirst" :active-value="1" :inactive-value="0" />
      </el-form-item>

      <el-form-item :label="$t('mediaManage.form.direction')">
        <el-radio-group v-model="form.direction" class="ml-4">
          <el-radio :value="0" size="large">{{ $t('mediaManage.select.ltr') }}</el-radio>
          <el-radio :value="1" size="large">{{ $t('mediaManage.select.rtl') }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <div class="form-note mt-4 text-gray-500 text-sm">
        <p>• {{ $t('mediaManage.note.browse') }}</p>
        <p>• {{ $t('mediaManage.note.removeFirst') }}</p>
        <p>• {{ $t('mediaManage.note.direction') }}</p>
      </div>
    </el-form>

    <template v-slot:footer>
      <div class="dialog-footer">
        <!--按钮盒子-->
        <div class="dialog-btn-box">
          <el-button type="primary" @click="update_manga">{{ $t('option.confirm') }}</el-button>
          <el-button type="warning" @click="editMangaDialog = false">{{ $t('option.cancel') }}</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import {defineModel, reactive, watch} from 'vue';
import mangaApi from '@/api/manga';
import coverUpload from '@/components/cover-upload.vue';
import { mangaInit } from '@/type/manga';
import i18n from '@/i18n';

const {t} = i18n.global;
const editMangaDialog = defineModel<boolean>('editMangaDialog');
const props = defineProps({
  mangaInfo: {
    type: Object,
    default: () => (mangaInit),
  },
});

const emit = defineEmits(['close', 'reload']);

const form = reactive(props.mangaInfo);
watch(
  () => props.mangaInfo,
  value => Object.assign(form, value)
);

async function update_manga() {
  // 表单校验-检查漫画名
  if (!form.mangaName) {
    ElMessage.warning(t('mangaManage.warning.name'));
    return false;
  }
  // 表单校验-检查漫路径
  if (!form.mangaPath) {
    ElMessage.warning(t('mangaManage.warning.path'));
    return false;
  }

  const res = await mangaApi.update_manga(form);

  if (res.code === 0) {
    editMangaDialog.value = false;
    emit('reload');
  }
}
</script>

<style lang="less" scoped src="@/style/manage.less"></style>