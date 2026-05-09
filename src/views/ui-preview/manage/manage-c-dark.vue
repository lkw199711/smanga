<template>
	<div class="manage-c">
		<header class="mc-header">
			<div class="mc-breadcrumb">
				<span class="mc-crumb-muted">Management</span>
				<span class="mc-crumb-sep">/</span>
				<span>Manga</span>
			</div>
			<div class="mc-header-right">
				<span class="mc-count">{{ manageMock.totalCount }} items</span>
			</div>
		</header>

		<!-- 工具栏 -->
		<div class="mc-toolbar">
			<div class="mc-search">
				<span>🔍</span>
				<input placeholder="Quick find…" v-model="keyword" />
			</div>
			<div class="mc-actions">
				<button class="mc-btn">Refresh</button>
				<button class="mc-btn danger">Delete Selected</button>
			</div>
		</div>

		<!-- 表格 -->
		<div class="mc-table-wrap">
			<table class="mc-table">
				<thead>
					<tr>
						<th class="mc-th-check"><input type="checkbox" /></th>
						<th>#</th>
						<th>Media</th>
						<th>ID</th>
						<th>Name</th>
						<th>Created</th>
						<th>Updated</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(row, i) in filteredData" :key="row.mangaId">
						<td><input type="checkbox" /></td>
						<td class="mc-td-index">{{ i + 1 }}</td>
						<td>{{ row.mediaId }}</td>
						<td>{{ row.mangaId }}</td>
						<td class="mc-name">{{ row.mangaName }}</td>
						<td class="mc-time">{{ row.createTime }}</td>
						<td class="mc-time">{{ row.updateTime }}</td>
						<td class="mc-td-actions">
							<button class="mc-btn-sm">Edit</button>
							<button class="mc-btn-sm danger">Del</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- 分页 -->
		<div class="mc-pager">
			<span class="mc-pager-info">Page 1 of 128</span>
			<div class="mc-pager-btns">
				<button class="mc-page-btn">←</button>
				<button class="mc-page-btn active">1</button>
				<button class="mc-page-btn">2</button>
				<button class="mc-page-btn">3</button>
				<button class="mc-page-btn">→</button>
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
.manage-c {
	min-height: calc(100vh - 65px);
	background: #0d0f12;
	color: #e6e8eb;
	font-size: 13px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
	padding: 24px;
}

.mc-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
}

.mc-breadcrumb {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
}

.mc-crumb-muted { color: #5c6470; }
.mc-crumb-sep { color: #2a313c; }
.mc-count { font-size: 12px; color: #5c6470; }

.mc-toolbar {
	display: flex;
	align-items: center;
	gap: 14px;
	margin-bottom: 16px;
}

.mc-search {
	flex: 1;
	max-width: 360px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	background: #1e232b;
	border: 1px solid #2a313c;
	border-radius: 8px;
	color: #5c6470;
}

.mc-search input {
	flex: 1;
	border: none;
	outline: none;
	background: transparent;
	font-size: 12px;
	color: #e6e8eb;
}

.mc-search input::placeholder { color: #5c6470; }

.mc-actions {
	display: flex;
	gap: 6px;
}

.mc-btn {
	padding: 7px 14px;
	font-size: 12px;
	color: #9aa3ae;
	background: transparent;
	border: 1px solid #2a313c;
	border-radius: 6px;
	cursor: pointer;
}

.mc-btn:hover { background: #1e232b; color: #e6e8eb; }
.mc-btn.danger { color: #f87171; border-color: #7f1d1d; }
.mc-btn.danger:hover { background: #1a1012; }

.mc-table-wrap {
	background: #161a20;
	border: 1px solid #2a313c;
	border-radius: 10px;
	overflow: hidden;
}

.mc-table {
	width: 100%;
	border-collapse: collapse;
}

.mc-table th {
	padding: 10px 14px;
	font-size: 10px;
	font-weight: 700;
	color: #5c6470;
	text-align: left;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	border-bottom: 1px solid #2a313c;
}

.mc-table td {
	padding: 10px 14px;
	font-size: 12px;
	color: #9aa3ae;
	border-bottom: 1px solid #1e232b;
}

.mc-table tr:last-child td { border-bottom: none; }
.mc-table tr:hover td { background: #1a1f27; }
.mc-th-check { width: 36px; }
.mc-td-index { color: #5c6470; }
.mc-name { font-weight: 500; color: #e6e8eb; }
.mc-time { font-family: 'SF Mono', Consolas, monospace; font-size: 11px; color: #5c6470; }

.mc-td-actions {
	display: flex;
	gap: 4px;
}

.mc-btn-sm {
	padding: 4px 10px;
	font-size: 11px;
	font-weight: 600;
	color: #f5a524;
	background: transparent;
	border: 1px solid #2a313c;
	border-radius: 4px;
	cursor: pointer;
}

.mc-btn-sm:hover { background: #1e232b; }
.mc-btn-sm.danger { color: #f87171; border-color: #7f1d1d; }

.mc-pager {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 14px;
}

.mc-pager-info { font-size: 12px; color: #5c6470; }

.mc-pager-btns {
	display: flex;
	gap: 4px;
}

.mc-page-btn {
	min-width: 28px;
	height: 28px;
	padding: 0 6px;
	font-size: 12px;
	color: #9aa3ae;
	background: transparent;
	border: 1px solid #2a313c;
	border-radius: 4px;
	cursor: pointer;
}

.mc-page-btn:hover { background: #1e232b; color: #e6e8eb; }
.mc-page-btn.active { background: #f5a524; color: #0d0f12; border-color: #f5a524; }
</style>
