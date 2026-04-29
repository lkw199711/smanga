<template>
  <div class="manga-browser">
    <!-- 顶部面包屑：媒体库 / 路径层级 -->
    <div class="breadcrumb-bar" v-if="currentMedia || !mediaId">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <a class="bc-link" @click.prevent="go_root">{{ $t('mangaBrowser.allMedia') }}</a>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentMedia">
          <a class="bc-link" @click.prevent="go_media_root">{{ currentMedia.mediaName }}</a>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-for="(seg, idx) in pathSegments" :key="idx">
          <a class="bc-link" @click.prevent="go_segment(idx)">{{ seg }}</a>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 加载中 -->
    <template v-if="loading">
      <list-skeleton />
    </template>

    <template v-else>
      <!-- 第一层：媒体库选择 -->
      <div v-if="!mediaId" class="media-grid">
        <div
          v-for="item in mediaList"
          :key="item.mediaId"
          class="media-item"
          @click="enter_media(item)">
          <el-image
            v-if="item.mediaCoverLink"
            class="media-cover"
            :src="item.mediaCoverLink"
            fit="contain"
            :alt="item.mediaName" />
          <el-image v-else :src="placeholder" class="media-cover" fit="fill" />
          <p class="media-name">{{ item.mediaName }}</p>
        </div>
        <div class="empty-tip" v-if="!mediaList.length">{{ $t('mangaBrowser.noMedia') }}</div>
      </div>

      <!-- 媒体库内：目录浏览 + 漫画列表 -->
      <div v-else class="dir-layout">
        <!-- 当前层级下的子目录 -->
        <div class="folder-section" v-if="subFolders.length">
          <div class="section-title">
            <i class="iconfont icon-folder" />
            <span>{{ $t('mangaBrowser.subFolders') }}</span>
            <span class="count">({{ subFolders.length }})</span>
          </div>
          <div class="folder-grid">
            <div
              v-for="folder in subFolders"
              :key="folder.name"
              class="folder-item"
              @click="enter_folder(folder.name)">
              <i class="iconfont icon-folder folder-icon" />
              <span class="folder-name" :title="folder.name">{{ folder.name }}</span>
              <span class="folder-count">{{ folder.count }}</span>
            </div>
          </div>
        </div>

        <!-- 当前层级下的漫画 -->
        <div class="manga-section" v-if="currentMangas.length">
          <div class="section-title">
            <i class="iconfont icon-book" />
            <span>{{ $t('mangaBrowser.mangas') }}</span>
            <span class="count">({{ currentMangas.length }})</span>
          </div>
          <div class="manga-grid">
            <manga
              v-for="item in currentMangas"
              :key="item.mangaId"
              :viewType="config.viewType"
              :mangaInfo="item" />
          </div>
        </div>

        <!-- 空目录提示 -->
        <div class="empty-tip" v-if="!subFolders.length && !currentMangas.length">
          {{ $t('mangaBrowser.emptyDir') }}
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
export default { name: 'manga-browser' };
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import mediaApi from '@/api/media';
import mangaApi from '@/api/manga';
import imageApi from '@/api/image';
import { config } from '@/store';
import { mediaType } from '@/type/media';
import { mangaType } from '@/type/manga';
import manga from '@/components/manga.vue';
import listSkeleton from '@/components/list-skeleton.vue';
import placeholder from '@/assets/s-blue.png';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const mediaList = ref<mediaType[]>([]);
const allMangas = ref<mangaType[]>([]);

// 路由中的 mediaId & 路径
const mediaId = computed<number>(() => Number(route.query.mediaId) || 0);
const currentPath = computed<string>(() => String(route.query.path || ''));
const pathSegments = computed<string[]>(() =>
  currentPath.value ? currentPath.value.split('/').filter(Boolean) : []
);
const currentMedia = computed<mediaType | null>(
  () => mediaList.value.find((m) => m.mediaId === mediaId.value) || null
);

/**
 * 当前层级下的子目录（聚合 parentPath）
 */
const subFolders = computed(() => {
  const prefix = currentPath.value ? currentPath.value.replace(/\/+$/, '') + '/' : '';
  const map = new Map<string, number>();

  for (const m of allMangas.value) {
    const parent = (m.parentPath || '').replace(/\\/g, '/').replace(/\/+$/, '');
    if (!parent) continue;

    // 必须以当前路径为前缀
    if (prefix) {
      if (!(parent + '/').startsWith(prefix)) continue;
    }

    const remain = parent.slice(prefix.length);
    if (!remain) continue;

    const next = remain.split('/')[0];
    map.set(next, (map.get(next) || 0) + 1);
  }

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh'));
});

/**
 * 当前层级直接所属的漫画
 */
