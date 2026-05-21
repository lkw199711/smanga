<template>
	<div :class="['manage-panel', `preview-${styleKey.toLowerCase()}`]">
		<header class="mp-header">
			<div>
				<div class="mp-eyebrow">{{ config.eyebrow }}</div>
				<h1>{{ config.title }}</h1>
				<p>{{ config.desc }}</p>
			</div>
			<button class="mp-primary">{{ config.primaryAction }}</button>
		</header>

		<section class="mp-stats">
			<div v-for="stat in config.stats" :key="stat.label" class="mp-stat">
				<span>{{ stat.label }}</span>
				<strong>{{ stat.value }}</strong>
				<small>{{ stat.hint }}</small>
			</div>
		</section>

		<div class="mp-toolbar">
			<div class="mp-search">
				<span>⌕</span>
				<input v-model="keyword" :placeholder="`搜索${config.title}`" />
			</div>
			<div class="mp-filters">
				<button v-for="filter in config.filters" :key="filter">{{ filter }}</button>
			</div>
		</div>

		<section class="mp-layout">
			<div class="mp-table-wrap">
				<table class="mp-table">
					<thead>
						<tr>
							<th v-for="column in config.columns" :key="column.key">{{ column.label }}</th>
							<th>操作</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="row in filteredRows" :key="row.id">
							<td v-for="column in config.columns" :key="column.key">
								<span v-if="column.key === 'status'" :class="['mp-status', row.statusTone]">{{ row[column.key] }}</span>
								<strong v-else-if="column.strong">{{ row[column.key] }}</strong>
								<span v-else>{{ row[column.key] }}</span>
							</td>
							<td class="mp-actions">
								<button v-for="action in config.rowActions" :key="action" :class="{ danger: action.includes('删除') || action.includes('停止') }">
									{{ action }}
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<aside class="mp-side">
				<div class="mp-side-title">{{ config.sideTitle }}</div>
				<div v-for="item in config.sideItems" :key="item.title" class="mp-side-item">
					<strong>{{ item.title }}</strong>
					<span>{{ item.desc }}</span>
				</div>
			</aside>
		</section>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type Row = Record<string, string>;
type ManageConfig = {
	eyebrow: string;
	title: string;
	desc: string;
	primaryAction: string;
	stats: Array<{ label: string; value: string; hint: string }>;
	filters: string[];
	columns: Array<{ key: string; label: string; strong?: boolean }>;
	rows: Row[];
	rowActions: string[];
	sideTitle: string;
	sideItems: Array<{ title: string; desc: string }>;
};

const props = defineProps<{
	page: string;
	styleKey?: 'A' | 'B' | 'C' | 'D';
}>();

const keyword = ref('');
const styleKey = computed(() => props.styleKey || 'A');

