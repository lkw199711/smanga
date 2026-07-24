<template>
  <div class="manga-info">
    <div class="top" :style="[bannerModel === 'toomics' && {marginTop: 0}]">
      <template v-if="banner.length">
        <el-carousel class="carousel" :interval="interval" :type="carouselType" v-if="bannerModel === 'toptoon'">
          <el-carousel-item class="banner-box" v-for="item in banner" :key="item.metaId">
            <img class="banner" :src="item.blob" alt="banner" />
          </el-carousel-item>
          <img class="banner seat" :src="banner.length ? banner[0].blob : ''" alt="banner" />
        </el-carousel>

        <div class="banner-toomics" v-if="bannerModel === 'toomics'">
          <img class="banner-toomics-fore" :src="banner[0]?.blob" alt="banner" />
          <img class="banner-toomics-back" :src="bannerBg?.blob" alt="bannerBg" />
        </div>
      </template>

      <el-image class="anim cover-img" :src="mangaCover" fit="contain" v-else></el-image>
    </div>

    <div class="middle">
      <div class="character" @wheel="character_wheel" v-if="character.length">
        <p class="character-title">角色</p>
        <div class="character-scroll" @wheel="character_wheel" :options="{suppressScrollX: false, suppressScrollY: true}">
          <div v-for="item in character" class="character-item" :key="item.characterId">
            <img :src="item.blob" :alt="item.metaContent" />
            <div class="right">
              <p class="name">{{ item.metaContent }}</p>
              <p class="description">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <el-descriptions class="meta-info" title="漫画信息" :column="infoColum">
        <el-descriptions-item label="漫画名称">{{ mangaInfo.mangaName }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ mangaInfo.author }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ mangaInfo.publishDate }}</el-descriptions-item>
        <el-descriptions-item label="章节总数">{{ mangaInfo.chapterCount }}</el-descriptions-item>
        <el-descriptions-item label="阅读方式">{{ mangaInfo.browseType }}</el-descriptions-item>
        <el-descriptions-item label="所属媒体库">{{ mangaInfo.media?.mediaName }}</el-descriptions-item>
        <el-descriptions-item label="漫画路径">{{ mangaInfo.mangaPath }}</el-descriptions-item>
        <el-descriptions-item label="入库时间">{{ mangaInfo.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ mangaInfo.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="评分">{{ mangaInfo.star }}</el-descriptions-item>
        <el-descriptions-item label="标签">
          <el-tag v-for="item in mangaInfo.tags" :key="item.tagId" class="tag" size="small" :color="item.tagColor">{{ item.tagName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="简介">{{ mangaInfo.describe }}</el-descriptions-item>
      </el-descriptions>

      <div class="action-panel" aria-label="漫画操作">
        <section class="action-reading">
          <div class="action-heading">
            <div>
              <p class="action-eyebrow">阅读</p>
              <h3>从这里开始</h3>
            </div>
            <span class="action-summary">{{ mangaInfo.chapterCount || 0 }} 章</span>
          </div>

          <div class="action-primary">
            <el-button class="action-button action-button--primary" @click="go_chapter">
              <el-icon><Reading /></el-icon>
              <span class="action-button-copy">
                <strong>{{ hasLatest ? '继续阅读' : '开始阅读' }}</strong>
                <small v-if="hasLatest">
                  {{ userConfig.continueReadButtonShowChapterNumberOnly ? `第 ${continueRead.chapterNumber} 章` : continueRead.chapterName }}
                  · 第 {{ continueRead.page }} 页
                </small>
                <small v-else>从第一章开始</small>
              </span>
            </el-button>

            <el-button class="action-button action-button--outline" @click="go_chapter_list">
              <el-icon><Tickets /></el-icon>
              <span>章节列表</span>
            </el-button>
          </div>

          <div class="action-quick">
            <el-button
              :class="['action-button', 'action-button--quiet', {'is-selected': isCollect}]"
              @click="isCollect ? remove_collect() : collect_manga()">
              <el-icon>
                <StarFilled v-if="isCollect" />
                <Star v-else />
              </el-icon>
              <span>{{ isCollect ? '取消收藏' : '收藏漫画' }}</span>
            </el-button>

            <el-button class="action-button action-button--quiet" @click="mangaShareDialog = true">
              <el-icon><Share /></el-icon>
              <span>分享漫画</span>
            </el-button>
          </div>
        </section>

        <section class="action-management">
          <div class="action-heading">
            <div>
              <p class="action-eyebrow">管理</p>
              <h3>内容与资料</h3>
            </div>
            <span class="action-hint">仅影响当前漫画</span>
          </div>

          <div class="action-tool-grid">
            <el-button class="action-tool" @click="editMangaDialog = true">
              <el-icon><EditPen /></el-icon>
              <span>编辑漫画</span>
            </el-button>
            <el-button class="action-tool" @click="editTagsDialog = true">
              <el-icon><PriceTag /></el-icon>
              <span>编辑标签</span>
            </el-button>
            <el-button class="action-tool" @click="open_covers_edit" v-if="hasManyCover">
              <el-icon><Picture /></el-icon>
              <span>编辑封面</span>
            </el-button>
            <el-button class="action-tool" @click="open_metas_edit">
              <el-icon><Document /></el-icon>
              <span>编辑元数据</span>
            </el-button>
          </div>
        </section>
      </div>

      <el-form-item :label="$t('mangaInfo.reverseOrder')" class="op-range">
        <el-switch v-model="chapterListDesc" />
      </el-form-item>

      <div class="chapter-list" v-if="userConfig.simpleChapterView">
        <chapterSimple
          v-for="(i, k) in chapterList"
          :key="k"
          :chapterInfo="i"
          :sourceWebsite="sourceWebsite"
          @click="go_browse(i)"
          @contextmenu.prevent="context_menu($event, i)" />
      </div>
      <div class="chapter-list" v-else>
        <chapter
          v-for="(i, k) in chapterList"
          :key="k"
          :chapterInfo="i"
          :sourceWebsite="sourceWebsite"
          @click="go_browse(i)"
          @contextmenu.prevent="context_menu($event, i)" />
      </div>
    </div>

    <div class="bottom"></div>

    <el-dialog :title="$t('rightSidebar.editTags')" v-model="editTagsDialog">
      <mangaTagBox :mangaId="mangaInfo.mangaId" :tags="mangaInfo.tags" @update_tags="update_tags" @close_dialog="editTagsDialog = false" />
    </el-dialog>

    <manga-modify v-model:editMangaDialog="editMangaDialog" @reload="render_meta" :mangaInfo="mangaInfo" />

    <el-dialog :title="$t('rightSidebar.editCover')" v-model="editCover">
      <div class="cover-setting">
        <div :class="['cover-setting-box', {active: item.active}]" v-for="item in covers" :key="item.metaId">
          <img :src="item.blob" alt="cover" @click="choose_cover(item.metaFile)" />
        </div>
      </div>
    </el-dialog>

    <el-dialog :title="$t('rightSidebar.editMetas')" v-model="editMetasDialog">
      <el-form :model="metaForm" label-width="auto" style="max-width: 600px">
        <el-form-item label="漫画名称">
          <el-input v-model="metaForm.title" placeholder="请输入漫画名称"></el-input>
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="metaForm.author" placeholder="请输入作者名"></el-input>
        </el-form-item>
        <el-form-item label="发布时间">
          <el-date-picker v-model="metaForm.publishDate" type="date" placeholder="请选择发布时间" />
        </el-form-item>
        <el-form-item label="评分">
          <el-input v-model="metaForm.star" placeholder="请输入评分"></el-input>
        </el-form-item>
        <el-form-item label="简介">
          <el-input type="textarea" v-model="metaForm.describe" placeholder="请输入漫画简介"></el-input>
        </el-form-item>
        <el-form-item label="存为JSON">
          <el-switch v-model="metaWriteJson"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="update_metas">保存</el-button>
          <el-button @click="editMetasDialog = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog :title="$t('mangaInfo.mangaShareDialogTitle')" v-model="mangaShareDialog">
      <share :mangaInfo="mangaInfo" @close_dialog="mangaShareDialog = false" />
    </el-dialog>

    <!-- 主题右键菜单 -->
    <theme-context-menu />
  </div>
</template>

<script lang="ts" setup>
import {useRoute, useRouter} from 'vue-router';
import {onMounted, ref, reactive, computed, watch} from 'vue';
import mangaApi from '@/api/manga';
import imageApi from '@/api/image';
import {config, userConfig} from '@/store';
import {tagItemType} from '@/type/tag';
import {metaType, metaInit} from '@/type/meta';
import {mangaType, mangaInit} from '@/type/manga';
import {chapterInit, chapterType} from '@/type/chapter';
import chapterApi from '@/api/chapter';
import lastesApi from '@/api/latest';
import collectApi from '@/api/collect';
import mangaTagBox from '@/views/manga-info/components/manga-tag-box.vue';
import share from '@/components/share.vue';
import useBrowseStore from '@/store/browse';
import chapter from '@/views/manga-info/components/chapter.vue';
import chapterSimple from '@/views/manga-info/components/chapter-simple.vue';
import mangaModify from '@/themes/components/manga-modify-dialog.vue';
import ThemeContextMenu from '@/themes/components/theme-context-menu.vue';
import { openThemeContextMenu } from '@/themes/context-menu';
import {Document, EditPen, Picture, PriceTag, Reading, Share, Star, StarFilled, Tickets} from '@element-plus/icons-vue';
const browse: any = useBrowseStore();
const router = useRouter();
const route = useRoute();

const metaForm = reactive({
  title: '',
  author: '',
  publishDate: '',
  star: '',
  describe: '',
});

const continueRead = ref({
  chapterId: 0,
  chapterName: '',
  chapterNumber: 0,
  page: 0,
});

const chapterList = ref<chapterType[]>([]);
const editMangaDialog = ref(false);

let mangaInfo = reactive<mangaType>(mangaInit);

let hasLatest = ref(false);

let banner = ref<metaType[]>([]);
let covers = ref<metaType[]>([]);
let character = ref<metaType[]>([]);
let mangaCover = ref<string>('');
let isCollect = ref(false);
let editTagsDialog = ref(false);
let editCover = ref(false);
let editMetasDialog = ref(false);
let mangaShareDialog = ref(false);
let bannerModel = ref<string>('toptoon');
let bannerBg = ref<metaType>();
let hasManyCover = ref(false);
let metaWriteJson = ref(true);

let sourceWebsite = ref('');

const interval = ref(6 * 1000);

const carouselType = computed(() => {
  const screen = config.screenType;
  if (['middle', 'large', '2k', '4k'].includes(screen)) {
    return 'card';
  } else {
    return '';
  }
});

const infoColum = computed(() => {
  const screen = config.screenType;
  switch (screen) {
    case 'large':
      return 3;
    case 'middle':
      return 2;
    case 'small':
      return 1;
    case 'mini':
      return 1;
    default:
      return 4;
  }
});

// 从路由 params 获取 mangaId（主题路由使用 params，同时也兼容 query）
const mangaId = computed(() => Number(route.params.mangaId) || Number(route.query.mangaId) || 0);

const chapterListDesc = computed({
  get: () => userConfig.chapterOrder.endsWith('Desc'),
  set: (isDesc: boolean) => {
    const order = userConfig.chapterOrder;
    const baseOrder = order.endsWith('Desc') ? order.slice(0, -4) : order;
    userConfig.chapterOrder = isDesc ? `${baseOrder}Desc` : baseOrder;
  },
});

onMounted(async () => {
  if (!mangaId.value) return;
  await render_meta();
  await get_first_chapter();
  await get_latest_reading();
  await render_chapter_list();
  get_collect_status();
});

// 监听 mangaId 变化（切换漫画时重新加载）
watch(mangaId, async (newId) => {
  if (!newId) return;
  Object.assign(mangaInfo, mangaInit);
  chapterList.value = [];
  banner.value = [];
  character.value = [];
  mangaCover.value = '';
  await render_meta();
  await get_first_chapter();
  await get_latest_reading();
  await render_chapter_list();
  get_collect_status();
});

watch(
  () => userConfig.chapterOrder,
  () => render_chapter_list()
);

async function get_first_chapter() {
  const id = mangaInfo.mangaId;
  if (!id) return;
  continueRead.value = await chapterApi.get_first(id, 'number');
}

async function get_latest_reading() {
  const id = mangaInfo.mangaId;
  if (!id) return;
  const latest = await lastesApi.get_latest(id);
  if (!latest) return;
  if (latest.finish && latest.nextChapter) {
    continueRead.value = latest.nextChapter;
    continueRead.value.page = 1;
  } else if (latest.finish) {
    hasLatest.value = false;
    return;
  } else {
    continueRead.value = latest.chapter;
    continueRead.value.page = latest.page;
    continueRead.value.chapterId = latest.chapterId;
  }
  hasLatest.value = true;
}

async function go_chapter() {
  const chapterInfo = continueRead.value;
  if (!chapterInfo?.chapterId) return;
  if (chapterInfo.page && chapterInfo.page > 1) {
    browse.page = chapterInfo.page;
    localStorage.setItem('pageJump', chapterInfo.page.toString());
  } else {
    browse.page = 1;
  }
  router.push({
    path: `/t/reader/${chapterInfo.chapterId}`,
    query: {
      mediaId: String(mangaInfo.mediaId),
      mangaId: String(mangaInfo.mangaId),
    },
  });
}

function go_chapter_list() {
  browse.chapterListPage = 1;
  router.push(`/t/manga/${mangaInfo.mangaId}/chapters`);
}

async function render_meta() {
  const id = mangaId.value;
  if (!id) return;
  Object.assign(mangaInfo, await mangaApi.get_manga_info(id));
  if (mangaInfo?.media?.sourceWebsite) {
    sourceWebsite.value = mangaInfo?.media?.sourceWebsite;
  }

  mangaCover.value = await imageApi.get({file: mangaInfo.mangaCover});

  if (!mangaInfo.metas) return;

  const title = mangaInfo.metas.find((item: metaType) => item.metaName === 'title')?.metaContent;
  if (title) mangaInfo.title = title;

  const author = mangaInfo.metas.find((item: metaType) => item.metaName === 'author')?.metaContent;
  if (author) mangaInfo.author = author;

  const publishDate = mangaInfo.metas.find((item: metaType) => item.metaName === 'publishDate')?.metaContent;
  if (publishDate) mangaInfo.publishDate = publishDate;

  const describe = mangaInfo.metas.find((item: metaType) => item.metaName === 'describe')?.metaContent;
  if (describe) mangaInfo.describe = describe;

  const star = mangaInfo.metas.find((item: metaType) => item.metaName === 'star')?.metaContent;
  if (star) mangaInfo.star = star;

  covers.value = mangaInfo.metas.filter((item: metaType) => item.metaName === 'cover');
  hasManyCover.value = covers.value.length > 0;

  banner.value = mangaInfo.metas.filter((item: metaType) => /banner/.test(item.metaName));
  bannerBg.value = banner.value.find((item: metaType) => /bannerBackground/.test(item.metaFile));
  if (bannerBg.value) bannerModel.value = 'toomics';
  banner.value.forEach(async (item: metaType) => {
    item.blob = await imageApi.get({file: item.metaFile});
  });

  banner.value.sort((a: any, b: any) => {
    return a.metaFile - b.metaFile;
  });

  character.value = mangaInfo.metas.filter((item: metaType) => item.metaName === 'character');
  character.value.forEach(async (item: metaType) => {
    const blob = await imageApi.get({file: item.metaFile});
    item.blob = blob;
  });
}

async function render_chapter_list() {
  chapterList.value = [];
  const id = mangaInfo.mangaId;
  if (!id) return;
  const chapterListResponse = await chapterApi.get({mangaId: id, mediaId: mangaInfo.mediaId, order: browse.orderBy});
  chapterList.value = chapterListResponse.list;
}

function go_browse(chapter: any) {
  if (chapter?.latest?.finish) {
    browse.page = 1;
  } else if (chapter?.latest) {
    browse.page = chapter.latest.page;
    localStorage.setItem('pageJump', chapter.latest.page);
  } else {
    browse.page = 1;
  }

  browse.chapter = chapter;
  router.push({
    path: `/t/reader/${chapter.chapterId}`,
    query: {
      mediaId: String(chapter.mediaId),
      mangaId: String(chapter.mangaId),
    },
  });
}

function context_menu(event: MouseEvent, info: any) {
  openThemeContextMenu(event, 'chapter', info);
}

function character_wheel(event: any) {
  const content = document.querySelector('.character-scroll');
  if (!content) return;
  event.preventDefault();
  content.scrollLeft += event.deltaY;
}

async function get_collect_status() {
  if (!mangaInfo.mangaId) return;
  isCollect.value = await collectApi.is_collect('manga', mangaInfo.mangaId);
}

async function collect_manga() {
  if (!mangaInfo.mangaId) return;
  await collectApi.add_collect(
    Object.assign(mangaInfo, {
      collectType: 'manga',
    })
  );
  get_collect_status();
}

async function remove_collect() {
  if (!mangaInfo.mangaId) return;
  await collectApi.remove_collect('manga', mangaInfo.mangaId);
  get_collect_status();
}

function open_covers_edit() {
  editCover.value = true;
  covers.value.forEach(async (item: metaType) => {
    item.active = item.metaFile === mangaInfo.mangaCover;
    const blob = await imageApi.get({file: item.metaFile});
    item.blob = blob;
  });
}

function open_metas_edit() {
  editMetasDialog.value = true;
  Object.assign(metaForm, mangaInfo);
}

function choose_cover(metaFile: string) {
  if (!metaFile) return;
  covers.value.forEach((item: metaType) => {
    item.active = item.metaFile === metaFile;
  });
  mangaApi
    .update_manga({
      mangaId: mangaInfo.mangaId,
      mangaCover: metaFile,
    })
    .then(() => {
      mangaInfo.mangaCover = metaFile;
      editCover.value = false;
    })
    .catch((err: any) => {
      console.error('更新封面失败:', err);
    });
}

async function update_metas() {
  if (!mangaInfo.mangaId) return;
  await mangaApi.update_manga_meta(metaForm, metaWriteJson.value);
  editMetasDialog.value = false;
  await render_meta();
}

function update_tags(tagsParams: tagItemType[]) {
  mangaInfo.tags = tagsParams;
}
</script>

<style lang="less" scoped>
.manga-info {
  color: @s-back-text;
}

:deep(.el-form-item__label) {
  --el-text-color-regular: @s-back-text;
}

:deep(.el-carousel__container) {
  height: auto !important;
}

:deep(.el-carousel__mask) {
  background-color: transparent;
}

.chapter-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 2rem 0;
}

.banner-toomics {
  position: relative;
  width: 100%;
  height: 32rem;

  img {
    position: absolute;
    bottom: 0;
    display: block;
    margin: 0 auto;
    object-fit: cover;
  }

  &-fore {
    height: 100%;
    max-width: 100%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
  }

  &-back {
    width: 100%;
    height: 100%;
    z-index: 0;
    filter: blur(2px);
  }
}

.cover-setting {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;

  .cover-setting-box {
    width: 20rem;
    height: 30rem;
    border-radius: 1rem;
    overflow: hidden;
    position: relative;
    border: 0.8rem solid var(--el-border-color);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &:hover {
      cursor: pointer;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }

    &.active {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
    }
  }
}

.character-scroll {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  gap: 0.6rem;
  padding: 1rem;
}

.top {
  margin-top: 2rem;
}

.carousel {
  height: auto;
}

.banner {
  display: block;
  margin: 0 auto;
  max-width: 100%;
}

.seat {
  opacity: 0;
}

.title {
  font-size: 2.4rem;
  text-align: center;
  margin-bottom: 2rem;
}

.character-title {
  color: var(--el-text-color-primary);
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-indent: 2rem;
}

.character {
  white-space: nowrap;
  margin-top: 0;

  &-scroll {
    display: flex;
  }

  &-item {
    display: flex;
    padding: 1rem;
    margin: 0 1rem;
    border: 0.4rem @s-border solid;
    border-radius: 2rem;

    img {
      width: 12rem;
    }

    .right {
      margin-left: 1rem;
      width: 20rem;
      white-space: initial;
      text-indent: 1rem;
      line-height: 1.5;
    }

    .description {
      font-size: 1.2rem;
    }
  }
}

.meta-info {
  margin: 2rem 2rem 0 2rem;
  color: @s-back-text;
}

:deep(.el-descriptions__body) {
  border-radius: 2rem;
  background-color: transparent;
}

.action-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(32rem, 0.75fr);
  gap: 1px;
  width: calc(100% - 4rem);
  max-width: 112rem;
  margin: 1rem auto 2rem 2rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, @s-border 78%, transparent);
  border-radius: 1.6rem;
  background: color-mix(in srgb, @s-border 78%, transparent);
  box-shadow: 0 0.8rem 2.8rem fade(#000000, 7%);
}

.action-reading,
.action-management {
  min-width: 0;
  padding: 2rem;
  background: var(--s-back-soft-original, #f9f9f9);
}

.action-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.6rem;

  h3 {
    margin: 0.3rem 0 0;
    color: @s-back-text;
    font-size: 1.7rem;
    font-weight: 650;
    line-height: 1.3;
  }
}

.action-eyebrow {
  margin: 0;
  color: @s-back-text-tertiary;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.action-summary,
.action-hint {
  flex: none;
  color: @s-back-text-tertiary;
  font-size: 1.2rem;
}

.action-summary {
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  background: color-mix(in srgb, @s-primary 10%, transparent);
  color: @s-primary;
  font-weight: 600;
}

.action-primary {
  display: grid;
  grid-template-columns: minmax(18rem, 1fr) auto;
  gap: 1rem;
}

.action-quick {
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
}

.action-button,
.action-tool {
  margin: 0 !important;
  border-radius: 1rem;
  font-weight: 600;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease,
    box-shadow 160ms ease;

  &:hover {
    transform: translateY(-1px);
  }

  :deep(.el-icon) {
    flex: none;
    font-size: 1.7rem;
  }
}

.action-button {
  min-height: 5.2rem;
  padding: 0 1.6rem;

  &--primary {
    justify-content: flex-start;
    border-color: @s-button;
    background: @s-button;
    color: #ffffff;
    box-shadow: 0 0.6rem 1.8rem color-mix(in srgb, @s-button 22%, transparent);

    &:hover,
    &:focus {
      border-color: @s-button-hover;
      background: @s-button-hover;
      color: #ffffff;
    }
  }

  &--outline {
    border-color: color-mix(in srgb, @s-primary 42%, transparent);
    background: transparent;
    color: @s-primary;

    &:hover,
    &:focus {
      border-color: @s-primary;
      background: color-mix(in srgb, @s-primary 9%, transparent);
      color: @s-primary;
    }
  }

  &--quiet {
    min-height: 4rem;
    padding: 0 1.2rem;
    border-color: color-mix(in srgb, @s-border 88%, transparent);
    background: transparent;
    color: @s-back-text-secondary;

    &:hover,
    &:focus,
    &.is-selected {
      border-color: color-mix(in srgb, @s-primary 35%, transparent);
      background: color-mix(in srgb, @s-primary 9%, transparent);
      color: @s-primary;
    }
  }
}

.action-button-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 0.2rem;
  line-height: 1.3;

  strong {
    font-size: 1.5rem;
  }

  small {
    display: block;
    max-width: 100%;
    overflow: hidden;
    margin-top: 0.2rem;
    opacity: 0.8;
    font-size: 1.1rem;
    font-weight: 400;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.action-tool-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.action-tool {
  justify-content: flex-start;
  min-height: 4.5rem;
  padding: 0 1.2rem;
  border-color: color-mix(in srgb, @s-border 88%, transparent);
  background: transparent;
  color: @s-back-text-secondary;

  &:hover,
  &:focus {
    border-color: color-mix(in srgb, @s-primary 35%, transparent);
    background: color-mix(in srgb, @s-primary 8%, transparent);
    color: @s-primary;
  }
}

.bottom {
  margin-bottom: 6rem;
}

.op-range {
  margin-left: 2rem;
}

.cover-img {
  display: block;
  margin: 0 auto;
  min-width: 14rem;
  height: 40rem;
}

@media only screen and (min-width: 1200px) {
  .action-primary {
    grid-template-columns: minmax(26rem, 34rem) max-content;
    justify-content: start;
  }
}

@media only screen and (min-width: 4096px) {
  .banner {
    width: 100rem;
  }
}

@media only screen and (max-width: 4095px) and (min-width: 2560px) {
  .banner {
    width: 80rem;
  }
}

@media only screen and (max-width: 2559px) and (min-width: 1920px) {
  .banner {
    width: 60rem;
  }
}

@media only screen and (max-width: 1919px) and (min-width: 1200px) {
  .banner {
    width: 50rem;
  }

  .banner-toomics {
    height: 20rem;
  }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  .top {
    margin-top: 0;
  }

  .chapter-list {
    gap: 0.6rem;
  }

  .character {
    img {
      width: 8rem;
    }

    &-item {
      padding: 0.6rem;
      border-radius: 1.2rem;
    }

    .right {
      width: 14rem;
      line-height: 1.5;
    }
  }

  .banner {
    width: 40rem;
  }

  .banner-toomics {
    height: 20rem;
  }

  .action-panel {
    grid-template-columns: 1fr;
  }
}

@media only screen and (max-width: 767px) {
  .top {
    margin-top: 0;
  }

  .chapter-list {
    gap: 0.4rem;
  }

  .character {
    margin-top: 2rem;

    img {
      width: 6rem;
    }

    &-item {
      padding: 0.4rem;
      border-radius: 1rem;
    }

    .right {
      width: 14rem;
      line-height: 1.5;
    }
  }

  .action-panel {
    grid-template-columns: 1fr;
    width: calc(100% - 2rem);
    margin-left: 1rem;
    border-radius: 1.2rem;
  }

  .action-reading,
  .action-management {
    padding: 1.5rem;
  }

  .action-primary {
    grid-template-columns: 1fr;
  }

  .action-button--outline {
    min-height: 4.4rem;
  }

  .action-quick {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .action-button--quiet,
  .action-tool {
    padding: 0 1rem;
  }

  .action-hint {
    display: none;
  }

  .banner-toomics {
    height: 10rem;
  }
}
</style>
