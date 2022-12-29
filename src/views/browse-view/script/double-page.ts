import {defineComponent} from 'vue'
import {get_img, ajax, get_img_src} from "@/serve";
import {global_get, global_get_array, global_set, window_go_top} from "@/utils";
import {ElMessage as msg} from "element-plus";
import store, {config, globalData} from '@/store';
import {add_history} from "@/serve/history";
import operationCover from "@/components/operation-cover.vue";
import chapterListMenu from "../components/chapter-list-menu.vue";

export default defineComponent({
    name: 'double-page',

    // 数据
    data() {
        return {
            // 漫画名
            manga: '',
            // 章节名
            chapter: '' as any,

            currentPage: 1,
            pageSize: 1,
            small: false,
            disabled: false,
            background: true,
            imgSrc1: '',
            imgSrc2: '',

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


            // 弹出层
            popup: {
                menu: false,
            } as Popup
        }
    },

    // 传值
    props: [],

    // 组件
    components: {operationCover,chapterListMenu},

    computed: {
        path() {
            return this.$route.query.path;
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
        total() {
            return this.imgPathList.length;
        },
        browseFooter() {
            return config.browseFooter
        },
    },

    // 方法
    methods: {
        handleSizeChange(page: number) {
        },
        async handleCurrentChange(page: number) {
            const index = (page - 1) * 2;

            // 加载第一张图片
            const res1: any = await get_img_src({
                data: {file: this.imgPathList[index]}
            })
            this.imgSrc1 = res1.data;

            // 加载第二张图片
            if (index + 1 < this.imgPathList.length) {
                const res2: any = await get_img_src({
                    data: {file: this.imgPathList[index + 1]}
                })
                this.imgSrc2 = res2.data;
            }

            this.currentPage = page;
        },

        beforePage() {
            this.handleCurrentChange(--this.currentPage);
        },
        nextPage() {
            this.handleCurrentChange(++this.currentPage);
        },

        /**
         * 重载页面
         */
        reload_page(page = 1) {
            add_history({
                userId: this.$cookies.get('userId'),
                mediaId: global_get('mediaId'),
                mangaId: global_get('mangaId'),
                mangaName: global_get('mangaName'),
                chapterId: global_get('chapterId'),
                chapterName: global_get('chapterName'),
                chapterPath: global_get('chapterPath'),
                chapterCover: global_get('chapterCover'),
            });

            // 重置滚动条
            window_go_top();

            ajax.post("php/get-image-list.php", {imagePath: this.path})
                .then(r => {

                    // 获取数据
                    const data = r.data;

                    // 加入数据渲染页面
                    this.imgPathList = data;
                })
                .then(r => {
                    // 开始加载图片
                    this.handleCurrentChange(page);
                })
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
                path: this.$route.path,
                query: {
                    name: this.chapterList[this.index - 1].chapterName,
                    path: this.chapterList[this.index - 1].chapterPath,
                }
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
                path: this.$route.path,
                query: {
                    name: this.chapterList[this.index + 1].chapterName,
                    path: this.chapterList[this.index + 1].chapterPath,
                }
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
                path: this.$route.path,
                query: {
                    name: this.chapterList[index].chapterName,
                    path: this.chapterList[index].chapterPath,
                }
            })

            this.update_chapter_info();

            // 重载页面
            this.reload_page();

            this.open_popup('menu', false);
        },

        update_chapter_info() {
            const chapterInfo = this.chapterInfo;
            global_set('chapterId', chapterInfo.chapterId);
            global_set('chapterName', chapterInfo.chapterName);
            global_set('chapterPath', chapterInfo.chapterPath);
            global_set('chapterCover', chapterInfo.chapterCover);
        },

        /**
         * 弹出层开关操作
         * @param name
         * @param bool
         */
        open_popup(name: string, bool: any = true) {
            this.popup[name] = bool;
        },

        // 阅读状态控制
        switch_menu() {
            config.browseTop = !config.browseTop;
        },
        switch_footer() {
            config.browseFooter = !config.browseFooter;
        },
    },

    // 生命周期
    created() {
        // 设置浏览模式
        config.browseType = 'double';
        // 加载页面
        this.reload_page();
    },
})
