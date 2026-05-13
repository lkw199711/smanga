<template>
	<div class="admin-g">
		<!-- 顶部导航栏 -->
		<header class="ag-topbar">
			<div class="ag-topbar-left">
				<div class="ag-logo">📚 Smanga</div>
				<nav class="ag-nav">
					<a href="#" class="ag-nav-item active">管理面板</a>
					<a href="#" class="ag-nav-item">用户管理</a>
					<a href="#" class="ag-nav-item">漫画管理</a>
					<a href="#" class="ag-nav-item">系统设置</a>
				</nav>
			</div>
			<div class="ag-topbar-right">
				<button class="ag-btn-icon">🔔</button>
				<button class="ag-btn-icon">⚙️</button>
				<div class="ag-user">
					<div class="ag-user-avatar">👤</div>
					<div class="ag-user-name">管理员</div>
				</div>
			</div>
		</header>

		<div class="ag-main">
			<!-- 侧边栏 -->
			<aside class="ag-sidebar">
				<div class="ag-sidebar-section">
					<h3 class="ag-sidebar-title">快速访问</h3>
					<div class="ag-sidebar-items">
						<div class="ag-sidebar-item active">
							<span class="ag-sidebar-icon">📊</span>
							<span class="ag-sidebar-text">仪表盘</span>
						</div>
						<div class="ag-sidebar-item">
							<span class="ag-sidebar-icon">👥</span>
							<span class="ag-sidebar-text">用户管理</span>
						</div>
						<div class="ag-sidebar-item">
							<span class="ag-sidebar-icon">📚</span>
							<span class="ag-sidebar-text">漫画管理</span>
						</div>
						<div class="ag-sidebar-item">
							<span class="ag-sidebar-icon">⚙️</span>
							<span class="ag-sidebar-text">系统设置</span>
						</div>
					</div>
				</div>

				<div class="ag-sidebar-section">
					<h3 class="ag-sidebar-title">系统统计</h3>
					<div class="ag-stats">
						<div class="ag-stat-item">
							<div class="ag-stat-value">1,234</div>
							<div class="ag-stat-label">总用户数</div>
						</div>
						<div class="ag-stat-item">
							<div class="ag-stat-value">5,678</div>
							<div class="ag-stat-label">总漫画数</div>
						</div>
						<div class="ag-stat-item">
							<div class="ag-stat-value">9,012</div>
							<div class="ag-stat-label">总章节数</div>
						</div>
					</div>
				</div>
			</aside>

			<!-- 主内容区 -->
			<main class="ag-content">
				<div class="ag-header">
					<h1 class="ag-title">管理面板</h1>
					<div class="ag-actions">
						<button class="ag-btn-primary">添加用户</button>
						<button class="ag-btn-secondary">导出数据</button>
					</div>
				</div>

				<!-- 统计卡片 -->
				<div class="ag-stats-grid">
					<div class="ag-stat-card">
						<div class="ag-stat-card-icon">👥</div>
						<div class="ag-stat-card-content">
							<div class="ag-stat-card-value">1,234</div>
							<div class="ag-stat-card-label">活跃用户</div>
						</div>
						<div class="ag-stat-card-trend">↑ 12%</div>
					</div>
					<div class="ag-stat-card">
						<div class="ag-stat-card-icon">📚</div>
						<div class="ag-stat-card-content">
							<div class="ag-stat-card-value">5,678</div>
							<div class="ag-stat-card-label">活跃漫画</div>
						</div>
						<div class="ag-stat-card-trend">↑ 8%</div>
					</div>
					<div class="ag-stat-card">
						<div class="ag-stat-card-icon">📊</div>
						<div class="ag-stat-card-content">
							<div class="ag-stat-card-value">9,012</div>
							<div class="ag-stat-card-label">今日阅读</div>
						</div>
						<div class="ag-stat-card-trend">↑ 15%</div>
					</div>
					<div class="ag-stat-card">
						<div class="ag-stat-card-icon">⚠️</div>
						<div class="ag-stat-card-content">
							<div class="ag-stat-card-value">3</div>
							<div class="ag-stat-card-label">待处理问题</div>
						</div>
						<div class="ag-stat-card-trend">↓ 50%</div>
					</div>
				</div>

				<!-- 用户管理表格 -->
				<div class="ag-table-container">
					<div class="ag-table-header">
						<h2 class="ag-table-title">用户管理</h2>
						<div class="ag-table-actions">
							<input type="text" class="ag-search-input" placeholder="搜索用户...">
							<select class="ag-filter-select">
								<option>所有用户</option>
								<option>活跃用户</option>
								<option>新用户</option>
							</select>
						</div>
					</div>
					<table class="ag-table">
						<thead>
							<tr>
								<th>用户</th>
								<th>邮箱</th>
								<th>角色</th>
								<th>状态</th>
								<th>注册时间</th>
								<th>操作</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="user in users" :key="user.id">
								<td>
									<div class="ag-user-cell">
										<div class="ag-user-avatar">👤</div>
										<div class="ag-user-info">
											<div class="ag-user-name">{{ user.name }}</div>
											<div class="ag-user-id">ID: {{ user.id }}</div>
										</div>
									</div>
								</td>
								<td>{{ user.email }}</td>
								<td>
									<span :class="['ag-role', `ag-role-${user.role}`]">{{ user.role }}</span>
								</td>
								<td>
									<span :class="['ag-status', `ag-status-${user.status}`]">{{ user.status }}</span>
								</td>
								<td>{{ user.registerTime }}</td>
								<td>
									<div class="ag-actions-cell">
										<button class="ag-btn-action">编辑</button>
										<button class="ag-btn-action">禁用</button>
										<button class="ag-btn-action">删除</button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
					<div class="ag-pagination">
						<button class="ag-btn-page">上一页</button>
						<span class="ag-page-info">第 1 页，共 10 页</span>
						<button class="ag-btn-page">下一页</button>
					</div>
				</div>
			</main>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { adminMock } from '../mock';

