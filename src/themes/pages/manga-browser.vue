<template>
	<div :class="['t-folder-browser', `is-${themeVariant.toLowerCase()}`]">
		<nav class="t-folder-browser__breadcrumb" aria-label="目录路径">
			<button type="button" @click="goRoot">{{ $t('mangaBrowser.allMedia') }}</button>
			<template v-if="currentMedia">
				<span aria-hidden="true">/</span>
				<button type="button" @click="goMediaRoot">{{ currentMedia.mediaName }}</button>
			</template>
			<template v-for="(segment, index) in pathSegments" :key="`${segment}-${index}`">
				<span aria-hidden="true">/</span>
				<button type="button" @click="goSegment(index)">{{ segment }}</button>
			</template>
		</nav>

		<div v-if="loading" class="t-folder-browser__loading" aria-live="polite">
			<div v-for="index in 8" :key="index" class="t-folder-browser__skeleton"></div>
		</div>

		<div v-else-if="errorMessage" class="t-folder-browser__empty" role="alert">
			<span>{{ errorMessage }}</span>
			<button type="button" @click="reload">重新加载</button>
		</div>

		<section v-else-if="!mediaId" class="t-folder-browser__section">
			<div class="t-folder-browser__heading">
				<h1>{{ $t('mangaBrowser.allMedia') }}</h1>
				<span v-if="mediaList.length">{{ mediaList.length }}</span>
			</div>
			<div v-if="mediaList.length" class="t-folder-browser__media-grid">
				<button
					v-for="media in mediaList"
					:key="media.mediaId"
					type="button"
					class="t-folder-browser__media"
					@click="enterMedia(media)"
				>
					<t-cover
						class="t-folder-browser__media-cover"
						:variant="themeVariant"
						:seed="media.mediaId"
						:file="media.mediaCover"
						fit="cover"
					>
						<span v-if="!media.mediaCover" aria-hidden="true">📁</span>
					</t-cover>
					<span class="t-folder-browser__media-info">
						<strong>{{ media.mediaName }}</strong>
						<small>{{ Number(media.mangaCount || 0) }} 部漫画</small>
					</span>
					<span class="t-folder-browser__chevron" aria-hidden="true">›</span>
				</button>
			</div>
			<div v-else class="t-folder-browser__empty">{{ $t('mangaBrowser.noMedia') }}</div>
		</section>

		<template v-else>
			<section v-if="subFolders.length" class="t-folder-browser__section">
				<div class="t-folder-browser__heading">
					<h1>{{ $t('mangaBrowser.subFolders') }}</h1>
					<span>{{ subFolders.length }}</span>
				</div>
				<div class="t-folder-browser__folder-grid">
					<button
						v-for="folder in subFolders"
						:key="folder.name"
						type="button"
						class="t-folder-browser__folder"
						:title="folder.name"
						@click="enterFolder(folder.name)"
					>
						<span class="t-folder-browser__folder-icon" aria-hidden="true">📁</span>
						<span class="t-folder-browser__folder-name">{{ folder.name }}</span>
						<span class="t-folder-browser__folder-count">{{ folder.count }}</span>
						<span class="t-folder-browser__chevron" aria-hidden="true">›</span>
					</button>
				</div>
			</section>

			<section v-if="currentMangas.length" class="t-folder-browser__section">
				<div class="t-folder-browser__heading">
					<h1>{{ $t('mangaBrowser.mangas') }}</h1>
					<span>{{ currentMangas.length }}</span>
				</div>
				<div class="t-folder-browser__manga-grid">
					<t-manga-card
						v-for="manga in currentMangas"
						:key="manga.mangaId"
						:item="manga"
						:variant="themeVariant"
						:meta="`${manga.chapterCount || 0} 章节`"
						@click="goManga(manga)"
						@contextmenu="openThemeContextMenu($event, 'manga', manga)"
					/>
				</div>
			</section>

			<div v-if="!subFolders.length && !currentMangas.length" class="t-folder-browser__empty">
				{{ $t('mangaBrowser.emptyDir') }}
			</div>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import mediaApi from '@/api/media'
