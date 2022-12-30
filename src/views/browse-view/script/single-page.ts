import {defineComponent} from 'vue'
import {get_image_blob} from "@/api";
import {global_get, global_get_array, global_set} from "@/utils";
import {ElMessage as msg} from "element-plus";
import {config} from '@/store';
import {add_history} from "@/api/history";
import operationCover from "@/components/operation-cover.vue";
import chapterListMenu from "../components/chapter-list-menu.vue";
import {get_chapter_images} from "@/api/browse";

export default defineComponent({
    name: 'single-page',

    // 数据
    data() {
        return {
            // 当前页码
            page: 1,
            pageSize: 1,
            // 分页器设置
            small: false,
            disabled: false,
            background: true,
            //图片路径 blob
            imgSrc: '',

            // 图片路径列表
            imgPathList: [] as string[],
            // 是否正在加载图片 (单页模式加载动画待制作)
            loading: false,
        }
    },

    // 传值
    props: [],

    // 组件
    components: {operationCover, chapterListMenu},

    computed: {
        browseFooter() {
            return config.browseFooter;
        },
        path() {
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
        total() {
            return this.imgPathList.length;
        },
    },

    // 方法
    methods: {
        /**
         * 页码变更
         * @param page
         */
        async handleCurrentChange(page: number) {
            const res: any = await get_image_blob(this.imgPathList[page - 1]);
            this.page = page;
            this.imgSrc = res.data;
        },

        /**
         * 上一页
         */
        beforePage() {
            this.handleCurrentChange(--this.page);
        },

        /**
         * 下一页
         */
        nextPage() {
            this.handleCurrentChange(++this.page);
        },

        /**
         * 重载页面
         */
        async reload_page(page = 1) {
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

            // 加载图片列表
            const res = await get_chapter_images(this.path);
            this.imgPathList = res.data;

            // 开始加载图片
            this.handleCurrentChange(page);
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
        },

        /**
         * 更新阅读缓存
         */
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
        },
        switch_footer() {
            config.browseFooter = !config.browseFooter;
        },
    },

    // 生命周期
    created() {
        // 设置浏览模式
        config.browseType = 'single';
        // 加载页面
        this.reload_page();
    },
})
