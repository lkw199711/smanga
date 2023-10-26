import {Delete, Edit} from '@element-plus/icons-vue';
import {defineComponent} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import mangaApi from '@/api/manga';
import tablePager from '@/components/table-pager.vue';
import i18n from '@/i18n';
import {Search} from '@element-plus/icons-vue';

const {t} = i18n.global;
export default defineComponent({
	name: 'index',
	setup() {
		return {
			Edit,
			Delete,
			Search,
		};
	},
	// 数据
	data() {
		return {
			count: 0,
			tableData: [],
			editMangaDialog: false,
			keyWord: '',
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
		/***
		 * 关闭弹窗
		 */
		dialog_close() {
			this.editMangaDialog = false;
		},
		/**
		 * 开启弹窗
		 */
		dialog_open() {
			Object.assign(this.form, this.formInit);

			this.editMangaDialog = true;
		},

		/**
		 * 加载表格数据
		 */
		async load_table(page = 1, pageSize = 10) {	
			const res = await mangaApi.get(0, page, pageSize, '', this.keyWord);
			this.count = res.count;
			this.tableData = res.list;
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

			const res = await mangaApi.update_manga(this.form);

			if (res.code === 0) {
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
					const res = await mangaApi.delete_manga(row.mangaId);

					if (res.code === 0) {
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
