<template>
	<div class="admin-f">
		<!-- 顶部导航栏 -->
		<header class="af-topbar">
			<div class="af-topbar-left">
				<div class="af-logo">📚 Smanga</div>
				<nav class="af-nav">
					<a href="#" class="af-nav-item active">管理面板</a>
					<a href="#" class="af-nav-item">用户管理</a>
					<a href="#" class="af-nav-item">漫画管理</a>
					<a href="#" class="af-nav-item">系统设置</a>
				</nav>
			</div>
			<div class="af-topbar-right">
				<button class="af-btn-icon">🔔</button>
				<button class="af-btn-icon">⚙️</button>
				<div class="af-user">
					<div class="af-user-avatar">👤</div>
					<div class="af-user-name">管理员</div>
				</div>
			</div>
		</header>

		<div class="af-main">
			<!-- 侧边栏 -->
			<aside class="af-sidebar">
				<div class="af-sidebar-section">
					<h3 class="af-sidebar-title">快速访问</h3>
					<div class="af-sidebar-items">
						<div class="af-sidebar-item active">
							<span class="af-sidebar-icon">📊</span>
							<span class="af-sidebar-text">仪表盘</span>
						</div>
						<div class="af-sidebar-item">
							<span class="af-sidebar-icon">👥</span>
							<span class="af-sidebar-text">用户管理</span>
						</div>
						<div class="af-sidebar-item">
							<span class="af-sidebar-icon">📚</span>
							<span class="af-sidebar-text">漫画管理</span>
						</div>
						<div class="af-sidebar-item">
							<span class="af-sidebar-icon">⚙️</span>
							<span class="af-sidebar-text">系统设置</span>
						</div>
					</div>
				</div>

				<div class="af-sidebar-section">
					<h3 class="af-sidebar-title">系统统计</h3>
					<div class="af-stats">
						<div class="af-stat-item">
							<div class="af-stat-value">1,234</div>
							<div class="af-stat-label">总用户数</div>
						</div>
						<div class="af-stat-item">
							<div class="af-stat-value">5,678</div>
							<div class="af-stat-label">总漫画数</div>
						</div>
						<div class="af-stat-item">
							<div class="af-stat-value">9,012</div>
							<div class="af-stat-label">总章节数</div>
						</div>
					</div>
				</div>
			</aside>

			<!-- 主内容区 -->
			<main class="af-content">
				<div class="af-header">
					<h1 class="af-title">管理面板</h1>
					<div class="af-actions">
						<button class="af-btn-primary">添加用户</button>
						<button class="af-btn-secondary">导出数据</button>
					</div>
				</div>

				<!-- 统计卡片 -->
				<div class="af-stats-grid">
					<div class="af-stat-card">
						<div class="af-stat-card-icon">👥</div>
						<div class="af-stat-card-content">
							<div class="af-stat-card-value">1,234</div>
							<div class="af-stat-card-label">活跃用户</div>
						</div>
						<div class="af-stat-card-trend">↑ 12%</div>
					</div>
					<div class="af-stat-card">
						<div class="af-stat-card-icon">📚</div>
						<div class="af-stat-card-content">
							<div class="af-stat-card-value">5,678</div>
							<div class="af-stat-card-label">活跃漫画</div>
						</div>
						<div class="af-stat-card-trend">↑ 8%</div>
					</div>
					<div class="af-stat-card">
						<div class="af-stat-card-icon">📊</div>
						<div class="af-stat-card-content">
							<div class="af-stat-card-value">9,012</div>
							<div class="af-stat-card-label">今日阅读</div>
						</div>
						<div class="af-stat-card-trend">↑ 15%</div>
					</div>
					<div class="af-stat-card">
						<div class="af-stat-card-icon">⚠️</div>
						<div class="af-stat-card-content">
							<div class="af-stat-card-value">3</div>
							<div class="af-stat-card-label">待处理问题</div>
						</div>
						<div class="af-stat-card-trend">↓ 50%</div>
					</div>
				</div>

				<!-- 用户管理表格 -->
				<div class="af-table-container">
					<div class="af-table-header">
						<h2 class="af-table-title">用户管理</h2>
						<div class="af-table-actions">
							<input type="text" class="af-search-input" placeholder="搜索用户...">
							<select class="af-filter-select">
								<option>所有用户</option>
								<option>活跃用户</option>
								<option>新用户</option>
							</select>
						</div>
					</div>
					<table class="af-table">
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
									<div class="af-user-cell">
										<div class="af-user-avatar">👤</div>
										<div class="af-user-info">
											<div class="af-user-name">{{ user.name }}</div>
											<div class="af-user-id">ID: {{ user.id }}</div>
										</div>
									</div>
								</td>
								<td>{{ user.email }}</td>
								<td>
									<span :class="['af-role', `af-role-${user.role}`]">{{ user.role }}</span>
								</td>
								<td>
									<span :class="['af-status', `af-status-${user.status}`]">{{ user.status }}</span>
								</td>
								<td>{{ user.registerTime }}</td>
								<td>
									<div class="af-actions-cell">
										<button class="af-btn-action">编辑</button>
										<button class="af-btn-action">禁用</button>
										<button class="af-btn-action">删除</button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
					<div class="af-pagination">
						<button class="af-btn-page">上一页</button>
						<span class="af-page-info">第 1 页，共 10 页</span>
						<button class="af-btn-page">下一页</button>
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
.admin-f {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: #f8f9fa;
	font-family: 'Noto Sans JP', sans-serif;
	color: #2c3e50;
}