const configs: Record<string, ManageConfig> = {
	'manage-user': {
		eyebrow: 'Access Control',
		title: '用户管理',
		desc: '维护用户账号、角色、权限与最近登录状态。',
		primaryAction: '新建用户',
		stats: [
			{ label: '用户总数', value: '12', hint: '3 位管理员' },
			{ label: '今日活跃', value: '8', hint: '+2 较昨日' },
			{ label: '待确认', value: '1', hint: '邮箱未验证' },
		],
		filters: ['全部', '管理员', '普通用户', '已停用'],
		columns: [
			{ key: 'name', label: '用户', strong: true },
			{ key: 'role', label: '角色' },
			{ key: 'login', label: '最近登录' },
			{ key: 'status', label: '状态' },
		],
		rows: [
			{ id: 'u1', name: 'admin', role: '系统管理员', login: '今天 19:12', status: '在线', statusTone: 'ok' },
			{ id: 'u2', name: 'akira', role: '媒体库维护', login: '今天 16:48', status: '正常', statusTone: 'ok' },
			{ id: 'u3', name: 'guest-reader', role: '只读用户', login: '昨天 22:08', status: '限速', statusTone: 'warn' },
			{ id: 'u4', name: 'archived', role: '普通用户', login: '30 天前', status: '停用', statusTone: 'danger' },
		],
		rowActions: ['编辑', '权限', '删除'],
		sideTitle: '权限摘要',
		sideItems: [
			{ title: '默认权限', desc: '新用户默认只能浏览公开媒体库。' },
			{ title: '管理员权限', desc: '允许扫描、编辑元数据和管理任务。' },
			{ title: '安全建议', desc: '建议关闭长期未登录账号的写入权限。' },
		],
	},
	'manage-media': {
		eyebrow: 'Library',
		title: '媒体库管理',
		desc: '管理媒体库名称、路径、扫描策略与公开范围。',
		primaryAction: '新建媒体库',
		stats: [
			{ label: '媒体库', value: '4', hint: '3 个自动扫描' },
			{ label: '漫画总量', value: '1,284', hint: '+24 本周' },
			{ label: '异常库', value: '1', hint: '路径需确认' },
		],
		filters: ['全部', '自动扫描', '手动扫描', '异常'],
		columns: [
			{ key: 'name', label: '媒体库', strong: true },
			{ key: 'path', label: '路径' },
			{ key: 'scan', label: '扫描策略' },
			{ key: 'status', label: '状态' },
		],
		rows: [
			{ id: 'm1', name: '少年漫画', path: '/library/shonen', scan: '每 6 小时', status: '正常', statusTone: 'ok' },
			{ id: 'm2', name: '少女漫画', path: '/library/shojo', scan: '每天 03:00', status: '正常', statusTone: 'ok' },
			{ id: 'm3', name: '青年漫画', path: '/library/seinen', scan: '手动', status: '待扫描', statusTone: 'warn' },
			{ id: 'm4', name: '同人本', path: '/mnt/archive/doujin', scan: '关闭', status: '路径异常', statusTone: 'danger' },
		],
		rowActions: ['编辑', '扫描', '删除'],
		sideTitle: '扫描策略',
		sideItems: [
			{ title: '增量扫描', desc: '只检查变更目录，适合大媒体库。' },
			{ title: '封面刷新', desc: '检测封面缺失时自动重建索引。' },
			{ title: '路径健康', desc: '发现不可达路径时暂停任务。' },
		],
	},
	'manage-path': {
		eyebrow: 'Storage',
		title: '路径管理',
		desc: '维护扫描路径、挂载状态、容量和目录索引规则。',
		primaryAction: '添加路径',
		stats: [
			{ label: '路径数量', value: '9', hint: '7 个在线' },
			{ label: '可用空间', value: '1.8 TB', hint: '42% 空闲' },
			{ label: '索引延迟', value: '12m', hint: '最近一次' },
		],
		filters: ['全部', '在线', '只读', '异常'],
		columns: [
			{ key: 'name', label: '挂载名', strong: true },
			{ key: 'path', label: '路径' },
			{ key: 'usage', label: '容量' },
			{ key: 'status', label: '状态' },
		],
		rows: [
			{ id: 'p1', name: 'Main NAS', path: '/data/manga', usage: '3.2 / 6 TB', status: '在线', statusTone: 'ok' },
			{ id: 'p2', name: 'SSD Cache', path: '/cache/manga', usage: '420 / 512 GB', status: '高速缓存', statusTone: 'ok' },
			{ id: 'p3', name: 'Archive', path: '/mnt/archive', usage: '9.1 / 10 TB', status: '只读', statusTone: 'warn' },
			{ id: 'p4', name: 'Old Disk', path: '/mnt/old', usage: '未知', status: '离线', statusTone: 'danger' },
		],
		rowActions: ['检查', '编辑', '删除'],
		sideTitle: '目录规则',
		sideItems: [
			{ title: '忽略规则', desc: '跳过 @eaDir、.DS_Store 和临时下载目录。' },
			{ title: '命名识别', desc: '优先从文件夹名识别漫画名和章节号。' },
			{ title: '只读路径', desc: '只读挂载不会执行重命名和压缩写入。' },
		],
	},
	'manage-chapter': {
		eyebrow: 'Chapter Index',
		title: '章节管理',
		desc: '处理章节排序、封面、页数和重扫任务。',
		primaryAction: '批量重扫',
		stats: [
			{ label: '章节总数', value: '38,562', hint: '+1.2k 本周' },
			{ label: '缺封面', value: '46', hint: '需刷新' },
			{ label: '排序异常', value: '12', hint: '待确认' },
		],
		filters: ['全部', '缺封面', '页数异常', '排序异常'],
		columns: [
			{ key: 'name', label: '章节', strong: true },
			{ key: 'manga', label: '漫画' },
			{ key: 'pages', label: '页数' },
			{ key: 'status', label: '状态' },
		],
		rows: [
			{ id: 'c1', name: '第 128 话', manga: '葬送的芙莉莲', pages: '24', status: '正常', statusTone: 'ok' },
			{ id: 'c2', name: '第 245 话', manga: '咒术回战', pages: '18', status: '待压缩', statusTone: 'warn' },
			{ id: 'c3', name: '番外 03', manga: '间谍过家家', pages: '0', status: '页数异常', statusTone: 'danger' },
			{ id: 'c4', name: '第 72 话', manga: '药屋少女的呢喃', pages: '22', status: '缺封面', statusTone: 'warn' },
		],
		rowActions: ['预览', '重扫', '删除'],
		sideTitle: '章节处理',
		sideItems: [
			{ title: '页数校验', desc: '页数为 0 或图片损坏时标记为异常。' },
			{ title: '自然排序', desc: '支持 1、1.5、番外、特典等混合编号。' },
			{ title: '封面策略', desc: '默认使用章节第一页，可手动指定。' },
		],
	},
	'manage-bookmark': {
		eyebrow: 'Bookmark',
		title: '书签管理',
		desc: '批量整理阅读书签、页码记录和备注内容。',
		primaryAction: '导出书签',
		stats: [
			{ label: '书签数量', value: '218', hint: '+7 本周' },
			{ label: '带备注', value: '54', hint: '可搜索' },
			{ label: '失效书签', value: '3', hint: '章节已删除' },
		],
		filters: ['全部', '带备注', '失效', '最近添加'],
		columns: [
			{ key: 'name', label: '漫画', strong: true },
			{ key: 'chapter', label: '章节' },
			{ key: 'page', label: '页码' },
			{ key: 'status', label: '状态' },
		],
		rows: [
			{ id: 'b1', name: '进击的巨人', chapter: '最终话', page: '第 14 页', status: '已同步', statusTone: 'ok' },
			{ id: 'b2', name: '咒术回战', chapter: '第 245 话', page: '第 6 页', status: '本地', statusTone: 'warn' },
			{ id: 'b3', name: '蓝锁', chapter: '第 258 话', page: '第 9 页', status: '已同步', statusTone: 'ok' },
			{ id: 'b4', name: '旧条目', chapter: '第 12 话', page: '第 1 页', status: '失效', statusTone: 'danger' },
		],
		rowActions: ['打开', '编辑', '删除'],
		sideTitle: '整理建议',
		sideItems: [
			{ title: '备注索引', desc: '把备注纳入搜索结果，便于找回名场面。' },
			{ title: '失效清理', desc: '章节删除后保留 30 天再自动清理。' },
			{ title: '导出格式', desc: '支持 JSON 备份和 Markdown 清单。' },
		],
	},
	'manage-tag': {
		eyebrow: 'Tags',
		title: '标签管理',
		desc: '维护标签颜色、别名、合并关系和漫画关联数。',
		primaryAction: '新建标签',
		stats: [
			{ label: '标签总数', value: '46', hint: '8 个系统标签' },
			{ label: '未使用', value: '5', hint: '建议清理' },
			{ label: '合并候选', value: '3', hint: '名称相近' },
		],
		filters: ['全部', '热门', '未使用', '系统标签'],
		columns: [
			{ key: 'name', label: '标签', strong: true },
			{ key: 'alias', label: '别名' },
			{ key: 'count', label: '关联数' },
			{ key: 'status', label: '状态' },
		],
		rows: [
			{ id: 't1', name: '热血', alias: 'battle', count: '286', status: '热门', statusTone: 'ok' },
			{ id: 't2', name: '日常', alias: 'slice-of-life', count: '142', status: '正常', statusTone: 'ok' },
			{ id: 't3', name: '治愈', alias: 'healing', count: '64', status: '正常', statusTone: 'ok' },
			{ id: 't4', name: '动作番', alias: 'action', count: '0', status: '未使用', statusTone: 'warn' },
		],
		rowActions: ['编辑', '合并', '删除'],
		sideTitle: '标签规则',
		sideItems: [
			{ title: '别名匹配', desc: '导入元数据时自动识别中英文别名。' },
			{ title: '合并保护', desc: '系统标签合并前需要二次确认。' },
			{ title: '颜色继承', desc: '新标签默认继承当前主题强调色。' },
		],
	},
	'manage-compress': {
		eyebrow: 'Archive',
		title: '解压管理',
		desc: '查看压缩包解析、解压缓存、失败任务和重试队列。',
		primaryAction: '新建解压任务',
		stats: [
			{ label: '运行中', value: '3', hint: '并发 2' },
			{ label: '等待中', value: '18', hint: '约 24 分钟' },
			{ label: '失败', value: '4', hint: '密码或损坏' },
		],
		filters: ['全部', '运行中', '等待中', '失败'],
		columns: [
			{ key: 'name', label: '任务', strong: true },
			{ key: 'source', label: '来源' },
			{ key: 'progress', label: '进度' },
			{ key: 'status', label: '状态' },
		],
		rows: [
			{ id: 'z1', name: 'one-piece-108.zip', source: '少年漫画', progress: '82%', status: '运行中', statusTone: 'ok' },
			{ id: 'z2', name: 'frieren-vol12.cbz', source: '少女漫画', progress: '100%', status: '已完成', statusTone: 'ok' },
			{ id: 'z3', name: 'archive-pack-03.rar', source: '同人本', progress: '0%', status: '等待中', statusTone: 'warn' },
			{ id: 'z4', name: 'broken.7z', source: '青年漫画', progress: '14%', status: '失败', statusTone: 'danger' },
		],
		rowActions: ['日志', '重试', '停止'],
		sideTitle: '队列策略',
		sideItems: [
			{ title: '并发限制', desc: '大文件解压默认限制为 2 个并发任务。' },
			{ title: '缓存清理', desc: '完成 7 天后自动清理临时目录。' },
			{ title: '失败重试', desc: '密码错误和文件损坏不会自动重试。' },
		],
	},
	'manage-jobs': {
		eyebrow: 'Jobs',
		title: '任务管理',
		desc: '监控扫描、同步、压缩、封面刷新等后台任务。',
		primaryAction: '创建任务',
		stats: [
			{ label: '运行中', value: '7', hint: '2 个高优先级' },
			{ label: '等待中', value: '31', hint: '队列稳定' },
			{ label: '失败率', value: '1.8%', hint: '近 24 小时' },
		],
		filters: ['全部', '扫描', '同步', '失败'],
		columns: [
			{ key: 'name', label: '任务', strong: true },
			{ key: 'type', label: '类型' },
			{ key: 'progress', label: '进度' },
			{ key: 'status', label: '状态' },
		],
		rows: [
			{ id: 'j1', name: '少年漫画增量扫描', type: '扫描', progress: '64%', status: '运行中', statusTone: 'ok' },
			{ id: 'j2', name: '封面缓存刷新', type: '图片', progress: '27%', status: '运行中', statusTone: 'ok' },
			{ id: 'j3', name: 'P2P 分享同步', type: '同步', progress: '0%', status: '等待中', statusTone: 'warn' },
			{ id: 'j4', name: '旧目录重建索引', type: '索引', progress: '8%', status: '失败', statusTone: 'danger' },
		],
		rowActions: ['查看', '重试', '停止'],
		sideTitle: '运行状态',
		sideItems: [
			{ title: '优先级', desc: '手动触发任务优先于定时任务。' },
			{ title: '失败保留', desc: '失败日志默认保留 14 天。' },
			{ title: '并发控制', desc: '扫描和压缩任务使用独立并发池。' },
		],
	},
};

