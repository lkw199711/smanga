<template>
	<div class="manage-a">
		<header class="ma-header">
			<h1 class="ma-title">漫画管理</h1>
		</header>

		<!-- 工具栏 -->
		<div class="ma-toolbar">
			<div class="ma-search">
				<span class="ma-search-icon">🔍</span>
				<input placeholder="搜索漫画名称…" v-model="keyword" />
			</div>
			<div class="ma-actions">
				<button class="ma-btn">🔄 刷新</button>
				<button class="ma-btn danger">🗑 批量删除</button>
			</div>
		</div>

		<!-- 表格 -->
		<div class="ma-table-wrap">
			<table class="ma-table">
				<thead>
					<tr>
						<th class="ma-th-check"><input type="checkbox" /></th>
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
						<td class="ma-name">{{ row.mangaName }}</td>
						<td>{{ row.createTime }}</td>
						<td>{{ row.updateTime }}</td>
						<td class="ma-td-actions">
							<button class="ma-btn-sm">编辑</button>
							<button class="ma-btn-sm danger">删除</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- 分页 -->
		<div class="ma-pager">
			<span class="ma-pager-info">共 {{ manageMock.totalCount }} 条</span>
			<div class="ma-pager-btns">
				<button class="ma-page-btn active">1</button>
				<button class="ma-page-btn">2</button>
				<button class="ma-page-btn">3</button>
				<span>…</span>
				<button class="ma-page-btn">128</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { manageMock } from '../mock';

const keyword = ref('');
const filteredData = computed(() => {
	if (!keyword.value) return manageMock.tableData;
	return manageMock.tableData.filter(r => r.mangaName.includes(keyword.value));
});
</script>

<style scoped>
.manage-a {
	min-height: calc(100vh - 65px);
	background: #fafafa;
	color: #171717;
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
	padding: 28px;
}

.ma-header {
	margin-bottom: 20px;
}

.ma-title {
	font-size: 18px;
	font-weight: 600;
	color: #111827;
	margin: 0;
}

.ma-toolbar {
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 20px;
}

.ma-search {
	flex: 1;
	max-width: 400px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 14px;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 10px;
}

.ma-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 13px;
	color: #171717;
}

.ma-search input::placeholder { color: #9ca3af; }
.ma-search-icon { color: #9ca3af; font-size: 13px; }

.ma-actions {
	display: flex;
	gap: 8px;
}

.ma-btn {
	padding: 8px 14px;
	font-size: 13px;
	font-weight: 500;
	color: #4b5563;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 8px;
	cursor: pointer;
}

.ma-btn:hover { background: #f3f4f6; border-color: #d1d5db; }
.ma-btn.danger { color: #dc2626; border-color: #fecaca; }
.ma-btn.danger:hover { background: #fef2f2; }

.ma-table-wrap {
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 12px;
	overflow: hidden;
}

.ma-table {
	width: 100%;
	border-collapse: collapse;
}

.ma-table th {
	padding: 12px 16px;
	font-size: 12px;
	font-weight: 600;
	color: #6b7280;
	text-align: left;
	background: #f9fafb;
	border-bottom: 1px solid #eaeaea;
}

.ma-table td {
	padding: 12px 16px;
	font-size: 13px;
	color: #374151;
	border-bottom: 1px solid #f3f4f6;
}

.ma-table tr:last-child td { border-bottom: none; }
.ma-table tr:hover td { background: #f9fafb; }

.ma-th-check { width: 40px; }
.ma-name { font-weight: 500; color: #111827; }

.ma-td-actions {
	display: flex;
	gap: 6px;
}

.ma-btn-sm {
	padding: 4px 10px;
	font-size: 12px;
	color: #2563eb;
	background: #eff6ff;
	border: none;
	border-radius: 6px;
	cursor: pointer;
}

.ma-btn-sm:hover { background: #dbeafe; }
.ma-btn-sm.danger { color: #dc2626; background: #fef2f2; }
.ma-btn-sm.danger:hover { background: #fee2e2; }

.ma-pager {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 16px;
	padding: 0 4px;
}

.ma-pager-info { font-size: 13px; color: #6b7280; }

.ma-pager-btns {
	display: flex;
	align-items: center;
	gap: 4px;
}

.ma-page-btn {
	min-width: 32px;
	height: 32px;
	padding: 0 8px;
	font-size: 13px;
	color: #4b5563;
	background: #fff;
	border: 1px solid #eaeaea;
	border-radius: 6px;
	cursor: pointer;
}

.ma-page-btn:hover { border-color: #2563eb; color: #2563eb; }
.ma-page-btn.active { background: #2563eb; color: #fff; border-color: #2563eb; }
</style>
