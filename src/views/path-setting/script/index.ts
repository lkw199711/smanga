import {Delete, Edit, Search, Share, Upload, Plus} from '@element-plus/icons'
import {defineComponent} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {get_manga, update_manga, delete_manga} from "@/serve/manga";
import {delete_path, get_path} from "@/serve/path";
import {rescan_path} from "@/serve/media";

export default defineComponent({
    name: 'index',
    setup() {
        return {
            Edit,
            Share,
            Search,
            Plus
        }
    },
    // 数据
    data() {
        return {
            tableData: [],
            pathArr: [] as any[],
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

        /**
         * 加载表格数据
         */
        async load_table() {
            const res = await get_path(0);
            this.tableData = res.data;
        },

        /**
         * 删除漫画
         * */
        async delete_path(index: any, row: any) {
            ElMessageBox.confirm(
                '确认删除此路径? 与之关联的漫画和章节都会被清除!', '确认删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await delete_path(row.pathId);

                if (res.data.code === 0) {
                    this.load_table();
                }
            })
        },

        /**
         * 重新扫描路径
         * @param index
         * @param row
         */
        async scan_path(index: any, row: any){
            ElMessageBox.confirm(
                `确认删除此路径? 将清除与之相关的漫画与章节并重新扫描添加!`,
                '确认重新扫描', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {

                const res = await rescan_path(row.mediaId, row.path, row.pathId);

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
