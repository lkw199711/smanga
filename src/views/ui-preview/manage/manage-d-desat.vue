<template>
	<div class="manage-d" :style="themeVars">
		<header class="md-header">
			<h1 class="md-title">漫画管理</h1>
			<div class="md-theme-dots">
				<button v-for="t in themeList" :key="t.key"
					:class="['md-dot', { active: currentTheme === t.key }]"
					:style="{ background: t.primary }" @click="currentTheme = t.key"></button>
			</div>
		</header>

		<!-- 工具栏 -->
		<div class="md-toolbar">
			<div class="md-search">
				<span>🔍</span>
				<input placeholder="搜索漫画名称…" v-model="keyword" />
			</div>
			<div class="md-actions">
				<button class="md-btn">刷新</button>
				<button class="md-btn danger">批量删除</button>
			</div>
		</div>

		<!-- 表格 -->
		<div class="md-table-wrap">
			<table class="md-table">
				<thead>
					<tr>
						<th class="md-th-check"><input type="checkbox" /></th>
						<th>#</th>
						<th>媒体库ID</th>
						<th>漫画ID</th>
						<th>漫画名称</th>
						<th>创建时间</th>
						<th>更新时间</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(row, i) in filteredData" :key="row.mangaId">
						<td><input type="checkbox" /></td>
						<td>{{ i + 1 }}</td>
						<td>{{ row.mediaId }}</td>
						<td>{{ row.mangaId }}</td>
						<td class="md-name">{{ row.mangaName }}</td>
						<td>{{ row.createTime }}</td>
						<td>{{ row.updateTime }}</td>
						<td class="md-td-actions">
							<button class="md-btn-sm">编辑</button>
							<button class="md-btn-sm danger">删除</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- 分页 -->
		<div class="md-pager">
			<span class="md-pager-info">共 {{ manageMock.totalCount }} 条</span>
			<div class="md-pager-btns">
				<button class="md-page-btn active">1</button>
				<button class="md-page-btn">2</button>
				<button class="md-page-btn">3</button>
				<span class="md-page-ellipsis">…</span>
				<button class="md-page-btn">128</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { manageMock } from '../mock';

const themeList = [
	{ key: 'blue', primary: '#2563EB', back: '#EFF6FF', hover: '#DBEAFE' },
	{ key: 'pink', primary: '#DB2777', back: '#FDF2F8', hover: '#FCE7F3' },
	{ key: 'green', primary: '#059669', back: '#ECFDF5', hover: '#D1FAE5' },
	{ key: 'purple', primary: '#7C3AED', back: '#F5F3FF', hover: '#EDE9FE' },
	{ key: 'dark', primary: '#F5A524', back: '#0D0F12', hover: '#161A20' },
];

const currentTheme = ref('blue');
const theme = computed(() => themeList.find(t => t.key === currentTheme.value)!);
const isDark = computed(() => currentTheme.value === 'dark');

const themeVars = computed(() => {
	const t = theme.value;
	return {
		'--md-primary': t.primary,
		'--md-back': t.back,
		'--md-card': isDark.value ? '#161A20' : '#FFFFFF',
		'--md-border': isDark.value ? '#2A313C' : '#E5E7EB',
		'--md-text': isDark.value ? '#E6E8EB' : '#0F172A',
		'--md-text-muted': isDark.value ? '#9AA3AE' : '#64748B',
		'--md-hover': t.hover,
	} as any;
});

const keyword = ref('');
const filteredData = computed(() => {
	if (!keyword.value) return manageMock.tableData;
	return manageMock.tableData.filter(r => r.mangaName.includes(keyword.value));
});
</script>

<style scoped>
.manage-d {
	min-height: calc(100vh - 65px);
	background: var(--md-back);
	color: var(--md-text);
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
	padding: 28px;
}

.md-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
}

.md-title {
	font-size: 18px;
	font-weight: 600;
	margin: 0;
}

.md-theme-dots {
	display: flex;
	gap: 5px;
}

.md-dot {
	width: 18px;
	height: 18px;
	border: 2px solid var(--md-card);
	outline: 1px solid var(--md-border);
	border-radius: 50%;
	cursor: pointer;
}

.md-dot.active {
	outline: 2px solid var(--md-primary);
	transform: scale(1.15);
}

.md-toolbar {
	display: flex;
	align-items: center;
	gap: 14px;
	margin-bottom: 18px;
}

.md-search {
	flex: 1;
	max-width: 400px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 14px;
	background: var(--md-card);
	border: 1px solid var(--md-border);
	border-radius: 10px;
}

.md-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 13px;
	color: var(--md-text);
}

.md-search input::placeholder { color: var(--md-text-muted); }

.md-actions { display: flex; gap: 8px; }

.md-btn {
	padding: 7px 14px;
	font-size: 13px;
	color: var(--md-text-muted);
	background: transparent;
	border: 1px solid var(--md-border);
	border-radius: 8px;
	cursor: pointer;
}

.md-btn:hover { background: var(--md-hover); color: var(--md-text); }
.md-btn.danger { color: #dc2626; }

.md-table-wrap {
	background: var(--md-card);
	border: 1px solid var(--md-border);
	border-radius: 12px;
	overflow: hidden;
}

.md-table {
	width: 100%;
	border-collapse: collapse;
}

.md-table th {
	padding: 12px 16px;
	font-size: 12px;
	font-weight: 600;
	color: var(--md-text-muted);
	text-align: left;
	border-bottom: 1px solid var(--md-border);
}

.md-table td {
	padding: 12px 16px;
	font-size: 13px;
	color: var(--md-text-muted);
	border-bottom: 1px solid var(--md-border);
}

.md-table tr:last-child td { border-bottom: none; }
.md-table tr:hover td { background: var(--md-hover); }
.md-th-check { width: 40px; }
.md-name { font-weight: 500; color: var(--md-text); }

.md-td-actions { display: flex; gap: 6px; }

.md-btn-sm {
	padding: 4px 10px;
	font-size: 12px;
	color: var(--md-primary);
	background: color-mix(in srgb, var(--md-primary) 10%, transparent);
	border: none;
	border-radius: 6px;
	cursor: pointer;
}

.md-btn-sm:hover { filter: brightness(1.1); }
.md-btn-sm.danger { color: #dc2626; background: #fef2f2; }

.md-pager {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 16px;
}

.md-pager-info { font-size: 13px; color: var(--md-text-muted); }

.md-pager-btns { display: flex; align-items: center; gap: 4px; }
.md-page-ellipsis { color: var(--md-text-muted); }

.md-page-btn {
	min-width: 32px;
	height: 32px;
	padding: 0 8px;
	font-size: 13px;
	color: var(--md-text-muted);
	background: var(--md-card);
	border: 1px solid var(--md-border);
	border-radius: 8px;
	cursor: pointer;
}

.md-page-btn:hover { border-color: var(--md-primary); color: var(--md-primary); }
.md-page-btn.active { background: var(--md-primary); color: #fff; border-color: var(--md-primary); }
</style>
