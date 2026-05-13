<template>
	<div class="admin-e">
		<!-- 顶部导航栏 -->
		<header class="ae-topbar">
			<div class="ae-topbar-left">
				<div class="ae-logo">📚 Smanga</div>
				<nav class="ae-nav">
					<a href="#" class="ae-nav-item active">管理面板</a>
					<a href="#" class="ae-nav-item">用户管理</a>
					<a href="#" class="ae-nav-item">漫画管理</a>
					<a href="#" class="ae-nav-item">系统设置</a>
				</nav>
			</div>
			<div class="ae-topbar-right">
				<button class="ae-btn-icon">🔔</button>
				<button class="ae-btn-icon">⚙️</button>
				<div class="ae-user">
					<div class="ae-user-avatar">👤</div>
					<div class="ae-user-name">管理员</div>
				</div>
			</div>
		</header>

		<div class="ae-main">
			<!-- 侧边栏 -->
			<aside class="ae-sidebar">
				<div class="ae-sidebar-section">
					<h3 class="ae-sidebar-title">快速访问</h3>
					<div class="ae-sidebar-items">
						<div class="ae-sidebar-item active">
							<span class="ae-sidebar-icon">📊</span>
							<span class="ae-sidebar-text">仪表盘</span>
						</div>
						<div class="ae-sidebar-item">
							<span class="ae-sidebar-icon">👥</span>
							<span class="ae-sidebar-text">用户管理</span>
						</div>
						<div class="ae-sidebar-item">
							<span class="ae-sidebar-icon">📚</span>
							<span class="ae-sidebar-text">漫画管理</span>
						</div>
						<div class="ae-sidebar-item">
							<span class="ae-sidebar-icon">⚙️</span>
							<span class="ae-sidebar-text">系统设置</span>
						</div>
					</div>
				</div>

				<div class="ae-sidebar-section">
					<h3 class="ae-sidebar-title">系统统计</h3>
					<div class="ae-stats">
						<div class="ae-stat-item">
							<div class="ae-stat-value">1,234</div>
							<div class="ae-stat-label">总用户数</div>
						</div>
						<div class="ae-stat-item">
							<div class="ae-stat-value">5,678</div>
							<div class="ae-stat-label">总漫画数</div>
						</div>
						<div class="ae-stat-item">
							<div class="ae-stat-value">9,012</div>
							<div class="ae-stat-label">总章节数</div>
						</div>
					</div>
				</div>
			</aside>

			<!-- 主内容区 -->
			<main class="ae-content">
				<div class="ae-header">
					<h1 class="ae-title">管理面板</h1>
					<div class="ae-actions">
						<button class="ae-btn-primary">添加用户</button>
						<button class="ae-btn-secondary">导出数据</button>
					</div>
				</div>

				<!-- 统计卡片 -->
				<div class="ae-stats-grid">
					<div class="ae-stat-card">
						<div class="ae-stat-card-icon">👥</div>
						<div class="ae-stat-card-content">
							<div class="ae-stat-card-value">1,234</div>
							<div class="ae-stat-card-label">活跃用户</div>
						</div>
						<div class="ae-stat-card-trend">↑ 12%</div>
					</div>
					<div class="ae-stat-card">
						<div class="ae-stat-card-icon">📚</div>
						<div class="ae-stat-card-content">
							<div class="ae-stat-card-value">5,678</div>
							<div class="ae-stat-card-label">活跃漫画</div>
						</div>
						<div class="ae-stat-card-trend">↑ 8%</div>
					</div>
					<div class="ae-stat-card">
						<div class="ae-stat-card-icon">📊</div>
						<div class="ae-stat-card-content">
							<div class="ae-stat-card-value">9,012</div>
							<div class="ae-stat-card-label">今日阅读</div>
						</div>
						<div class="ae-stat-card-trend">↑ 15%</div>
					</div>
					<div class="ae-stat-card">
						<div class="ae-stat-card-icon">⚠️</div>
						<div class="ae-stat-card-content">
							<div class="ae-stat-card-value">3</div>
							<div class="ae-stat-card-label">待处理问题</div>
						</div>
						<div class="ae-stat-card-trend">↓ 50%</div>
					</div>
				</div>

				<!-- 用户管理表格 -->
				<div class="ae-table-container">
					<div class="ae-table-header">
						<h2 class="ae-table-title">用户管理</h2>
						<div class="ae-table-actions">
							<input type="text" class="ae-search-input" placeholder="搜索用户...">
							<select class="ae-filter-select">
								<option>所有用户</option>
								<option>活跃用户</option>
								<option>新用户</option>
							</select>
						</div>
					</div>
					<table class="ae-table">
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
									<div class="ae-user-cell">
										<div class="ae-user-avatar">👤</div>
										<div class="ae-user-info">
											<div class="ae-user-name">{{ user.name }}</div>
											<div class="ae-user-id">ID: {{ user.id }}</div>
										</div>
									</div>
								</td>
								<td>{{ user.email }}</td>
								<td>
									<span :class="['ae-role', `ae-role-${user.role}`]">{{ user.role }}</span>
								</td>
								<td>
									<span :class="['ae-status', `ae-status-${user.status}`]">{{ user.status }}</span>
								</td>
								<td>{{ user.registerTime }}</td>
								<td>
									<div class="ae-actions-cell">
										<button class="ae-btn-action">编辑</button>
										<button class="ae-btn-action">禁用</button>
										<button class="ae-btn-action">删除</button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
					<div class="ae-pagination">
						<button class="ae-btn-page">上一页</button>
						<span class="ae-page-info">第 1 页，共 10 页</span>
						<button class="ae-btn-page">下一页</button>
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
.admin-e {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: #e0e5ec;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	color: #2d3748;
}

