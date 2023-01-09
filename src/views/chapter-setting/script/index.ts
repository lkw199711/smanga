import {defineComponent} from 'vue'
import {ElMessageBox} from 'element-plus'
import {Delete, Edit} from '@element-plus/icons-vue'
import {get_chapter, delete_chapter, update_chapter} from "@/api/chapter";
import tablePager from "@/components/table-pager.vue";

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
            count: 0,
            tableData: [],
            editChapterDialog: false,
            form: {
                chapterId: '',
                chapterName: '',
                chapterPath: '',
                chapterCover: '',
            },
            formInit: {
                chapterId: '',
                chapterName: '',
                chapterPath: '',
                chapterCover: '',
            },
        }
    },

    // 传值
    props: [],

    // 引用
    computed: {},

    // 组件
    components: {tablePager},

    // 方法
    methods: {
        /***
         * 关闭弹窗
         */
        dialog_close() {
            this.editChapterDialog = false;
        },
        /**
         * 开启弹窗
         */
        dialog_open() {
            Object.assign(this.form, this.formInit);

            this.editChapterDialog = true;

        },

        /**
         * 加载表格数据
         */
        async load_table(page = 1, pageSize=10) {
            const start = (page - 1) * pageSize;
            const res = await get_chapter(0, start, pageSize);
            this.count = Number(res.data.count);
            this.tableData = res.data.list;
        },
        /**
         * 重载数据 页码不变
         */
        reload_table(){
            (this.$refs as any).pager.reload_page();
        },
        /**
         * 编辑漫画
         * @param index
         * @param row
         */
        edit_chapter(index: number, row: any) {
            this.dialog_open();
            Object.assign(this.form, row);
        },

        /**
         * 执行修改请求
         */
        async update_chapter() {
            const res = await update_chapter(this.form);
            if (res.data.code === 0) {
                this.editChapterDialog = false;
                this.reload_table();
            }
        },

        /**
         * 删除漫画
         * */
        async delete_chapter(index: number, row: any) {
            ElMessageBox.confirm('确认删除此章节?', '确认删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await delete_chapter(row.chapterId);

                if (res.data.code === 0) {
                    this.reload_table();
                }
            }).catch(() => {
            })
        },
    },

    // 生命周期
    created() {
        this.load_table();
    },
})
