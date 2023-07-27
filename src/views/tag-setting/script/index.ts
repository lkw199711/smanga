import {
	Delete,
	Edit,
	Upload,
	Plus,
	FolderOpened,
} from '@element-plus/icons-vue';
import {defineComponent} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {get_manga, update_manga, delete_manga} from '@/api/manga';
import tablePager from '@/components/table-pager.vue';
import i18n from '@/i18n';

const {t} = i18n.global;
export default defineComponent({
	name: 'index',
	setup() {
		return {
			Edit,
			Delete,
			Upload,
			Plus,
			FolderOpened,
		};
	},
	// 数据
	data() {
		return {
			count: 0,
			tableData: [],
			addTagDialog: false,
			editTagDialog: false,
			form: {
				mangaId: '',
				mangaName: '',
				mangaPath: '',
				mangaCover: '',
				browseType: '',
				removeFirst: '',
				direction: 0,
			},
			formInit: {
				mangaId: '',
				mangaName: '',
				mangaPath: '',
				mangaCover: '',
				browseType: 'flow',
				removeFirst: 0,
				direction: 1,
			},
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
		new_dialog(bool = true) {
			this.addTagDialog = bool;
		},
		/***
		 * 关闭弹窗
		 */
		dialog_close() {
			this.editTagDialog = false;
		},
		/**
		 * 开启弹窗
		 */
		dialog_open() {
			Object.assign(this.form, this.formInit);

			this.editTagDialog = true;
		},

		/**
		 * 加载表格数据
		 */
		async load_table(page = 1, pageSize = 10) {
			const res = await get_manga(0, page, pageSize);
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
		 * 编辑漫画
		 * @param index
		 * @param row
		 */
		edit_manga(index: number, row: any) {
			this.dialog_open();
			Object.assign(this.form, row);
		},

		/**
		 * 执行修改请求
		 */
		async update_manga() {
			// 表单校验-检查漫画名
			if (!this.form.mangaName) {
				ElMessage.warning(t('mangaManage.warning.name'));
				return false;
			}
			// 表单校验-检查漫路径
			if (!this.form.mangaPath) {
				ElMessage.warning(t('mangaManage.warning.path'));
				return false;
			}

			const res = await update_manga(this.form);

			if (res.data.code === 0) {
				this.editMangaDialog = false;
				this.reload_table();
			}
		},

		/**
		 * 删除漫画
		 * */
		async delete_manga(index: number, row: any) {
			ElMessageBox.confirm(
				t('mangaManage.confirm.text'),
				t('mangaManage.confirm.title'),
				{
					type: 'warning',
				}
			)
				.then(async () => {
					const res = await delete_manga(row.mangaId);

					if (res.data.code === 0) {
						this.reload_table();
					}
				})
				.catch(() => {});
		},
	},

	// 生命周期
	created() {
		this.load_table();
	},
});