const fallbackConfig = configs['manage-user'];
const config = computed(() => configs[props.page] || fallbackConfig);
const filteredRows = computed(() => {
	const value = keyword.value.trim().toLowerCase();
	if (!value) return config.value.rows;
	return config.value.rows.filter((row) =>
		Object.values(row).some((text) => String(text).toLowerCase().includes(value))
	);
});
</script>

<style scoped>
.manage-panel {
	min-height: calc(100vh - 65px);
	padding: 28px;
	color: var(--mp-text);
	background: var(--mp-bg);
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.preview-a {
	--mp-bg: #fafafa;
	--mp-card: #fff;
	--mp-border: #e5e7eb;
	--mp-text: #111827;
	--mp-muted: #6b7280;
	--mp-faint: #9ca3af;
	--mp-hover: #f9fafb;
	--mp-primary: #2563eb;
	--mp-primary-soft: #eff6ff;
	--mp-radius: 10px;
}

.preview-b {
	--mp-bg: linear-gradient(135deg, #fff5fa 0%, #eef4ff 52%, #f5ecff 100%);
	--mp-card: rgba(255, 255, 255, 0.74);
	--mp-border: rgba(255, 255, 255, 0.92);
	--mp-text: #1f2937;
	--mp-muted: #6b7280;
	--mp-faint: #9ca3af;
	--mp-hover: rgba(255, 255, 255, 0.86);
	--mp-primary: #ff6fa3;
	--mp-primary-soft: rgba(255, 111, 163, 0.13);
	--mp-radius: 16px;
}

.preview-c {
	--mp-bg: #0d0f12;
	--mp-card: #161a20;
	--mp-border: #2a313c;
	--mp-text: #e6e8eb;
	--mp-muted: #9aa3ae;
	--mp-faint: #5c6470;
	--mp-hover: #1e232b;
	--mp-primary: #f5a524;
	--mp-primary-soft: rgba(245, 165, 36, 0.12);
	--mp-radius: 8px;
}

.preview-d {
	--mp-bg: #eff6ff;
	--mp-card: #fff;
	--mp-border: #dbeafe;
	--mp-text: #0f172a;
	--mp-muted: #64748b;
	--mp-faint: #94a3b8;
	--mp-hover: #dbeafe;
	--mp-primary: #2563eb;
	--mp-primary-soft: rgba(37, 99, 235, 0.1);
	--mp-radius: 10px;
}

.mp-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 20px;
	margin-bottom: 20px;
}

.mp-eyebrow {
	margin-bottom: 6px;
	color: var(--mp-primary);
	font-size: 12px;
	font-weight: 700;
	text-transform: uppercase;
}

.mp-header h1 {
	margin: 0;
	font-size: 22px;
	line-height: 1.25;
}

.mp-header p {
	max-width: 620px;
	margin: 8px 0 0;
	color: var(--mp-muted);
	line-height: 1.7;
}

.mp-primary,
.mp-filters button,
.mp-actions button {
	border: 1px solid var(--mp-border);
	border-radius: 8px;
	background: var(--mp-card);
	color: var(--mp-text);
	cursor: pointer;
}

.mp-primary {
	flex-shrink: 0;
	padding: 9px 16px;
	border-color: var(--mp-primary);
	background: var(--mp-primary);
	color: #fff;
	font-weight: 700;
}

.preview-b .mp-primary,
.preview-b .mp-filters button,
.preview-b .mp-actions button {
	border-radius: 999px;
}

.mp-stats {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 12px;
	margin-bottom: 18px;
}

.mp-stat {
	padding: 16px;
	border: 1px solid var(--mp-border);
	border-radius: var(--mp-radius);
	background: var(--mp-card);
}

.preview-b .mp-stat,
.preview-b .mp-table-wrap,
.preview-b .mp-side,
.preview-b .mp-search {
	backdrop-filter: blur(14px);
}

.mp-stat span,
.mp-stat small {
	display: block;
	color: var(--mp-muted);
	font-size: 12px;
}

.mp-stat strong {
	display: block;
	margin: 6px 0;
	font-size: 24px;
	color: var(--mp-text);
}

.mp-toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 14px;
	margin-bottom: 16px;
}