import mangaApi from '@/api/manga'
import pathApi from '@/api/path'
import type { mediaType } from '@/type/media'
import type { mangaType } from '@/type/manga'
import { themeState } from '@/themes/store'
import { openThemeContextMenu } from '@/themes/context-menu'
import TCover from '@/themes/components/media-cover.vue'
import TMangaCard from '@/themes/components/manga-card.vue'

type ThemeVariant = 'A' | 'B' | 'D'
type FolderSummary = { name: string; count: number }

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const errorMessage = ref('')
const mediaList = ref<mediaType[]>([])
const allMangas = ref<mangaType[]>([])
const browseBase = ref('')
let loadVersion = 0

const themeVariant = computed<ThemeVariant>(() =>
	themeState.current === 'B' || themeState.current === 'D' ? themeState.current : 'A'
)
const mediaId = computed(() => Number(route.query.mediaId) || 0)
const currentPath = computed(() => normalizeRelativePath(String(route.query.path || '')))
const pathSegments = computed(() => currentPath.value.split('/').filter(Boolean))
const currentMedia = computed(
	() => mediaList.value.find((media) => media.mediaId === mediaId.value) || null
)

const subFolders = computed<FolderSummary[]>(() => {
	const prefix = currentPath.value ? `${currentPath.value}/` : ''
	const folders = new Map<string, number>()

	for (const manga of allMangas.value) {
		const parentPath = normalizeRelativePath(manga.parentPath || '')
		if (!parentPath) continue
		if (prefix && !`${parentPath}/`.startsWith(prefix)) continue

		const remainder = parentPath.slice(prefix.length)
		const nextFolder = remainder.split('/')[0]
		if (!nextFolder) continue
		folders.set(nextFolder, (folders.get(nextFolder) || 0) + 1)
	}

	return Array.from(folders, ([name, count]) => ({ name, count }))
		.sort((left, right) => left.name.localeCompare(right.name, 'zh'))
})

const currentMangas = computed(() => {
	const targetPath = currentPath.value
	return allMangas.value.filter(
		(manga) => normalizeRelativePath(manga.parentPath || '') === targetPath
	)
})

function normalizeRelativePath(path: string): string {
	return path.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '')
}

function normalizeAbsolutePath(path: string): string {
	if (!path) return ''
	const normalized = path.replace(/\\/g, '/')
	if (/^[a-zA-Z]:\/?$/.test(normalized)) return `${normalized.slice(0, 2)}/`
	if (normalized === '/') return '/'
	return normalized.replace(/\/+$/, '')
}

function commonParentDirectory(paths: string[]): string {
	const normalizedPaths = paths.map(normalizeAbsolutePath).filter(Boolean)
	if (!normalizedPaths.length) return ''

	const firstPath = normalizedPaths[0]
	const isWindowsPath = /^[a-zA-Z]:\//.test(firstPath)
	const root = isWindowsPath ? firstPath.slice(0, 2) : ''
	const hasIncompatibleRoot = normalizedPaths.some((path) => {
		const pathIsWindows = /^[a-zA-Z]:\//.test(path)
		if (pathIsWindows !== isWindowsPath) return true
		return isWindowsPath && path.slice(0, 2).toLowerCase() !== root.toLowerCase()
	})
	if (hasIncompatibleRoot) return ''

	const compare = (value: string) => isWindowsPath ? value.toLowerCase() : value
	const pathSegmentsList = normalizedPaths.map((path) =>
		path.slice(root.length).split('/').filter(Boolean)
	)
	const commonSegments: string[] = []
	const shortestLength = Math.min(...pathSegmentsList.map((segments) => segments.length))

	for (let index = 0; index < shortestLength; index += 1) {
		const segment = pathSegmentsList[0][index]
		if (!pathSegmentsList.every((segments) => compare(segments[index]) === compare(segment))) break
		commonSegments.push(segment)
	}

	if (normalizedPaths.length === 1) commonSegments.pop()

	if (isWindowsPath) {
		return commonSegments.length ? `${root}/${commonSegments.join('/')}` : `${root}/`
	}
	return commonSegments.length ? `/${commonSegments.join('/')}` : '/'
}