/* 顶部导航栏 */
.af-topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 24px;
	background: #ffffff;
	border-bottom: 1px solid #e9ecef;
}

.af-topbar-left {
	display: flex;
	align-items: center;
	gap: 32px;
}

.af-logo {
	font-size: 20px;
	font-weight: 500;
	color: #2c3e50;
}

.af-nav {
	display: flex;
	gap: 24px;
}

.af-nav-item {
	font-size: 14px;
	font-weight: 500;
	color: #6c757d;
	text-decoration: none;
	padding: 8px 12px;
	border-radius: 4px;
	transition: all 0.2s ease;
}

.af-nav-item:hover {
	background: #f8f9fa;
	color: #2c3e50;
}

.af-nav-item.active {
	background: #f8f9fa;
	color: #2c3e50;
	font-weight: 500;
}

.af-topbar-right {
	display: flex;
	align-items: center;
	gap: 12px;
}

.af-btn-icon {
	width: 40px;
	height: 40px;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	background: #ffffff;
	color: #2c3e50;
	font-size: 16px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.af-btn-icon:hover {
	background: #f8f9fa;
}

.af-user {
	display: flex;
	align-items: center;
	gap: 8px;
}

.af-user-avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: #f8f9fa;
	border: 1px solid #dee2e6;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #2c3e50;
	font-size: 14px;
}

.af-user-name {
	font-size: 14px;
	font-weight: 500;
	color: #2c3e50;
}

/* 主内容区 */
.af-main {
	display: flex;
	flex: 1;
	overflow: hidden;
}

/* 侧边栏 */
.af-sidebar {
	width: 280px;
	background: #ffffff;
	border-right: 1px solid #e9ecef;
	padding: 24px 16px;
	overflow-y: auto;
}

.af-sidebar-section {
	margin-bottom: 32px;
}

.af-sidebar-title {
	font-size: 14px;
	font-weight: 500;
	color: #6c757d;
	margin-bottom: 16px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.af-sidebar-items {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.af-sidebar-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 16px;
	border-radius: 4px;
	background: #ffffff;
	border: 1px solid #dee2e6;
	cursor: pointer;
	transition: all 0.2s ease;
}

.af-sidebar-item:hover {
	background: #f8f9fa;
}

.af-sidebar-item.active {
	background: #f8f9fa;
	border-color: #2c3e50;
}

.af-sidebar-icon {
	font-size: 16px;
	color: #2c3e50;
}

.af-sidebar-text {
	font-size: 14px;
	font-weight: 500;
	color: #2c3e50;
}

.af-stats {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.af-stat-item {
	padding: 16px;
	border-radius: 4px;
	background: #ffffff;
	border: 1px solid #dee2e6;
}

.af-stat-value {
	font-size: 18px;
	font-weight: 500;
	color: #2c3e50;
	margin-bottom: 4px;
}

.af-stat-label {
	font-size: 12px;
	color: #6c757d;
}

/* 主内容区 */
.af-content {
	flex: 1;
	overflow: auto;
	padding: 24px;
	background: #f8f9fa;
}

.af-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24px;
}

.af-title {
	font-size: 24px;
	font-weight: 500;
	color: #2c3e50;
}

.af-actions {
	display: flex;
	gap: 12px;
}

.af-btn-primary {
	padding: 10px 20px;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	background: #ffffff;
	color: #2c3e50;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.af-btn-primary:hover {
	background: #f8f9fa;
}

.af-btn-secondary {
	padding: 10px 20px;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	background: #ffffff;
	color: #6c757d;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.af-btn-secondary:hover {
	background: #f8f9fa;
}

/* 统计卡片 */
.af-stats-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	gap: 24px;
	margin-bottom: 32px;
}