const { users } = adminMock;
</script>

<style scoped>
.admin-g {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: #0a0a0a;
	font-family: 'Courier New', monospace;
	color: #00ff41;
}

/* 顶部导航栏 */
.ag-topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 24px;
	background: #0a0a0a;
	border-bottom: 1px solid #00ff41;
	box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
}

.ag-topbar-left {
	display: flex;
	align-items: center;
	gap: 32px;
}

.ag-logo {
	font-size: 20px;
	font-weight: bold;
	color: #00ff41;
	text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.ag-nav {
	display: flex;
	gap: 24px;
}

.ag-nav-item {
	font-size: 14px;
	font-weight: bold;
	color: #00ff41;
	text-decoration: none;
	padding: 8px 12px;
	border-radius: 2px;
	border: 1px solid #00ff41;
	transition: all 0.2s ease;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.ag-nav-item:hover {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

.ag-nav-item.active {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

.ag-topbar-right {
	display: flex;
	align-items: center;
	gap: 12px;
}

.ag-btn-icon {
	width: 40px;
	height: 40px;
	border: 1px solid #00ff41;
	border-radius: 2px;
	background: #0a0a0a;
	color: #00ff41;
	font-size: 16px;
	font-weight: bold;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.ag-btn-icon:hover {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

.ag-user {
	display: flex;
	align-items: center;
	gap: 8px;
}

.ag-user-avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: #0a0a0a;
	border: 1px solid #00ff41;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #00ff41;
	font-size: 14px;
	font-weight: bold;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.ag-user-name {
	font-size: 14px;
	font-weight: bold;
	color: #00ff41;
	text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

/* 主内容区 */
.ag-main {
	display: flex;
	flex: 1;
	overflow: hidden;
}

/* 侧边栏 */
.ag-sidebar {
	width: 280px;
	background: #0a0a0a;
	border-right: 1px solid #00ff41;
	padding: 24px 16px;
	box-shadow: 5px 0 20px rgba(0, 255, 65, 0.3);
	overflow-y: auto;
}

.ag-sidebar-section {
	margin-bottom: 32px;
}

.ag-sidebar-title {
	font-size: 14px;
	font-weight: bold;
	color: #00ff41;
	margin-bottom: 16px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.ag-sidebar-items {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.ag-sidebar-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 16px;
	border-radius: 2px;
	background: #0a0a0a;
	border: 1px solid #00ff41;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.2);
}

.ag-sidebar-item:hover {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

.ag-sidebar-item.active {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

.ag-sidebar-icon {
	font-size: 16px;
	color: #00ff41;
	font-weight: bold;
}

.ag-sidebar-text {
	font-size: 14px;
	color: #00ff41;
	font-weight: bold;
}

.ag-stats {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.ag-stat-item {
	padding: 16px;
	border-radius: 2px;
	background: #0a0a0a;
	border: 1px solid #00ff41;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.2);
}

.ag-stat-value {
	font-size: 18px;
	font-weight: bold;
	color: #00ff41;
	margin-bottom: 4px;
	text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.ag-stat-label {
	font-size: 12px;
	color: #ff00ff;
}

/* 主内容区 */
.ag-content {
	flex: 1;
	overflow: auto;
	padding: 24px;
	background: #0a0a0a;
}

.ag-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24px;
}

.ag-title {
	font-size: 24px;
	font-weight: bold;
	color: #00ff41;
	text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.ag-actions {
	display: flex;
	gap: 12px;
}

.ag-btn-primary {
	padding: 10px 20px;
	border: 1px solid #00ff41;
	border-radius: 2px;
	background: #0a0a0a;
	color: #00ff41;
	font-size: 14px;
	font-weight: bold;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.ag-btn-primary:hover {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

.ag-btn-secondary {
	padding: 10px 20px;
	border: 1px solid #00ff41;
	border-radius: 2px;
	background: #0a0a0a;
	color: #00ff41;
	font-size: 14px;
	font-weight: bold;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.ag-btn-secondary:hover {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

/* 统计卡片 */
.ag-stats-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	gap: 24px;
	margin-bottom: 32px;
}

.ag-stat-card {
	padding: 24px;
	border-radius: 2px;
	background: #0a0a0a;
	border: 1px solid #00ff41;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.3);
	display: flex;
	align-items: center;
	gap: 16px;
}

.ag-stat-card-icon {
	width: 48px;
	height: 48px;
	border-radius: 2px;
	background: #0a0a0a;
	border: 1px solid #00ff41;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.ag-stat-card-content {
	flex: 1;
}

.ag-stat-card-value {
	font-size: 24px;
	font-weight: bold;
	color: #00ff41;
	margin-bottom: 4px;
	text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.ag-stat-card-label {
	font-size: 14px;
	color: #ff00ff;
}

.ag-stat-card-trend {
	font-size: 14px;
	font-weight: bold;
	color: #00ff41;
	text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

/* 表格容器 */
.ag-table-container {
	background: #0a0a0a;
	border-radius: 2px;
	border: 1px solid #00ff41;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.3);
	overflow: hidden;
}

.ag-table-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24px;
	border-bottom: 1px solid #00ff41;
}

.ag-table-title {
	font-size: 18px;
	font-weight: bold;
	color: #00ff41;
	text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.ag-table-actions {
	display: flex;
	gap: 12px;
}

.ag-search-input {
	padding: 8px 16px;
	border: 1px solid #00ff41;
	border-radius: 2px;
	background: #0a0a0a;
	color: #00ff41;
	font-size: 14px;
	font-weight: bold;
	outline: none;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.ag-filter-select {
	padding: 8px 16px;
	border: 1px solid #00ff41;
	border-radius: 2px;
	background: #0a0a0a;
	color: #00ff41;
	font-size: 14px;
	font-weight: bold;
	outline: none;
	cursor: pointer;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.ag-table {
	width: 100%;
	border-collapse: collapse;
}

.ag-table th {
	padding: 16px;
	text-align: left;
	font-size: 14px;
	font-weight: bold;
	color: #00ff41;
	border-bottom: 1px solid #00ff41;
	text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.ag-table td {
	padding: 16px;
	font-size: 14px;
	color: #00ff41;
	font-weight: bold;
	border-bottom: 1px solid #1a1a1a;
}

.ag-user-cell {
	display: flex;
	align-items: center;
	gap: 12px;
}

.ag-user-avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: #0a0a0a;
	border: 1px solid #00ff41;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #00ff41;
	font-size: 14px;
	font-weight: bold;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.ag-user-info {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.ag-user-name {
	font-size: 14px;
	font-weight: bold;
	color: #00ff41;
	text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.ag-user-id {
	font-size: 12px;
	color: #ff00ff;
}

.ag-role {
	padding: 4px 8px;
	border-radius: 2px;
	font-size: 12px;
	font-weight: bold;
}

.ag-role-admin {
	background: #0a0a0a;
	color: #00ff41;
	border: 1px solid #00ff41;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.ag-role-user {
	background: #0a0a0a;
	color: #00ff41;
	border: 1px solid #00ff41;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.ag-status {
	padding: 4px 8px;
	border-radius: 2px;
	font-size: 12px;
	font-weight: bold;
}

.ag-status-active {
	background: #0a0a0a;
	color: #00ff41;
	border: 1px solid #00ff41;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.ag-status-inactive {
	background: #0a0a0a;
	color: #ff00ff;
	border: 1px solid #ff00ff;
	box-shadow: 0 0 10px rgba(255, 0, 255, 0.3);
}

.ag-actions-cell {
	display: flex;
	gap: 8px;
}

.ag-btn-action {
	padding: 6px 12px;
	border: 1px solid #00ff41;
	border-radius: 2px;
	background: #0a0a0a;
	color: #00ff41;
	font-size: 12px;
	font-weight: bold;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.ag-btn-action:hover {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

.ag-pagination {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16px;
	padding: 24px;
}

.ag-btn-page {
	padding: 8px 16px;
	border: 1px solid #00ff41;
	border-radius: 2px;
	background: #0a0a0a;
	color: #00ff41;
	font-size: 14px;
	font-weight: bold;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.ag-btn-page:hover {
	background: #00ff41;
	color: #0a0a0a;
	box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
}

.ag-page-info {
	font-size: 14px;
	color: #00ff41;
	font-weight: bold;
	text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}
</style>