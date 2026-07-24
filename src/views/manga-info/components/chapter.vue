<template>
  <div :class="['chapter', sourceWebsite]">
    <div class="chapter-image-box" ref="chapterImageBox">
      <!-- 封面图片 -->
      <el-image ref="chapterCoverImg" class="anim chapter-cover-img" :src="chapterCoverSrc" :fit="chapterCoverFit" :alt="chapterName" />
      <!-- 顶通封面二 -->
      <el-image v-if="blobLink1" class="anim chapter-cover-img" :src="blobLink1" :fit="chapterCoverFit" :alt="chapterName" />
    </div>

    <div class="chapter-info">
      <!-- 章节序号 -->
      <p class="chapter-index">{{ chapterInfo.chapterNumber }}</p>

      <!--章节名称-->
      <p class="chapter-name">{{ chapterName }}</p>
    </div>

    <!--已读图标-->
    <i :class="['iconfont', 'icon-success-fill', 'icon-is-read', {'is-show': isRead}]" />

    <!-- 阅读进度 -->
    <el-progress class="progress" :percentage="percentage" :show-text="false" v-if="percentage" />
  </div>
</template>

<script lang="ts">
export default {name: 'manga-chapter-item'};
</script>
<script lang="ts" setup>
import imageApi from '@/api/image';
import queue from '@/store/quque';
import {chapterType} from '@/type/chapter';
import {getFileNameWithoutExtension} from '@/utils';
import {ref, onMounted, onBeforeUnmount, computed} from 'vue';
import placeholder from '@/assets/s-blue.png';

type chapterItemType = chapterType & {blob: string; chapterCover: string; pageImage: string};
const props = defineProps(['chapterInfo', 'bookmark', 'sourceWebsite']);
const fit = 'cover';
const chapterCoverFit = computed(() => (props.sourceWebsite === 'toptoon' ? 'contain' : fit));
let blobLink = ref('');
let blobLink1 = ref('');

const chapterCoverSrc = computed(() => {
  return blobLink.value || placeholder;
});
const chapterCoverImg = ref(null);
const chapterImageBox = ref(null);
const chapterName = ref(props.chapterInfo.chapterName);

const percentage = computed(() => {
  const latest = props.chapterInfo?.latest;
  if (!latest) {
    return false;
  }

  if (latest.finish) {
    return false;
  }

  if (latest?.page && latest?.count) {
    return (latest.page / latest.count) * 100;
  }

  return false;
});

const isRead = computed(() => {
  const latest = props.chapterInfo?.latest;
  return latest?.finish;
});

const observe = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      queue.mangaQueue.add(() => get_poster(props.chapterInfo));
    }
  });
});

onMounted(() => {
  chapterImageBox.value && observe.observe(chapterImageBox.value);
});

onBeforeUnmount(() => {
  observe.disconnect();
});

async function get_poster(item: chapterItemType) {
  const coverPath = item.chapterCover || item.pageImage;
  // const coverBaseName = getFileNameWithoutExtension(coverPath);
  // const coverExt = coverPath.split('.').pop() || 'jpg';
  blobLink.value = await imageApi.get({file: coverPath});
  if (props.sourceWebsite === 'toptoon') {
    const chapterBaseName = getFileNameWithoutExtension(coverPath);
    blobLink1.value = await imageApi.get({file: chapterBaseName + '-1.jpg'});
  }
}
</script>

<style scoped lang="less">
.chapter {
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
  height: 9rem;
  padding: 0.8rem 1.2rem 0.8rem 0.8rem;
  border: 1px solid color-mix(in srgb, @s-border 82%, transparent);
  border-radius: 1.2rem;
  background: var(--s-back-soft-original, #f9f9f9);
  color: @s-back-text;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease,
    box-shadow 160ms ease;

  &:hover {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, @s-primary 38%, transparent);
    background: color-mix(in srgb, @s-primary 5%, var(--s-back-soft-original, #f9f9f9));
    box-shadow: 0 0.5rem 1.6rem fade(#000000, 7%);
  }

  &-cover-img {
    width: 100%;
    height: 100%;
    position: relative;
    background-color: @s-back-soft;
  }

  &-image-box {
    position: relative;
    flex: 0 0 10rem;
    align-self: stretch;
    overflow: hidden;
    border-radius: 0.8rem;
  }

  .progress {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 0.2rem;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1;
  }

}

.chapter-info {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
  height: 100%;
  flex: 1;
}

.chapter-index,
.chapter-name {
  margin: 0;
  font-size: 1.6rem;
  line-height: 1.5;
}

.chapter-index {
  max-width: 100%;
  color: @s-back-text-tertiary;
  font-size: 1.2rem;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
}

.chapter-name {
  display: -webkit-box;
  min-width: 0;
  overflow: hidden;
  color: @s-back-text;
  font-weight: 600;
  overflow-wrap: anywhere;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.chapter.toptoon {
  .chapter-image-box {
    display: flex;
    min-width: 0;
    flex: 0 0 auto;
    aspect-ratio: 13 / 9;
    background: @s-back-soft;
  }

  .chapter-cover-img {
    width: 50%;
    flex: 0 0 50%;
  }

  .chapter-name {
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }
}

.chapter-view-list {
  position: relative;
  display: flex;
  margin-bottom: 1rem;
}

.anim {
  opacity: 0;
  animation: mymove 1s ease-in forwards;
}

.icon-bookmark {
  position: absolute;
  top: 0;
  left: 0;
  color: @s-bookmark;
  font-size: 2rem;
}

.icon-is-read {
  color: @s-isread;
  flex: none;
  height: 3rem;
  font-size: 3rem;
  overflow: hidden;
  border-radius: 100%;
  background-color: var(--s-back-soft-original, #f9f9f9);
  z-index: 1;
  opacity: 0;

  &.is-show {
    opacity: 1;
  }
}

@keyframes mymove {
  10% {
    opacity: 0.1;
  }

  50% {
    opacity: 0.5;
  }

  60% {
    opacity: 0.6;
  }

  90% {
    opacity: 0.9;
  }

  100% {
    opacity: 1;
  }
}

@media screen {
}

@media only screen and (min-width: 1920px) {
  .chapter.toomics {
    height: 9.6rem;
  }

  .chapter.toptoon {
    height: 14.1rem;
  }
}

@media only screen and (max-width: 1919px) and (min-width: 1200px) {
  .chapter.toomics {
    height: 9.6rem;
  }

  .chapter.toptoon {
    height: 14.1rem;
  }

}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  .chapter.toomics {
    height: 9.6rem;
  }

  .chapter.toptoon {
    height: 14.1rem;
  }

}

@media only screen and (max-width: 767px) {
  .chapter.toomics {
    height: 6rem;
  }

  .chapter.toptoon {
    height: 11rem;
  }

  .chapter {
    height: 6rem;
    gap: 0.6rem;
    padding: 0.5rem 0.8rem 0.5rem 0.5rem;

    .chapter-image-box {
      flex-basis: 6.5rem;
    }

  }

  .chapter-info {
    gap: 0.2rem;
  }

  .chapter-index {
    font-size: 1.1rem;
    line-height: 1.3;
  }

  .chapter-name {
    font-size: 1.4rem;
    line-height: 1.4;
  }

  .icon-is-read {
    height: 2.4rem;
    font-size: 2.4rem;
  }
}
</style>
