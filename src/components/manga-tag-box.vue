<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-09-23 14:12:32
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-12-15 20:50:03
 * @FilePath: /smanga/src/components/manga-tag-box.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AEplate
-->
<template>
    <div class="base-tag-box">
        <p class="tag-title">{{ $t('rightSidebar.baseTagTitle') }}</p>
        <el-tag v-for="tagItem in noCheckedTagList" class="tag base-tag" :color="tagItem.tagColor" :key="tagItem.tagId"
            @click="add_manga_tag(tagItem)">{{
                tagItem.tagName }}</el-tag>
    </div>

    <div class="ckecked-tag-box">
        <p class="tag-title">{{ $t('rightSidebar.ckeckedTagTitle') }}</p>
        <el-tag v-for="tagItem in checkedTagList" class="tag ckecked-tag" :color="tagItem.tagColor" :key="tagItem.tagId"
            closable @close="remove_tag(tagItem.mangaTagId)">{{
                tagItem.tagName }}</el-tag>
    </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits, computed, onMounted } from 'vue';
import { config } from '@/store';
import { ElMessageBox } from 'element-plus';
import i18n from '@/i18n';
import tagApi, { tagItemType } from '@/api/tag';

const { t } = i18n.global;

const drawer = ref(false);
const isCollect = ref(false);
const editTagsDialog = ref(false);

let tagList = ref<tagItemType[]>([]);
let checkedTagList = ref<tagItemType[]>([]);

let noCheckedTagList = computed<tagItemType[]>(() => {
    let arr: tagItemType[] = [];
    const checkedTagListNames = checkedTagList.value.map((i) => i.tagId);

    tagList.value.forEach(element => {

        if (!checkedTagListNames.includes(element.tagId)) arr.push(element);
    });

    return arr;
});

const props = defineProps(['mangaId', 'tags']);
const emit = defineEmits(['update_tags']);

onMounted(async () => {
    tagList.value = await tagApi.get_nopage();
    checkedTagList.value = props.tags;
});

/**
 * @description: 更新标签状态
 * @return {*}
 */
async function update_tags_state() {
    const tags = await tagApi.get_manga_tag(props.mangaId);
    checkedTagList.value = tags;
    // 向上更新详情页的tags列表
    emit('update_tags', tags);
}

/**
 * @description: 增加漫画标签
 * @param {*} tagItem
 * @return {*}
 */
async function add_manga_tag(tagItem: tagItemType) {
    await tagApi.add_manga_tag(props.mangaId, tagItem.tagId);
    update_tags_state();
}

/**
 * @description: 移除漫画标签
 * @param {*} mangaTagId
 * @return {*}
 */
async function remove_tag(mangaTagId: number) {
    await tagApi.remove_manga_tag(mangaTagId);
    update_tags_state();
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