function stripBrowseBase(parentPath: string): string {
	const normalizedParent = normalizeAbsolutePath(parentPath)
	const normalizedBase = normalizeAbsolutePath(browseBase.value)
	if (!normalizedParent) return ''
	if (!normalizedBase) return normalizeRelativePath(normalizedParent)

	const isWindowsPath = /^[a-zA-Z]:\//.test(normalizedParent)
	const comparableParent = isWindowsPath ? normalizedParent.toLowerCase() : normalizedParent
	const comparableBase = isWindowsPath ? normalizedBase.toLowerCase() : normalizedBase
	const basePrefix = comparableBase.endsWith('/') ? comparableBase : `${comparableBase}/`

	if (comparableParent === comparableBase) return ''
	if (comparableParent.startsWith(basePrefix)) {
		return normalizeRelativePath(normalizedParent.slice(basePrefix.length))
	}
	return normalizeRelativePath(normalizedParent)
}

function pickList<T>(payload: any): T[] {
	if (Array.isArray(payload)) return payload
	if (Array.isArray(payload?.list)) return payload.list
	if (Array.isArray(payload?.data)) return payload.data
	if (Array.isArray(payload?.data?.list)) return payload.data.list
	return []
}

async function loadMediaList(version = loadVersion) {
	const response = await mediaApi.get(1, 10000)
	if (version !== loadVersion) return
	mediaList.value = pickList<mediaType>(response)
}

async function loadMangas(version = loadVersion) {
	if (!mediaId.value) {
		allMangas.value = []
		browseBase.value = ''
		return
	}

	let roots: string[] = []
	try {
		const pathResponse = await pathApi.get(mediaId.value)
		roots = pickList<any>(pathResponse)
			.map((path) => String(path?.pathContent || ''))
			.filter(Boolean)
	} catch {
		roots = []
	}
	if (version !== loadVersion) return

	browseBase.value = commonParentDirectory(roots)
	const mangaResponse = await mangaApi.get(mediaId.value, 0, 0)
	if (version !== loadVersion) return

	allMangas.value = pickList<mangaType>(mangaResponse).map((manga) => ({
		...manga,
		parentPath: stripBrowseBase(manga.parentPath || ''),
	}))
}

async function reload() {
	const version = ++loadVersion
	loading.value = true
	errorMessage.value = ''
	try {
		if (!mediaList.value.length) await loadMediaList(version)
		await loadMangas(version)
	} catch {
		if (version === loadVersion) {
			errorMessage.value = '目录加载失败，请稍后重试'
			allMangas.value = []
		}
	} finally {
		if (version === loadVersion) loading.value = false
	}
}

function goRoot() {
	router.push({ name: 't-manga-browser' })
}

function goMediaRoot() {
	router.push({ name: 't-manga-browser', query: { mediaId: mediaId.value } })
}

function goSegment(index: number) {
	router.push({
		name: 't-manga-browser',
		query: {
			mediaId: mediaId.value,
			path: pathSegments.value.slice(0, index + 1).join('/'),
		},
	})
}

function enterMedia(media: mediaType) {
	router.push({ name: 't-manga-browser', query: { mediaId: media.mediaId } })
}

function enterFolder(name: string) {
	router.push({
		name: 't-manga-browser',
		query: {
			mediaId: mediaId.value,
			path: [...pathSegments.value, name].join('/'),
		},
	})
}

function goManga(manga: mangaType) {
	router.push(`/t/manga/${manga.mangaId}`)
}

watch(() => mediaId.value, reload)

onMounted(reload)
</script>

