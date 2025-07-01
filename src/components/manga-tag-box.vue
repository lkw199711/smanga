<template>
    <div class="base-tag-box">
        <p class="tag-title">{{ $t('rightSidebar.baseTagTitle') }}</p>
        <el-tag v-for="(tagItem,index) in noCheckedTagList" class="tag base-tag" :color="tagItem.tagColor" :key="tagItem.tagId"
            @click="add_tag(tagItem,index)">{{
                tagItem.tagName }}</el-tag>
    </div>

    <div class="ckecked-tag-box">
        <p class="tag-title">{{ $t('rightSidebar.ckeckedTagTitle') }}</p>
        <el-tag v-for="(tagItem,index) in checkedTagList" class="tag ckecked-tag" :color="tagItem.tagColor" :key="tagItem.tagId"
            closable @close="remove_tag(tagItem,index)">{{
                tagItem.tagName }}</el-tag>
    </div>

    <el-form-item label="存为JSON">
        <el-switch v-model="metaWriteJson"></el-switch>
    </el-form-item>

    <div class="btn-box">
        <el-button @click="emit('close_dialog')">{{ $t('option.cancel') }}</el-button>
        <el-button type="primary" @click="update_tags_state">{{ $t('option.confirm') }}</el-button>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { config } from '@/store';
import { ElMessageBox,ElMessage } from 'element-plus';
import i18n from '@/i18n';
import tagApi, { tagItemType } from '@/api/tag';

const { t } = i18n.global;

const drawer = ref(false);
const isCollect = ref(false);
const editTagsDialog = ref(false);
let metaWriteJson = ref(true);
let tagList = ref<tagItemType[]>([]);
let checkedTagList = ref<tagItemType[]>([]);
let noCheckedTagList = ref<tagItemType[]>([]);

async function render_list(){
    checkedTagList.value = props.tags;

    tagList.value = await tagApi.get_nopage();
    const checkedTagListNames = checkedTagList.value.map((i) => i.tagId);

    tagList.value.forEach(element => {
        if (!checkedTagListNames.includes(element.tagId)) noCheckedTagList.value.push(element);
    });
}

const props = defineProps(['mangaId', 'tags']);
const emit = defineEmits(['update_tags','close_dialog']);

onMounted(() => {
    render_list();
});

/**
 * @description: 更新标签状态
 * @return {*}
 */
async function update_tags_state() {
    await tagApi.add_manga_tag(props.mangaId, checkedTagList.value, metaWriteJson.value);
    // 向上更新详情页的tags列表
    emit('update_tags', checkedTagList.value);
    emit('close_dialog')
}

/**
 * @description: 增加漫画标签
 * @param {*} tagItem
 * @return {*}
 */
async function add_tag(tagItem: tagItemType,noCheckedListIndex: number) {
    // 在绑定队列添加标签 在预备队列移除标签
    checkedTagList.value.push(tagItem);
    noCheckedTagList.value.splice(noCheckedListIndex, 1);
}

/**
 * @description: 移除漫画标签
 * @param {*} mangaTagId
 * @return {*}
 */
async function remove_tag(tagItem: tagItemType, index: number) {
    checkedTagList.value.splice(index, 1);
    noCheckedTagList.value.push(tagItem);
}
</script>

<style scoped lang="less">
.right-sidebar-menu {
    width: 32rem;
    max-width: 70vw;
    height: 100%;
    background-color: #545c64;
}

.poster {
    width: 100%;
    max-height: 50%;
    object-fit: cover;
}

.title {
    padding: 1rem 1rem 2rem;
    color: @button-back;
    font-size: 1.6rem;
}

.tag-title {
    margin-bottom: 1rem;
    font-size: 1.4rem;
}

.base-tag-box {
    margin-bottom: 2rem;

    .base-tag {
        cursor: pointer;
    }
}

.ckecked-tag-box {}
</style>