/* 顶部导航栏 */
.ae-topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 24px;
	background: #e0e5ec;
	border-bottom: 1px solid #babecf;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
}

.ae-topbar-left {
	display: flex;
	align-items: center;
	gap: 32px;
}

.ae-logo {
	font-size: 20px;
	font-weight: 700;
	color: #2d3748;
}

.ae-nav {
	display: flex;
	gap: 24px;
}

.ae-nav-item {
	font-size: 14px;
	font-weight: 600;
	color: #4a5568;
	text-decoration: none;
	padding: 8px 12px;
	border-radius: 12px;
	transition: all 0.2s ease;
}

.ae-nav-item:hover {
	background: #e0e5ec;
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}

.ae-nav-item.active {
	background: #e0e5ec;
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
	color: #2d3748;
}

.ae-topbar-right {
	display: flex;
	align-items: center;
	gap: 12px;
}

.ae-btn-icon {
	width: 40px;
	height: 40px;
	border: none;
	border-radius: 12px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	color: #2d3748;
	font-size: 16px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.ae-btn-icon:hover {
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}

.ae-user {
	display: flex;
	align-items: center;
	gap: 8px;
}

.ae-user-avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #2d3748;
	font-size: 14px;
}

.ae-user-name {
	font-size: 14px;
	font-weight: 600;
	color: #2d3748;
}

/* 主内容区 */
.ae-main {
	display: flex;
	flex: 1;
	overflow: hidden;
}

/* 侧边栏 */
.ae-sidebar {
	width: 280px;
	background: #e0e5ec;
	border-right: 1px solid #babecf;
	padding: 24px 16px;
	box-shadow: 
		5px 0 10px #babecf;
	overflow-y: auto;
}

.ae-sidebar-section {
	margin-bottom: 32px;
}

.ae-sidebar-title {
	font-size: 14px;
	font-weight: 600;
	color: #4a5568;
	margin-bottom: 16px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.ae-sidebar-items {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.ae-sidebar-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 16px;
	border-radius: 12px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	cursor: pointer;
	transition: all 0.2s ease;
}

.ae-sidebar-item:hover {
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}

.ae-sidebar-item.active {
	background: #e0e5ec;
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}

.ae-sidebar-icon {
	font-size: 16px;
	color: #2d3748;
}

.ae-sidebar-text {
	font-size: 14px;
	font-weight: 500;
	color: #2d3748;
}

.ae-stats {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.ae-stat-item {
	padding: 16px;
	border-radius: 12px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
}

.ae-stat-value {
	font-size: 18px;
	font-weight: 700;
	color: #2d3748;
	margin-bottom: 4px;
}

.ae-stat-label {
	font-size: 12px;
	color: #4a5568;
}

/* 主内容区 */
.ae-content {
	flex: 1;
	overflow: auto;
	padding: 24px;
}

.ae-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24px;
}

.ae-title {
	font-size: 24px;
	font-weight: 700;
	color: #2d3748;
}

.ae-actions {
	display: flex;
	gap: 12px;
}

.ae-btn-primary {
	padding: 10px 20px;
	border: none;
	border-radius: 12px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	color: #2d3748;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.ae-btn-primary:hover {
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}

.ae-btn-secondary {
	padding: 10px 20px;
	border: none;
	border-radius: 12px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	color: #4a5568;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.ae-btn-secondary:hover {
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}

/* 统计卡片 */
.ae-stats-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	gap: 24px;
	margin-bottom: 32px;
}

