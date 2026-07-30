<template>
  <div class="manga-info">
    <div :class="['top', {'top--cover-only': !banner.length}]" :style="[bannerModel === 'toomics' && {marginTop: 0}]">
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

      <div :class="['detail-overview', {'detail-overview--with-cover': !banner.length}]">
        <aside class="overview-cover" v-if="!banner.length" aria-label="漫画封面">
          <el-image class="overview-cover-img" :src="mangaCover" fit="contain" :alt="mangaInfo.mangaName"></el-image>
        </aside>

        <section class="meta-info" aria-labelledby="manga-info-title">
        <header class="meta-heading">
          <div class="meta-title-block">
            <p class="section-eyebrow">漫画信息</p>
            <h1 id="manga-info-title">{{ mangaInfo.mangaName }}</h1>
            <p class="meta-author" v-if="mangaInfo.author">作者：{{ mangaInfo.author }}</p>
          </div>

          <div class="meta-tags" v-if="mangaInfo.tags?.length">
            <el-tag v-for="item in mangaInfo.tags" :key="item.tagId" class="tag" size="small" :color="item.tagColor">
              {{ item.tagName }}
            </el-tag>
          </div>
        </header>

        <p class="meta-description" v-if="mangaInfo.describe">{{ mangaInfo.describe }}</p>

        <el-descriptions class="meta-summary" :column="summaryInfoColumn">
          <el-descriptions-item label="发布时间">{{ mangaInfo.publishDate || '—' }}</el-descriptions-item>
          <el-descriptions-item label="章节总数">{{ mangaInfo.chapterCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="评分">{{ mangaInfo.star || '—' }}</el-descriptions-item>
          <el-descriptions-item label="阅读方式">{{ mangaInfo.browseType || '—' }}</el-descriptions-item>
        </el-descriptions>

        <details class="technical-info">
          <summary>
            <span>文件与收录信息</span>
            <small>媒体库、路径及更新时间</small>
          </summary>
          <el-descriptions class="technical-summary" :column="infoColum">
            <el-descriptions-item label="所属媒体库">{{ mangaInfo.media?.mediaName || '—' }}</el-descriptions-item>
            <el-descriptions-item label="漫画路径">{{ mangaInfo.mangaPath || '—' }}</el-descriptions-item>
            <el-descriptions-item label="入库时间">{{ mangaInfo.createTime || '—' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ mangaInfo.updateTime || '—' }}</el-descriptions-item>
          </el-descriptions>
        </details>
        </section>

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
            <el-button class="action-tool" @click="editMetasDialog = true">
              <el-icon><Document /></el-icon>
              <span>编辑元数据</span>
            </el-button>
          </div>
          </section>
        </div>
      </div>

      <section class="chapter-section" aria-labelledby="chapter-section-title">
        <header class="chapter-toolbar">
          <div>
            <p class="section-eyebrow">目录</p>
            <div class="chapter-title-line">
              <h2 id="chapter-section-title">章节目录</h2>
              <span>{{ chapterList.length }} 章</span>
            </div>
          </div>

          <div class="chapter-controls">
            <div class="view-switch" aria-label="章节显示方式">
              <button
                type="button"
                :class="{active: userConfig.simpleChapterView}"
                :aria-pressed="userConfig.simpleChapterView"
                @click="userConfig.simpleChapterView = true">
                简洁
              </button>
              <button
                type="button"
                :class="{active: !userConfig.simpleChapterView}"
                :aria-pressed="!userConfig.simpleChapterView"
                @click="userConfig.simpleChapterView = false">
                图文
              </button>
            </div>

            <label class="order-switch">
              <span>{{ chapterListDesc ? '倒序' : '正序' }}</span>
              <el-switch v-model="chapterListDesc" :aria-label="$t('mangaInfo.reverseOrder')" />
            </label>
          </div>
        </header>

        <div class="chapter-list chapter-list--simple" v-if="userConfig.simpleChapterView">
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

        <div class="chapter-empty" v-if="!chapterList.length">暂无章节</div>
      </section>
    </div>

    <div class="bottom"></div>

    <TagEditorDialog
      v-model="editTagsDialog"
      :manga-id="mangaInfo.mangaId"
      :tags="mangaInfo.tags"
      @update:tags="update_tags"
    />

    <manga-modify v-model:editMangaDialog="editMangaDialog" @reload="render_meta" :mangaInfo="mangaInfo" />

    <manga-cover-edit-dialog
      v-model="editCover"
      :manga-id="mangaInfo.mangaId"
      :current-cover="mangaInfo.mangaCover"
      :covers="covers"
      @reload="render_meta"
      @update:cover="(v) => (mangaInfo.mangaCover = v)"
    />

    <manga-meta-edit-dialog
      v-model="editMetasDialog"
      :manga-info="mangaInfo"
      @reload="render_meta"
    />




    <el-dialog :title="$t('mangaInfo.mangaShareDialogTitle')" v-model="mangaShareDialog">
      <share :mangaInfo="mangaInfo" @close_dialog="mangaShareDialog = false" />
    </el-dialog>

    <!-- 主题右键菜单 -->
    <theme-context-menu />
  </div>
</template>

<script lang="ts" setup>
import {useRoute, useRouter} from 'vue-router';
import {onBeforeUnmount, onMounted, ref, reactive, computed, watch} from 'vue';
import mangaApi from '@/api/manga';
import imageApi from '@/api/image';
import {config, userConfig} from '@/store';
import {tagItemType} from '@/type/tag';
import {metaType} from '@/type/meta';
import {mangaType, mangaInit} from '@/type/manga';
import {chapterType} from '@/type/chapter';
import chapterApi from '@/api/chapter';
import lastesApi from '@/api/latest';
import collectApi from '@/api/collect';
import TagEditorDialog from '@/themes/components/tag-editor-dialog.vue';
import share from '@/components/share.vue';
import useBrowseStore from '@/store/browse';
import chapter from '@/views/manga-info/components/chapter.vue';
import chapterSimple from '@/views/manga-info/components/chapter-simple.vue';
import mangaModify from '@/themes/components/manga-modify-dialog.vue';
import mangaCoverEditDialog from '@/themes/components/manga-cover-edit-dialog.vue';
import mangaMetaEditDialog from '@/themes/components/manga-meta-edit-dialog.vue';
import ThemeContextMenu from '@/themes/components/theme-context-menu.vue';
import { openThemeContextMenu, THEME_CHAPTER_READ_CHANGED_EVENT } from '@/themes/context-menu';
import {Document, EditPen, Picture, PriceTag, Reading, Share, Star, StarFilled, Tickets} from '@element-plus/icons-vue';
const browse: any = useBrowseStore();
const router = useRouter();
const route = useRoute();



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

const summaryInfoColumn = computed(() => Math.min(infoColum.value, 4));

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
  window.addEventListener(THEME_CHAPTER_READ_CHANGED_EVENT, refresh_continue_reading);
  await render_meta();
  await get_first_chapter();
  await get_latest_reading();
  await render_chapter_list();
  get_collect_status();
});