<style scoped>
.t-folder-browser {
	--browser-accent: #2563eb;
	--browser-text: #111827;
	--browser-muted: #6b7280;
	--browser-card: #fff;
	--browser-soft: #f3f4f6;
	--browser-border: #e5e7eb;
	--browser-shadow: 0 0.4rem 1.4rem rgba(15, 23, 42, 0.07);
	margin: 0 auto;
	min-width: 0;
	color: var(--browser-text);
}

.t-folder-browser.is-b {
	--browser-accent: #6c8dff;
	--browser-card: rgba(255, 255, 255, 0.72);
	--browser-soft: rgba(255, 255, 255, 0.48);
	--browser-border: rgba(255, 255, 255, 0.82);
	--browser-shadow: 0 0.6rem 1.8rem rgba(108, 141, 255, 0.12);
}

.t-folder-browser.is-d {
	--browser-accent: var(--accent);
	--browser-text: var(--fg);
	--browser-muted: var(--fg2);
	--browser-card: var(--bg2);
	--browser-soft: var(--sd-bg2);
	--browser-border: var(--border);
}

:global(.sa-dark) .t-folder-browser.is-a {
	--browser-accent: var(--sa-primary);
	--browser-text: var(--sa-text);
	--browser-muted: var(--sa-text-3);
	--browser-card: var(--sa-card);
	--browser-soft: var(--sa-bg-hover);
	--browser-border: var(--sa-border);
	--browser-shadow: 0 0.4rem 1.4rem rgba(0, 0, 0, 0.2);
}

:global(.tb-dark) .t-folder-browser.is-b {
	--browser-accent: var(--sb-accent-2);
	--browser-text: var(--sb-text);
	--browser-muted: var(--sb-text-3);
	--browser-card: var(--sb-card);
	--browser-soft: var(--sb-bg-hover);
	--browser-border: var(--sb-border);
	--browser-shadow: 0 0.4rem 1.4rem rgba(0, 0, 0, 0.22);
}

.t-folder-browser__breadcrumb {
	position: sticky;
	top: 0;
	z-index: 5;
	display: flex;
	align-items: center;
	gap: 0.7rem;
	min-width: 0;
	margin-bottom: 2rem;
	padding: 1rem 1.2rem;
	overflow-x: auto;
	color: var(--browser-muted);
	background: color-mix(in srgb, var(--browser-card) 92%, transparent);
	border: 1px solid var(--browser-border);
	border-radius: 1rem;
	box-shadow: var(--browser-shadow);
	backdrop-filter: blur(1.2rem);
	scrollbar-width: none;
}

.t-folder-browser__breadcrumb::-webkit-scrollbar {
	display: none;
}

.t-folder-browser__breadcrumb button {
	flex: none;
	max-width: 24rem;
	padding: 0;
	overflow: hidden;
	color: var(--browser-text);
	font: inherit;
	text-overflow: ellipsis;
	white-space: nowrap;
	background: none;
	border: 0;
	cursor: pointer;
}

.t-folder-browser__breadcrumb button:hover {
	color: var(--browser-accent);
}

.t-folder-browser__section + .t-folder-browser__section {
	margin-top: 2.8rem;
}

.t-folder-browser__heading {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	margin-bottom: 1.4rem;
}

.t-folder-browser__heading h1 {
	margin: 0;
	font-size: 2rem;
	font-weight: 700;
	color: var(--browser-text);
}

.t-folder-browser__heading > span {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 2.4rem;
	height: 2.4rem;
	padding: 0 0.7rem;
	color: var(--browser-accent);
	font-size: 1.2rem;
	font-weight: 600;
	background: color-mix(in srgb, var(--browser-accent) 10%, transparent);
	border-radius: 999px;
}

.t-folder-browser__media-grid,
.t-folder-browser__folder-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(24rem, 1fr));
	gap: 1.2rem;
}

.t-folder-browser__media,
.t-folder-browser__folder {
	display: flex;
	align-items: center;
	min-width: 0;
	padding: 1rem;
	color: var(--browser-text);
	text-align: left;
	background: var(--browser-card);
	border: 1px solid var(--browser-border);
	border-radius: 1.2rem;
	box-shadow: var(--browser-shadow);
	cursor: pointer;
	transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
}