.ae-stat-card {
	padding: 24px;
	border-radius: 16px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	display: flex;
	align-items: center;
	gap: 16px;
}

.ae-stat-card-icon {
	width: 48px;
	height: 48px;
	border-radius: 12px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
}

.ae-stat-card-content {
	flex: 1;
}

.ae-stat-card-value {
	font-size: 24px;
	font-weight: 700;
	color: #2d3748;
	margin-bottom: 4px;
}

.ae-stat-card-label {
	font-size: 14px;
	color: #4a5568;
}

.ae-stat-card-trend {
	font-size: 14px;
	font-weight: 600;
	color: #38a169;
}

/* 表格容器 */
.ae-table-container {
	background: #e0e5ec;
	border-radius: 16px;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	overflow: hidden;
}

.ae-table-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24px;
	border-bottom: 1px solid #babecf;
}

.ae-table-title {
	font-size: 18px;
	font-weight: 700;
	color: #2d3748;
}

.ae-table-actions {
	display: flex;
	gap: 12px;
}

.ae-search-input {
	padding: 8px 16px;
	border: none;
	border-radius: 12px;
	background: #e0e5ec;
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
	color: #2d3748;
	font-size: 14px;
	outline: none;
}

.ae-filter-select {
	padding: 8px 16px;
	border: none;
	border-radius: 12px;
	background: #e0e5ec;
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
	color: #2d3748;
	font-size: 14px;
	outline: none;
	cursor: pointer;
}

.ae-table {
	width: 100%;
	border-collapse: collapse;
}

.ae-table th {
	padding: 16px;
	text-align: left;
	font-size: 14px;
	font-weight: 600;
	color: #4a5568;
	border-bottom: 1px solid #babecf;
}

.ae-table td {
	padding: 16px;
	font-size: 14px;
	color: #2d3748;
	border-bottom: 1px solid #e2e8f0;
}

.ae-user-cell {
	display: flex;
	align-items: center;
	gap: 12px;
}

.ae-user-avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #2d3748;
	font-size: 14px;
}

.ae-user-info {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.ae-user-name {
	font-size: 14px;
	font-weight: 600;
	color: #2d3748;
}

.ae-user-id {
	font-size: 12px;
	color: #4a5568;
}

.ae-role {
	padding: 4px 8px;
	border-radius: 12px;
	font-size: 12px;
	font-weight: 600;
}

.ae-role-admin {
	background: #e0e5ec;
	color: #2d3748;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
}

.ae-role-user {
	background: #e0e5ec;
	color: #4a5568;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
}

.ae-status {
	padding: 4px 8px;
	border-radius: 12px;
	font-size: 12px;
	font-weight: 600;
}

.ae-status-active {
	background: #e0e5ec;
	color: #38a169;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
}

.ae-status-inactive {
	background: #e0e5ec;
	color: #e53e3e;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
}

.ae-actions-cell {
	display: flex;
	gap: 8px;
}

.ae-btn-action {
	padding: 6px 12px;
	border: none;
	border-radius: 12px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	color: #2d3748;
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.ae-btn-action:hover {
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}

.ae-pagination {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16px;
	padding: 24px;
}

.ae-btn-page {
	padding: 8px 16px;
	border: none;
	border-radius: 12px;
	background: #e0e5ec;
	box-shadow: 
		5px 5px 10px #babecf,
		-5px -5px 10px #ffffff;
	color: #2d3748;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.ae-btn-page:hover {
	box-shadow: 
		inset 2px 2px 5px #babecf,
		inset -2px -2px 5px #ffffff;
}

.ae-page-info {
	font-size: 14px;
	color: #4a5568;
}
</style>