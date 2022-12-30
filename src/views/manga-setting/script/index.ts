import {Delete, Edit} from '@element-plus/icons'
import {defineComponent} from 'vue'
import {ElMessageBox} from 'element-plus'
import {get_manga, update_manga, delete_manga} from "@/api/manga";

export default defineComponent({
    name: 'index',
    setup() {
        return {
            Edit,
            Delete,
        }
    },
    // 数据
    data() {
        return {
            tableData: [],
            editMangaDialog: false,
            form: {
                mangaId: '',
                mangaName: '',
                mangaPath: '',
                mangaCover: '',
            },
            formInit: {
                mangaId: '',
                mangaName: '',
                mangaPath: '',
                mangaCover: '',
            },
        }
    },

    // 传值
    props: [],

    // 引用
    computed: {},

    // 组件
    components: {},

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
        async load_table() {
            const res = await get_manga(0);
            this.tableData = res.data;
        },

        /**
         * 编辑漫画
         * @param index
         * @param row
         */
        edit_manga(index: number, row: any) {
            this.dialog_open();
            Object.assign(this.form, row);
            console.log(this.form);
        },

        /**
         * 执行修改请求
         */
        async update_manga() {
            const res = await update_manga(this.form);
            if (res.data.code === 0) {
                this.editMangaDialog = false;
                this.load_table();
            }
        },

        /**
         * 删除漫画
         * */
        async delete_manga(index: number, row: any) {
            ElMessageBox.confirm('确认删除此漫画?', '确认删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await delete_manga(row.mangaId);

                if (res.data.code === 0) {
                    this.load_table();
                }
            })
        },
    },

    // 生命周期
    created() {
        this.load_table();
    },
})
