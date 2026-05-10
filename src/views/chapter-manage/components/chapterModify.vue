<template>
  <el-dialog :title="$t('chapterManage.modify')" v-model="editChapterDialog">
    <el-form :model="form" label-width="11rem">
      <el-form-item :label="$t('chapterManage.form.name')">
        <el-input v-model="form.chapterName" :placeholder="$t('chapterManage.place.name')"></el-input>
      </el-form-item>

      <el-form-item :label="$t('chapterManage.form.path')">
        <el-input v-model="form.chapterPath" :placeholder="$t('chapterManage.place.path')"></el-input>
      </el-form-item>

      <el-form-item :label="$t('chapterManage.form.poster')">
        <el-input v-model="form.chapterCover" :placeholder="$t('chapterManage.place.poster')"></el-input>
      </el-form-item>
      <el-form-item>
        <cover-upload cover-type="chapter" :bind-id="form.chapterId" :init-cover="form.chapterCover" v-on:update:value="value => (form.chapterCover = value)" />
      </el-form-item>

      <el-form-item :label="$t('chapterManage.form.chapterNumber')">
        <el-input v-model="form.chapterNumber" :placeholder="$t('chapterManage.place.chapterNumber')"></el-input>
      </el-form-item>
    </el-form>

    <template v-slot:footer>
      <div class="dialog-footer">
        <!--按钮盒子-->
        <div class="dialog-btn-box">
          <el-button type="primary" @click="do_update_chapter">{{ $t('option.confirm') }}</el-button>
          <el-button type="warning" @click="() => emit('close')">{{ $t('option.cancel') }}</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import {ref, onMounted, reactive, computed, watch} from 'vue';
import chapterApi from '@/api/chapter';
import coverUpload from '@/components/cover-upload.vue';
import i18n from '@/i18n';
import { chapterInit } from '@/type/chapter';
const {t} = i18n.global;
const props = defineProps({
  chapterInfo: {
    type: Object,
    default: () => (chapterInit),
  },
});

const emit = defineEmits(['close', 'reload']);
const editChapterDialog = defineModel<boolean>('editChapterDialog');

const form = reactive(props.chapterInfo);
watch(
  () => props.chapterInfo,
  value => Object.assign(form, value)
);

onMounted(() => {
  Object.assign(form, props.chapterInfo);
});

/**
 * 执行修改请求
 */
async function do_update_chapter() {
  // 表单验证-章节名
  if (!form.chapterName) {
    ElMessage.warning(t('chapterManage.warning.name'));
    return false;
  }
  // 表单验证-章节路径
  if (!form.chapterPath) {
    ElMessage.warning(t('chapterManage.warning.path'));
    return false;
  }

  const res = await chapterApi.update_chapter(form);
  if (res) {
    editChapterDialog.value = false;
    emit('reload');
  }
}
</script>