.t-folder-browser__media:hover,
.t-folder-browser__folder:hover {
	border-color: color-mix(in srgb, var(--browser-accent) 48%, var(--browser-border));
	box-shadow: 0 0.8rem 2.2rem color-mix(in srgb, var(--browser-accent) 12%, transparent);
	transform: translateY(-0.2rem);
}

.t-folder-browser__media-cover {
	flex: none;
	width: 7.2rem;
	height: 5.4rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 0.8rem;
	font-size: 2.4rem;
}

.t-folder-browser__media-info {
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 0.4rem;
	min-width: 0;
	margin-left: 1.2rem;
}

.t-folder-browser__media-info strong,
.t-folder-browser__media-info small {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.t-folder-browser__media-info strong {
	font-size: 1.4rem;
}

.t-folder-browser__media-info small {
	color: var(--browser-muted);
	font-size: 1.2rem;
}

.t-folder-browser__folder {
	min-height: 6rem;
}

.t-folder-browser__folder-icon {
	flex: none;
	margin-right: 1rem;
	font-size: 2.2rem;
}

.t-folder-browser__folder-name {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	font-size: 1.4rem;
	font-weight: 600;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.t-folder-browser__folder-count {
	flex: none;
	margin-left: 0.8rem;
	padding: 0.2rem 0.7rem;
	color: var(--browser-muted);
	font-size: 1.1rem;
	background: var(--browser-soft);
	border-radius: 999px;
}

.t-folder-browser__chevron {
	flex: none;
	margin-left: 0.8rem;
	color: var(--browser-muted);
	font-size: 2rem;
}

.t-folder-browser__manga-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
	column-gap: 1.8rem;
	row-gap: 0.8rem;
	min-width: 0;
}

.is-b .t-folder-browser__manga-grid,
.is-d .t-folder-browser__manga-grid {
	grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
	column-gap: 1.6rem;
	row-gap: 1.2rem;
}

.t-folder-browser__loading {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
	gap: 1.6rem;
}

.t-folder-browser__skeleton {
	aspect-ratio: 3 / 4;
	border-radius: 1.4rem;
	background: linear-gradient(
		100deg,
		var(--browser-soft) 30%,
		color-mix(in srgb, var(--browser-soft) 55%, #fff) 50%,
		var(--browser-soft) 70%
	);
	background-size: 300% 100%;
	animation: folder-browser-loading 1.3s infinite;
}

.t-folder-browser__empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 1.2rem;
	min-height: 20rem;
	padding: 4rem 2rem;
	color: var(--browser-muted);
	font-size: 1.4rem;
	text-align: center;
}

.t-folder-browser__empty button {
	padding: 0.7rem 1.4rem;
	color: #fff;
	font: inherit;
	background: var(--browser-accent);
	border: 0;
	border-radius: 0.8rem;
	cursor: pointer;
}

@keyframes folder-browser-loading {
	from {
		background-position: 100% 0;
	}
	to {
		background-position: 0 0;
	}
}

@media (max-width: 76.8rem) {
	.t-folder-browser__breadcrumb {
		margin-bottom: 1.6rem;
	}

	.t-folder-browser__media-grid,
	.t-folder-browser__folder-grid {
		grid-template-columns: 1fr;
	}

	.t-folder-browser__manga-grid,
	.is-b .t-folder-browser__manga-grid,
	.is-d .t-folder-browser__manga-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
		column-gap: 1.2rem;
		row-gap: 1rem;
	}
}

@media (max-width: 48rem) {
	.t-folder-browser__heading h1 {
		font-size: 1.7rem;
	}

	.t-folder-browser__manga-grid,
	.is-b .t-folder-browser__manga-grid,
	.is-d .t-folder-browser__manga-grid {
		column-gap: 0.8rem;
		row-gap: 0.8rem;
	}
}
</style>