.af-stat-card {
	padding: 24px;
	border-radius: 4px;
	background: #ffffff;
	border: 1px solid #dee2e6;
	display: flex;
	align-items: center;
	gap: 16px;
}

.af-stat-card-icon {
	width: 48px;
	height: 48px;
	border-radius: 4px;
	background: #f8f9fa;
	border: 1px solid #dee2e6;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
}

.af-stat-card-content {
	flex: 1;
}

.af-stat-card-value {
	font-size: 24px;
	font-weight: 500;
	color: #2c3e50;
	margin-bottom: 4px;
}

.af-stat-card-label {
	font-size: 14px;
	color: #6c757d;
}

.af-stat-card-trend {
	font-size: 14px;
	font-weight: 500;
	color: #28a745;
}

/* 表格容器 */
.af-table-container {
	background: #ffffff;
	border-radius: 4px;
	border: 1px solid #dee2e6;
	overflow: hidden;
}

.af-table-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24px;
	border-bottom: 1px solid #e9ecef;
}

.af-table-title {
	font-size: 18px;
	font-weight: 500;
	color: #2c3e50;
}

.af-table-actions {
	display: flex;
	gap: 12px;
}

.af-search-input {
	padding: 8px 16px;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	background: #ffffff;
	color: #2c3e50;
	font-size: 14px;
	outline: none;
}

.af-filter-select {
	padding: 8px 16px;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	background: #ffffff;
	color: #2c3e50;
	font-size: 14px;
	outline: none;
	cursor: pointer;
}

.af-table {
	width: 100%;
	border-collapse: collapse;
}

.af-table th {
	padding: 16px;
	text-align: left;
	font-size: 14px;
	font-weight: 500;
	color: #6c757d;
	border-bottom: 1px solid #e9ecef;
}

.af-table td {
	padding: 16px;
	font-size: 14px;
	color: #2c3e50;
	border-bottom: 1px solid #f8f9fa;
}

.af-user-cell {
	display: flex;
	align-items: center;
	gap: 12px;
}

.af-user-avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: #f8f9fa;
	border: 1px solid #dee2e6;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #2c3e50;
	font-size: 14px;
}

.af-user-info {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.af-user-name {
	font-size: 14px;
	font-weight: 500;
	color: #2c3e50;
}

.af-user-id {
	font-size: 12px;
	color: #6c757d;
}

.af-role {
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
	font-weight: 500;
}

.af-role-admin {
	background: #f8f9fa;
	color: #2c3e50;
	border: 1px solid #dee2e6;
}

.af-role-user {
	background: #f8f9fa;
	color: #6c757d;
	border: 1px solid #dee2e6;
}

.af-status {
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
	font-weight: 500;
}

.af-status-active {
	background: #f8f9fa;
	color: #28a745;
	border: 1px solid #dee2e6;
}

.af-status-inactive {
	background: #f8f9fa;
	color: #dc3545;
	border: 1px solid #dee2e6;
}

.af-actions-cell {
	display: flex;
	gap: 8px;
}

.af-btn-action {
	padding: 6px 12px;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	background: #ffffff;
	color: #2c3e50;
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.af-btn-action:hover {
	background: #f8f9fa;
}

.af-pagination {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16px;
	padding: 24px;
}

.af-btn-page {
	padding: 8px 16px;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	background: #ffffff;
	color: #2c3e50;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.af-btn-page:hover {
	background: #f8f9fa;
}

.af-page-info {
	font-size: 14px;
	color: #6c757d;
}
</style>