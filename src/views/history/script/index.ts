import {defineComponent} from 'vue'
import chapter from "@/components/chapter.vue";
import {get_poster} from "@/api";
import store, {config} from "@/store";
import {global_set, global_set_json} from "@/utils";
import {get_history} from "@/api/history";
import {get_chapter} from "@/api/chapter";
import MediaPager from "@/components/media-pager.vue";
import RightSidebar from "../components/right-sidebar.vue";

export default defineComponent({
    name: 'history',
    // 数据
    data() {
        return {
            page: 1,
            list: [],
            count: 0,
            menuPoster: '',
            chapterInfo: {},
        }
    },

    // 传值
    props: [],

    // 组件
    components: {RightSidebar, MediaPager, chapter},

    // 计算
    computed: {},

    // 方法
    methods: {
        /**
         * 跳转浏览页面
         * @param item
         */
        async go_browse(item: any) {
            const chapterId = item.chapterId;
            const chapterName = item.chapterName;
            const chapterPath = item.chapterPath;
            const chapterType = item.chapterType;
            const chapterCover = item.chapterCover;
            const mangaId = item.mangaId;
            const mangaCover = item.mangaCover;
            const browseType = item.browseType;

            const chapterListRes = await get_chapter(mangaId);
            const chapterList = chapterListRes.data.list;

            // 缓存章节信息
            global_set('mangaId', mangaId);
            global_set('mangaCover', mangaCover);
            global_set('chapterId', chapterId);
            global_set('chapterName', chapterName);
            global_set('chapterPath', chapterPath);
            global_set('chapterType', chapterType);
            global_set('browseType', browseType);
            global_set('chapterCover', chapterCover);
            global_set_json('chapterList', chapterList);

            // 不存储历史记录
            await this.$router.push({
                name: browseType,
                query: {
                    name: chapterName,
                    path: chapterPath,
                },
                params: {
                    notAddHistory: 1,
                    page: 1,
                }
            })
        },
        /**
         * 跳页
         * @param page
         * @param pageSize
         */
        async page_change(page = 0, pageSize = 12) {
            if (page) {
                this.page = page;
            } else {
                page = this.page;
            }

            const start = (page - 1) * pageSize;
            const res = await get_history(start, pageSize);

            this.list = res.data.list;
            this.count = res.data.count;

            // 为章节请求海报图片
            get_poster(this.list, 'chapterAwait', 'chapterCover');
        },
        /**
         * 打开右侧菜单
         */
        context_menu(info: any, key: number) {
            this.menuPoster = (this.list[key] as any).blob;
            this.chapterInfo = info;
            config.rightSidebar = true;
        },
    },

    // 生命周期
    async created() {
        store.commit('switch_await', {running: 'chapterAwait', bool: true});
        this.page_change();
    },

    beforeUnmount() {
        store.commit('switch_await', {running: 'chapterAwait', bool: false});
    },
})