.mp-search {
	display: flex;
	align-items: center;
	gap: 8px;
	width: min(420px, 100%);
	padding: 9px 13px;
	border: 1px solid var(--mp-border);
	border-radius: var(--mp-radius);
	background: var(--mp-card);
	color: var(--mp-faint);
}

.mp-search input {
	width: 100%;
	border: 0;
	outline: 0;
	background: transparent;
	color: var(--mp-text);
	font-size: 13px;
}

.mp-search input::placeholder {
	color: var(--mp-faint);
}

.mp-filters {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	gap: 6px;
}

.mp-filters button {
	padding: 7px 11px;
	color: var(--mp-muted);
}

.mp-filters button:first-child {
	background: var(--mp-primary-soft);
	color: var(--mp-primary);
	border-color: transparent;
	font-weight: 700;
}

.mp-layout {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 280px;
	gap: 16px;
}

.mp-table-wrap,
.mp-side {
	border: 1px solid var(--mp-border);
	border-radius: var(--mp-radius);
	background: var(--mp-card);
	overflow: hidden;
}

.mp-table {
	width: 100%;
	border-collapse: collapse;
}

.mp-table th {
	padding: 12px 14px;
	color: var(--mp-muted);
	background: color-mix(in srgb, var(--mp-card) 84%, var(--mp-hover));
	border-bottom: 1px solid var(--mp-border);
	text-align: left;
	font-size: 12px;
	font-weight: 700;
}

