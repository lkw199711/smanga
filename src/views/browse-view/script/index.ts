import {defineComponent} from 'vue'
import {get_image_blob} from "@/api";
import {global_get_array, global_set, window_go_top} from "@/utils";
import {ElMessage as msg} from "element-plus";
import {config} from '@/store';
import {add_history} from "@/api/history";
import chapterListMenu from "../components/chapter-list-menu.vue";
import {get_chapter_images} from "@/api/browse";

export default defineComponent({
    name: 'browse-views',

    // 数据
    data() {
        return {
            // 图片文件列表
            imgFileList: [] as string[],
            // 图片路径列表
            imgPathList: [] as string[],
            // 当前图片页码
            page: -1,
            // 初始加载页码数量
            initPage: 3,
            // 是否正在加载图片
            loading: false,
            // 是否正在重载页面
            refreshing: false,
            // 是否加载完全部图片
            finished: false,
        }
    },

    // 传值
    props: [],

    // 组件
    components: {chapterListMenu},

    computed: {
        path(): string {
            return this.$route.query.path as string;
        },
        name() {
            return this.$route.query.name;
        },
        // 章节列表
        chapterList() {
            return global_get_array('chapterList');
        },
        chapterInfo() {
            return this.chapterList[this.index];
        },
        // 章节的坐标索引
        index() {
            const chapterList = this.chapterList;

            for (let i = 0; i < chapterList.length; i++) {
                if (this.name === chapterList[i].chapterName) {
                    //缓存章节坐标
                    global_set('chapterIndex', i);
                    return i;
                }
            }

            return -1;
        },
        // 导航及按钮展示开关
        browseTop() {
            return config.browseTop;
        },
    },

    // 方法
    methods: {
        /**
         * 加载图片
         */
        async load_img() {
            const list = this.imgPathList;
            const initPage = this.initPage - 1;

            if (this.loading) return;

            // 开启加载状态
            this.loading = true;

            // 无数据 退出
            if (!list.length) return false;

            // 页码递增
            const page = ++this.page;

            const res = await get_image_blob(list[page]);
            this.imgFileList.push(res.data);
            // 加载结束,更新状态
            this.loading = false;
            this.refreshing = false;
            // 是否加载完全部
            this.finished = this.page === this.imgPathList.length - 1;
            // 是否完成页面初始化加载,未完成则再次加载图片
            page < initPage && await this.load_img();
        },

        refresh_page() {
            // 重置图片数据
            this.imgFileList = [];
            this.page = -1;

            // 开始加载图片
            this.load_img();
        },

        /**
         * 重载页面
         */
        async reload_page(addHistory = true) {
            // 重置图片数据
            this.imgFileList = [];
            this.page = -1;

            if (addHistory) {
                add_history();
            }

            // 重置滚动条
            window_go_top();

            const res = await get_chapter_images();

            switch (res.data.status) {
                case 'uncompressed':
                    setTimeout(() => {
                        this.reload_page(false)
                    }, 2000);
                    break;
                case 'compressing':
                    this.imgPathList = res.data.list;
                    this.load_img();
                    setTimeout(() => {
                        this.reload_page(false)
                    }, 2000);
                    break;
                case 'compressed':
                    this.imgPathList = res.data.list;
                    this.load_img();
                    break;
                default:
                    this.imgPathList = res.data.list;
                    this.load_img();
            }
        },
        /**
         * 上一页
         * */
        async before() {

            if (this.index == 0) {
                msg('已经到了第一章');
                return false;
            }

            if (!this.index) return;

            await this.$router.push({
                name: this.$route.name as string,
                query: Object.assign({}, this.$route.query, {
                    name: this.chapterList[this.index - 1].chapterName,
                    path: this.chapterList[this.index - 1].chapterPath,
                }),
                params: {page: 1},
            })

            this.update_chapter_info();

            /**
             * 刷新页面
             * 自定义重载方法没有重置滚动条,导致vant list不断触发触底事件
             * 因此暂时采用刷新页面的方式解决
             */
            this.reload_page();

        },
        /**
         * 下一页
         * */
        async next() {
            if (this.index == this.chapterList.length - 1) {
                msg('已经到了最后一章');
                return false;
            }

            await this.$router.push({
                name: this.$route.name as string,
                query: Object.assign({}, this.$route.query, {
                    name: this.chapterList[this.index + 1].chapterName,
                    path: this.chapterList[this.index + 1].chapterPath,
                }),
                params: {page: 1},
            })

            this.update_chapter_info();

            // 刷新页面
            this.reload_page();

        },
        /**
         * 选择章节
         * @param index
         */
        async change_chapter(index: any) {

            await this.$router.push({
                name: this.$route.name as string,
                query: Object.assign({}, this.$route.query, {
                    name: this.chapterList[index].chapterName,
                    path: this.chapterList[index].chapterPath,
                })
            })

            this.update_chapter_info();

            // 重载页面
            this.reload_page();
        },

        update_chapter_info() {
            const chapterInfo = this.chapterInfo;
            global_set('chapterId', chapterInfo.chapterId);
            global_set('chapterName', chapterInfo.chapterName);
            global_set('chapterPath', chapterInfo.chapterPath);
            global_set('chapterCover', chapterInfo.chapterCover);
        },

        // 阅读状态控制
        switch_menu() {
            config.browseTop = !config.browseTop;
        }
    },

    // 生命周期
    created() {
        // 设置浏览模式
        config.browseType = 'flow';

        // 加载页面
        const notAddHistory = this.$route.params.notAddHistory || false;
        this.reload_page(!notAddHistory);
    },
})