onBeforeUnmount(() => {
  window.removeEventListener(THEME_CHAPTER_READ_CHANGED_EVENT, refresh_continue_reading);
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

async function refresh_continue_reading() {
  hasLatest.value = false;
  await get_first_chapter();
  await get_latest_reading();
}

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

.meta-info,
.action-panel {
  box-sizing: border-box;
  width: calc(100% - 4rem);
  max-width: 112rem;
  margin-right: auto;
  margin-left: 2rem;
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
    filter: blur(0.2rem);
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
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    }

    &.active {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.8);
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

.section-eyebrow {
  margin: 0;
  color: @s-back-text-tertiary;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.meta-info {
  margin-top: 2rem;
  padding: 2rem;
  border: 1px solid color-mix(in srgb, @s-border 78%, transparent);
  border-radius: 1.6rem;
  background: var(--s-back-soft-original, #f9f9f9);
  color: @s-back-text;
}

.meta-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
}

.meta-title-block {
  min-width: 0;

  h1 {
    margin: 0.4rem 0 0;
    font-size: clamp(2rem, 2.2vw, 3rem);
    font-weight: 700;
    line-height: 1.25;
    word-break: break-word;
  }
}

.meta-author {
  margin: 0.6rem 0 0;
  color: @s-back-text-secondary;
}

.meta-tags {
  display: flex;
  max-width: 45%;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.6rem;
}

.meta-description {
  margin: 1.8rem 0 0;
  color: @s-back-text-secondary;
  font-size: 1.4rem;
  line-height: 1.75;
  white-space: pre-wrap;
}

.meta-summary {
  margin-top: 2rem;
}

:deep(.meta-summary .el-descriptions__body),
:deep(.technical-summary .el-descriptions__body) {
  background-color: transparent;
}

:deep(.meta-info .el-descriptions__table) {
  width: 100%;
  table-layout: fixed;
}

:deep(.meta-info .el-descriptions__cell),
:deep(.meta-info .el-descriptions__content) {
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.technical-info {
  margin-top: 1.2rem;
  border-top: 1px solid color-mix(in srgb, @s-border 72%, transparent);

  summary {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.4rem 0 0.2rem;
    cursor: pointer;
    color: @s-back-text-secondary;
    font-weight: 600;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }

    small {
      color: @s-back-text-tertiary;
      font-size: 1.1rem;
      font-weight: 400;
    }

    &::after {
      margin-left: auto;
      color: @s-primary;
      content: '展开';
      font-size: 1.2rem;
      font-weight: 500;
    }
  }

  &[open] summary::after {
    content: '收起';
  }
}

.technical-summary {
  margin-top: 1.4rem;
}

.action-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(32rem, 0.75fr);
  gap: 1px;
  margin-top: 1rem;
  margin-bottom: 2rem;
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
  border-radius: 99.9rem;
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

.chapter-section {
  width: calc(100% - 4rem);
  margin-top: 1rem;
  margin-right: auto;
  margin-bottom: 2rem;
  margin-left: 2rem;
}

.chapter-toolbar {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  width: 100%;
  max-width: 112rem;
  padding: 1.6rem 2rem;
  border: 1px solid color-mix(in srgb, @s-border 78%, transparent);
  border-radius: 1.4rem;
  background: var(--s-back-soft-original, #f9f9f9);
}

.chapter-title-line {
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
  margin-top: 0.3rem;

  h2 {
    margin: 0;
    color: @s-back-text;
    font-size: 1.8rem;
  }

  span {
    color: @s-back-text-tertiary;
    font-size: 1.2rem;
  }
}

.chapter-controls {
  display: flex;
  align-items: center;
  gap: 1.6rem;
}

.view-switch {
  display: flex;
  padding: 0.3rem;
  border: 1px solid color-mix(in srgb, @s-border 80%, transparent);
  border-radius: 0.9rem;
  background: color-mix(in srgb, @s-border 18%, transparent);

  button {
    min-width: 5.2rem;
    padding: 0.5rem 1rem;
    border: 0;
    border-radius: 0.6rem;
    background: transparent;
    color: @s-back-text-tertiary;
    cursor: pointer;
    font: inherit;
    font-size: 1.2rem;
    transition:
      background-color 160ms ease,
      color 160ms ease,
      box-shadow 160ms ease;

    &.active {
      background: var(--s-back-soft-original, #f9f9f9);
      color: @s-primary;
      font-weight: 600;
      box-shadow: 0 0.2rem 0.8rem fade(#000000, 8%);
    }
  }
}

.order-switch {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: @s-back-text-secondary;
  font-size: 1.2rem;
}

.chapter-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(42rem, 1fr));
  gap: 1rem;
  margin-top: 1rem;

  > * {
    min-width: 0;
  }

  &--simple {
    grid-template-columns: repeat(auto-fill, minmax(24rem, 1fr));
  }
}

.chapter-empty {
  padding: 5rem 2rem;
  color: @s-back-text-tertiary;
  text-align: center;
}

.overview-cover {
  display: none;
  box-sizing: border-box;
  padding: 1rem;
  border: 1px solid color-mix(in srgb, @s-border 78%, transparent);
  border-radius: 1.6rem;
  background: var(--s-back-soft-original, #f9f9f9);
  box-shadow: 0 0.8rem 2.8rem fade(#000000, 6%);
}

.overview-cover-img {
  display: block;
  width: 100%;
  height: 40rem;
  border-radius: 1rem;
}

.cover-img {
  display: block;
  margin: 0 auto;
  min-width: 14rem;
  height: 40rem;
}

@media only screen and (min-width: 120rem) {
  .action-primary {
    grid-template-columns: minmax(26rem, 34rem) max-content;
    justify-content: start;
  }

  .top--cover-only {
    display: none;
  }

  .detail-overview--with-cover {
    display: grid;
    grid-template-areas:
      'cover meta'
      'cover actions';
    grid-template-columns: minmax(22rem, 28rem) minmax(0, 1fr);
    align-items: start;
    gap: 1.6rem;
    width: calc(100% - 4rem);
    max-width: 140rem;
    margin: 2rem auto 2rem 2rem;
  }

  .detail-overview--with-cover > .overview-cover {
    display: block;
    grid-area: cover;
  }

  .detail-overview--with-cover > .meta-info {
    grid-area: meta;
  }

  .detail-overview--with-cover > .action-panel {
    grid-area: actions;
  }

  .detail-overview--with-cover > .meta-info,
  .detail-overview--with-cover > .action-panel {
    box-sizing: border-box;
    width: 100%;
    max-width: none;
    margin: 0;
  }
}

@media only screen and (min-width: 192rem) {
  .detail-overview {
    display: grid;
    grid-template-columns: minmax(48rem, 0.9fr) minmax(78rem, 1.1fr);
    align-items: start;
    gap: 1.6rem;
    width: calc(100% - 4rem);
    max-width: 180rem;
    margin: 2rem auto 2rem 2rem;
  }

  .detail-overview > .meta-info,
  .detail-overview > .action-panel {
    box-sizing: border-box;
    width: 100%;
    max-width: none;
    margin: 0;
  }

  .detail-overview--with-cover {
    grid-template-areas:
      'cover meta'
      'cover actions';
    grid-template-columns: minmax(24rem, 30rem) minmax(0, 1fr);
  }
}

@media only screen and (min-width: 409.6rem) {
  .banner {
    width: 100rem;
  }
}

@media only screen and (max-width: 409.5rem) and (min-width: 256rem) {
  .banner {
    width: 80rem;
  }
}

@media only screen and (max-width: 255.9rem) and (min-width: 192rem) {
  .banner {
    width: 60rem;
  }
}

@media only screen and (max-width: 191.9rem) and (min-width: 120rem) {
  .banner {
    width: 50rem;
  }

  .banner-toomics {
    height: 20rem;
  }
}

@media only screen and (max-width: 119.9rem) and (min-width: 76.8rem) {
  .top {
    margin-top: 0;
  }

  .chapter-list {
    grid-template-columns: 1fr;
    gap: 0.6rem;

    &--simple {
      grid-template-columns: repeat(auto-fill, minmax(24rem, 1fr));
    }
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

@media only screen and (max-width: 76.7rem) {
  .top {
    margin-top: 0;
  }

  .chapter-list {
    grid-template-columns: 1fr;
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

  .meta-info,
  .action-panel,
  .chapter-section {
    width: calc(100% - 2rem);
    margin-left: 1rem;
  }

  .meta-info {
    padding: 1.5rem;
    border-radius: 1.2rem;
  }

  .meta-heading {
    flex-direction: column;
    gap: 1.2rem;
  }

  .meta-tags {
    max-width: none;
    justify-content: flex-start;
  }

  .technical-info summary small {
    display: none;
  }

  .action-panel {
    grid-template-columns: 1fr;
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

  .chapter-toolbar {
    align-items: flex-start;
    flex-direction: column;
    gap: 1.4rem;
    padding: 1.5rem;
  }

  .chapter-controls {
    width: 100%;
    justify-content: space-between;
  }

  .banner-toomics {
    height: 10rem;
  }
}
</style>