.preview-c .mp-table th {
	text-transform: uppercase;
	letter-spacing: 0.06em;
	font-size: 10px;
}

.mp-table td {
	padding: 12px 14px;
	border-bottom: 1px solid var(--mp-border);
	color: var(--mp-muted);
	font-size: 13px;
}

.mp-table tr:last-child td {
	border-bottom: 0;
}

.mp-table tr:hover td {
	background: var(--mp-hover);
}

.mp-table strong {
	color: var(--mp-text);
}

.mp-status {
	display: inline-flex;
	align-items: center;
	padding: 3px 8px;
	border-radius: 999px;
	font-size: 12px;
	font-weight: 700;
	background: var(--mp-primary-soft);
	color: var(--mp-primary);
}

.mp-status.ok {
	background: rgba(5, 150, 105, 0.12);
	color: #059669;
}

.mp-status.warn {
	background: rgba(217, 119, 6, 0.13);
	color: #d97706;
}

.mp-status.danger {
	background: rgba(220, 38, 38, 0.12);
	color: #dc2626;
}

.mp-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 5px;
}

.mp-actions button {
	padding: 5px 9px;
	color: var(--mp-primary);
	background: var(--mp-primary-soft);
	border-color: transparent;
	font-size: 12px;
}

.mp-actions button.danger {
	color: #dc2626;
	background: rgba(220, 38, 38, 0.1);
}

.mp-side {
	padding: 16px;
}

.mp-side-title {
	margin-bottom: 12px;
	font-size: 13px;
	font-weight: 800;
	color: var(--mp-text);
}

.mp-side-item {
	padding: 12px 0;
	border-top: 1px solid var(--mp-border);
}

.mp-side-item strong {
	display: block;
	margin-bottom: 5px;
	font-size: 13px;
	color: var(--mp-text);
}

.mp-side-item span {
	color: var(--mp-muted);
	font-size: 12px;
	line-height: 1.6;
}

@media (max-width: 980px) {
	.mp-layout,
	.mp-stats {
		grid-template-columns: 1fr;
	}

	.mp-toolbar,
	.mp-header {
		align-items: stretch;
		flex-direction: column;
	}

	.mp-filters {
		justify-content: flex-start;
	}

	.mp-table-wrap {
		overflow-x: auto;
	}

	.mp-table {
		min-width: 760px;
	}
}
</style>
