import {Delete, Edit, Upload, Plus, FolderOpened} from '@element-plus/icons'
import {defineComponent} from 'vue'
import {
    add_media,
    add_path,
    delete_media,
    get_media,
    get_path,
    delete_path,
    rescan_path,
    update_media
} from "@/api/media";
import {ElMessage, ElMessageBox} from 'element-plus'

export default defineComponent({
    name: 'media-setting-index',
    setup() {
        return {
            Edit,
            Delete,
            Plus,
            Upload,
            FolderOpened
        }
    },
    // 数据
    data() {
        return {
            tableData: [],
            addMediaDialog: false,
            addPathDialog: false,
            editMediaDialog: false,
            form: {
                mediaName: '',
                mediaType: '0',
                fileType: '0',
                mediaPath: '',
                directoryFormat: '0'
            } as any,
            formInit: {
                mediaName: '',
                mediaType: '0',
                fileType: '0',
                mediaPath: '',
                directoryFormat: '0'
            },
            pathCache: '',
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

            this.load_path(row.mediaId)
        },
        /**
         * 加载路径列表
         */
        async load_path(mediaId: any) {
            const res = await get_path(mediaId);

            if (res.data) {
                this.pathArr = res.data;
            } else {
                this.pathArr = [];
            }
        },
        /**
         * 加载表格数据
         */
        async load_table() {
            const res = await get_media();
            this.tableData = res.data;
        },
        /**
         * 新增媒体库
         * @returns {Promise<void>}
         */
        async do_add_media() {
            // 表单验证
            if (!this.form.mediaName) {
                ElMessage({
                    message: '媒体库名称不能为空!',
                    type: 'warning'
                })

                return false;
            }

            const res = await add_media(this.form);
            if (res.data.code === 0) {
                this.dialog_close();
                this.load_table();
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
                    message: '媒体库名称不能为空!',
                    type: 'warning'
                })

                return false;
            }

            const res = await update_media(this.form);

            if (res.data.code === 0) {
                this.editMediaDialog = false;
                this.load_table();
            }
        },

        /**
         * 删除媒体库
         * */
        async do_delete_media(index: any, row: any) {
            ElMessageBox.confirm('确认删除此媒体库?', '确认删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await delete_media(row.mediaId);

                if (res.data.code === 0) {
                    this.load_table();
                }
            })

        },
        /**
         * 删除路径
         * */
        async delete_path(pathInfo: any) {
            ElMessageBox.confirm(
                `确认删除此路径? 与之关联的漫画和章节都会被清除!`,
                '确认删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                // console.log(pathInfo);
                const res = await delete_path(pathInfo.pathId);

                if (res.data.code === 0) {
                    this.load_path(pathInfo.mediaId);
                }
            })
        },
        /**
         * 重新扫面路径
         * @param pathInfo
         */
        async scan_path(pathInfo: any) {
            ElMessageBox.confirm(
                `确认删除此路径? 将清除与之相关的漫画与章节并重新扫描添加!`,
                '确认重新扫描', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {

                const res = await rescan_path(pathInfo.mediaId, pathInfo.path, pathInfo.pathId);

                if (res.data.code === 0) {
                    this.load_path(pathInfo.mediaId);
                }
            })
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
        }
    },

    // 生命周期
    created() {
        this.load_table();
    },
})
