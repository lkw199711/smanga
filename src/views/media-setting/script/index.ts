import {
	Delete,
	Edit,
	Upload,
	Plus,
	FolderOpened,
} from '@element-plus/icons-vue';
import {defineComponent} from 'vue';
import {
	add_media,
	delete_media,
	get_media,
	get_path,
	delete_path,
	update_media,
} from '@/api/media';
import {add_path, rescan_path} from '@/api/path';
import {ElMessage, ElMessageBox} from 'element-plus';
import tablePager from '@/components/table-pager.vue';
import {scan_path} from '@/api/path';
import i18n from '@/i18n';

const {t} = i18n.global;

export default defineComponent({
	name: 'media-setting-index',
	setup() {
		return {
			Edit,
			Delete,
			Plus,
			Upload,
			FolderOpened,
		};
	},
	// 数据
	data() {
		return {
			count: 0,
			tableData: [],
			addMediaDialog: false,
			addPathDialog: false,
			editMediaDialog: false,
			form: {
				mediaName: '',
				mediaType: 0,
				fileType: 0,
				mediaPath: '',
				defaultBrowse: '',
				directoryFormat: 0,
				removeFirst: 0,
				direction: 1,
			} as any,
			formInit: {
				mediaName: '',
				mediaType: 0,
				fileType: 0,
				mediaPath: '',
				defaultBrowse: 'flow',
				directoryFormat: 0,
				removeFirst: 0,
				direction: 1,
			},
			pathCache: '',
			pathArr: [] as any[],
		};
	},

	// 传值
	props: [],

	// 计算
	computed: {},

	// 组件
	components: {tablePager},

	// 方法
	methods: {
		/***
		 * 关闭弹窗
		 */
		dialog_close() {
			this.addMediaDialog = false;
			this.editMediaDialog = false;
		},
		/**
		 * 开启弹窗
		 */
		dialog_open() {
			Object.assign(this.form, this.formInit);

			this.addMediaDialog = true;
		},
		/**
		 * 打开路径编辑弹框
		 * @param index
		 * @param row
		 */
		async path_dialog_open(index: any, row: any) {
			Object.assign(this.form, row);
			this.addPathDialog = true;

			this.pathArr = [];

			this.load_path(row.mediaId);
		},
		/**
		 * 加载路径列表
		 */
		async load_path(mediaId: any) {
			const res = await get_path(mediaId);

			if (res.data) {
				this.pathArr = res.data.list;
			} else {
				this.pathArr = [];
			}
		},
		/**
		 * 加载表格数据
		 */
		async load_table(page = 1, pageSize = 10) {
			const res = await get_media(page, pageSize);
			this.count = Number(res.data.list.total);
			this.tableData = res.data.list.data;
		},
		/**
		 * 重载数据 页码不变
		 */
		reload_table() {
			(this.$refs as any).pager.reload_page();
		},
		/**
		 * 新增媒体库
		 * @returns {Promise<void>}
		 */
		async do_add_media() {
			// 表单验证
			if (!this.form.mediaName) {
				ElMessage({
					message: t('path.warning.name'),
					type: 'warning',
				});

				return false;
			}

			const res = await add_media(this.form);
			if (res.data.code === 0) {
				this.dialog_close();
				this.reload_table();
			}
		},

		/**
		 * 编辑媒体库
		 * @param index
		 * @param row
		 */
		edit_media(index: any, row: any) {
			Object.assign(this.form, row);

			this.editMediaDialog = true;
		},

		/**
		 * 编辑媒体库请求
		 */
		async update_media() {
			// 表单验证
			if (!this.form.mediaName) {
				ElMessage({
					message: t('path.warning.name'),
					type: 'warning',
				});

				return false;
			}

			const res = await update_media(this.form);

			if (res.data.code === 0) {
				this.editMediaDialog = false;
				this.reload_table();
			}
		},

		/**
		 * 删除媒体库
		 * */
		async do_delete_media(index: any, row: any) {
			ElMessageBox.confirm(t('path.confirm.text'), t('path.confirm.title'), {
				type: 'warning',
			})
				.then(async () => {
					const res = await delete_media(row.mediaId);

					if (res.data.code === 0) {
						this.reload_table();
					}
				})
				.catch(() => {});
		},
		/**
		 * 删除路径
		 * */
		async delete_path(pathInfo: any) {
			ElMessageBox.confirm(t('path.confirm.text1'), t('path.confirm.title'), {
				type: 'warning',
			})
				.then(async () => {
					const res = await delete_path(pathInfo.pathId);

					if (res.data.code === 0) {
						this.load_path(pathInfo.mediaId);
					}
				})
				.catch(() => {});
		},
		/**
		 * 重新扫面路径
		 * @param pathInfo
		 */
		async rescan_path(pathInfo: any) {
			ElMessageBox.confirm(t('path.confirm.text2'), t('path.confirm.title2'), {
				type: 'warning',
			})
				.then(async () => {
					const res = await rescan_path(
						pathInfo.mediaId,
						pathInfo.path,
						pathInfo.pathId
					);

					if (res.data.code === 0) {
						this.load_path(pathInfo.mediaId);
					}
				})
				.catch(() => {});
		},
		async scan_path(pathInfo: any) {
			const res = await scan_path(
				pathInfo.mediaId,
				pathInfo.path,
				pathInfo.pathId
			);

			if (res.data.code === 0) {
				this.load_path(pathInfo.mediaId);
			}
		},
		/**
		 * 添加路径信息到缓存
		 */
		async add_path_cache() {
			const path: any = this.pathCache;
			const mediaId = this.form.mediaId;
			if (!path) return;

			const res = await add_path(mediaId, path);

			if (res.data.code === 0) {
				this.pathCache = '';
				this.load_path(mediaId);
				this.pathCache = '';
			}
		},
	},

	// 生命周期
	created() {
		this.load_table();
	},
});