const currentMangas = computed<mangaType[]>(() => {
  const target = currentPath.value.replace(/\/+$/, '');
  return allMangas.value.filter((m) => {
    const parent = (m.parentPath || '').replace(/\\/g, '/').replace(/\/+$/, '');
    return parent === target;
  });
});

// 加载媒体库列表
async function load_media() {
  loading.value = true;
  try {
    const res = await mediaApi.get(1, 10000);
    mediaList.value = res.list;
    mediaList.value.forEach(async (item: mediaType) => {
      if (item.mediaCover) {
        item.mediaCoverLink = await imageApi.get({ file: item.mediaCover });
      }
    });
  } finally {
    loading.value = false;
  }
}

// 加载某个媒体库下所有漫画
async function load_mangas() {
  if (!mediaId.value) {
    allMangas.value = [];
    return;
  }
  loading.value = true;
  try {
    // 不分页拉取（后端在不传 page 时返回全部）
    const res = await mangaApi.get(mediaId.value, 0 as any, 0 as any);
    allMangas.value = (res.list || []).map((m: any) => ({
      ...m,
      parentPath: (m.parentPath || '').replace(/\\/g, '/'),
    }));
  } finally {
    loading.value = false;
  }
}

// 路由动作
function go_root() {
  router.push({ name: 'manga-browser' });
}
function go_media_root() {
  router.push({ name: 'manga-browser', query: { mediaId: mediaId.value } });
}
function go_segment(idx: number) {
  const segs = pathSegments.value.slice(0, idx + 1);
  router.push({
    name: 'manga-browser',
    query: { mediaId: mediaId.value, path: segs.join('/') },
  });
}
function enter_media(media: mediaType) {
  router.push({ name: 'manga-browser', query: { mediaId: media.mediaId } });
}
function enter_folder(name: string) {
  const next = pathSegments.value.concat([name]).join('/');
  router.push({
    name: 'manga-browser',
    query: { mediaId: mediaId.value, path: next },
  });
}

// 监听 mediaId 变化时重新加载
watch(
  () => mediaId.value,
  () => {
    load_mangas();
  }
);

onMounted(async () => {
  await load_media();
  if (mediaId.value) await load_mangas();
});
</script>

<style scoped lang="less">
.manga-browser {
  padding: 1.6rem 2rem 4rem;
}

.breadcrumb-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 1.2rem 1.6rem;
  margin-bottom: 1.6rem;
  background-color: @s-background;
  border-radius: 0.8rem;
  box-shadow: rgba(0, 0, 0, 0.08) 0 2px 6px;
  font-size: 1.6rem;

  .bc-link {
    cursor: pointer;
    color: @s-text;
    &:hover {
      color: #409eff;
    }
  }
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.6rem;
  font-weight: 600;
  margin: 1.6rem 0 1rem;
  color: @s-text;

  .iconfont {
    margin-right: 0.6rem;
  }
  .count {
    margin-left: 0.6rem;
    color: #999;
    font-weight: normal;
  }
}

/* 媒体库网格 */
.media-grid {
  display: grid;
  justify-content: space-between;
  grid-template-columns: repeat(auto-fill, 22rem);
  grid-gap: 2.4rem;

  .media-item {
    background-color: @s-media-back;
    color: #f0f0f0;
    border-radius: 1.2rem;
    box-shadow: #9a6e3a 1px 2px 4px;
    cursor: pointer;
    text-align: center;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: #9a6e3a 2px 4px 8px;
    }
  }
  .media-cover {
    width: 100%;
    max-height: 9rem;
  }
  .media-name {
    margin: 0.8rem 0;
    font-size: 1.6rem;
  }
}

/* 子目录网格 */
.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  grid-gap: 1.2rem;
}
.folder-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.2rem;
  background-color: @s-background;
  color: @s-text;
  border-radius: 0.8rem;
  cursor: pointer;
  box-shadow: rgba(0, 0, 0, 0.06) 0 1px 3px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: rgba(0, 0, 0, 0.12) 0 2px 6px;
    color: #409eff;
  }

  .folder-icon {
    font-size: 2.2rem;
    margin-right: 0.8rem;
    color: #e6a23c;
  }
  .folder-name {
    flex: 1;
    font-size: 1.4rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .folder-count {
    font-size: 1.2rem;
    color: #999;
    margin-left: 0.6rem;
  }
}

/* 漫画网格 */
.manga-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  grid-gap: 1.6rem;
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 4rem 0;
  font-size: 1.4rem;
}

@media only screen and (max-width: 767px) {
  .manga-browser {
    padding: 1rem 1rem 3rem;
  }
  .media-grid {
    grid-template-columns: repeat(auto-fill, 14rem);
    grid-gap: 1.2rem;
  }
  .folder-grid {
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  }
}
</style>