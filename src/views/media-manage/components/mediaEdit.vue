<template>
  <!--编辑媒体库弹框-->
  <el-dialog :title="mediaEditTitle" v-model="editMediaDialog">
    <el-form :model="form" label-width="11rem">
      <el-form-item :label="$t('mediaManage.form.name')">
        <el-input v-model="form.mediaName" :placeholder="$t('mediaManage.place.name')"></el-input>
      </el-form-item>

      <!-- 是否为单本漫画 -->
      <el-form-item :label="$t('mediaManage.singleManga')">
        <el-switch v-model="form.mediaType" :active-value="1" :inactive-value="0" />
      </el-form-item>

      <!-- 是否为云盘库 -->
      <el-form-item :label="$t('mediaManage.cloudMedia')">
        <el-switch v-model="form.isCloudMedia" :active-value="1" :inactive-value="0" />
      </el-form-item>

      <!-- 浏览方式 -->
      <el-form-item :label="$t('mediaManage.form.browse')">
        <el-radio-group v-model="form.browseType" class="ml-4">
          <el-radio :value="'flow'" size="large">{{ $t('mediaManage.select.browse0') }}</el-radio>
          <el-radio :value="'single'" size="large">{{ $t('mediaManage.select.browse1') }}</el-radio>
          <el-radio :value="'double'" size="large">{{ $t('mediaManage.select.browse2') }}</el-radio>
          <el-radio :value="'half'" size="large">{{ $t('mediaManage.select.browse3') }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 封面设置 -->
      <template v-if="props.editModel === 'modify'">
        <el-form-item :label="$t('mediaManage.form.cover')">
          <el-input v-model="form.mediaCover" disabled>
            <template #append>
              <el-button @click="create_media_cover">生成封面</el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <cover-upload cover-type="media" :bind-id="form.mediaId" :init-cover="form.mediaCover" v-on:update:value="value => (form.mediaCover = value)" />
        </el-form-item>
      </template>

      <el-form-item :label="$t('mediaManage.doubleFolder')">
        <el-switch v-model="form.directoryFormat" :active-value="1" :inactive-value="0" />
      </el-form-item>

      <el-form-item :label="$t('mediaManage.form.sourceWebsite')">
        <el-select v-model.number="form.sourceWebsite" class="r30">
          <el-option label="无" value="" />
          <el-option label="toptoon" value="toptoon" />
          <el-option label="toomics" value="toomics" />
        </el-select>
      </el-form-item>

      <!--阅读字段-->
      <p class="s-form-title">{{ $t('mediaManage.title.read') }}</p>
      <el-form-item :label="$t('mediaManage.form.removeFirst')">
        <el-switch v-model.number="form.removeFirst" :active-value="1" :inactive-value="0" />
      </el-form-item>

      <el-form-item :label="$t('mediaManage.form.direction')">
        <el-radio-group v-model="form.direction" class="ml-4">
          <el-radio :value="0" size="large">{{ $t('mediaManage.select.ltr') }}</el-radio>
          <el-radio :value="1" size="large">{{ $t('mediaManage.select.rtl') }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <div class="form-note mt-4">
      <p>• {{ $t('mediaManage.note.name') }}</p>
      <p>• {{ $t('mediaManage.note.type') }}</p>
      <p>• {{ $t('mediaManage.note.browse') }}</p>
      <p>• {{ $t('mediaManage.note.cover') }}</p>
      <p>• {{ $t('mediaManage.note.directory') }}</p>
      <p>• {{ $t('mediaManage.note.sourceWebsite') }}</p>
      <p>• {{ $t('mediaManage.note.removeFirst') }}</p>
      <p>• {{ $t('mediaManage.note.direction') }}</p>
    </div>
    <template v-slot:footer>
      <div class="dialog-footer">
        <!--按钮盒子-->
        <div class="dialog-btn-box">
          <el-button type="primary" @click="media_submit">{{ $t('option.confirm') }}</el-button>
          <el-button type="warning" @click="editMediaDialog = false">{{ $t('option.cancel') }}</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import {reactive, computed, watch} from 'vue';
import mediaApi from '@/api/media';
import i18n from '@/i18n';
import coverUpload from '@/components/cover-upload.vue';
import { mediaInit } from '@/type/media';

const {t} = i18n.global;

const editMediaDialog = defineModel<boolean>('editMediaDialog');
const props = defineProps({
  editModel: {
    type: String,
    default: 'modify',
  },
  mediaInfo: {
    type: Object,
    default: () => (mediaInit),
  },
});
const emit = defineEmits(['reload']);

const mediaEditTitle = computed(() => {
  return props.editModel === 'modify' ? t('mediaManage.modify') : t('mediaManage.add');
});

const form = reactive(props.mediaInfo);
watch(
  () => props.mediaInfo,
  newVal => Object.assign(form, newVal)
);

/**
 * 编辑媒体库请求
 */
async function media_submit() {
  // 表单验证
  if (!form.mediaName) {
    ElMessage({
      message: t('path.warning.name'),
      type: 'warning',
    });

    return false;
  }

  const res = props.editModel === 'add' ? await mediaApi.add_media(form) : await mediaApi.update_media(form);

  if (res.code === 0) {
    editMediaDialog.value = false;
    emit('reload');
  }
}

/**
 * 生成海报
 * @param mediaId
 */
async function create_media_cover() {
  const coverFile = await mediaApi.create_cover(form.mediaId);
  form.mediaCover = coverFile;
}
</script>

<style lang="less" scoped src="@/style/manage.less"></style>
