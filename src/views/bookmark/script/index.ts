import {defineComponent} from 'vue'
import chapter from "@/components/chapter.vue";
import {get_poster} from "@/api";
import store, {config} from "@/store";
import {get_bookmark} from "@/api/bookmark";
import {get_chapter} from "@/api/chapter";
import {global_set, global_set_json} from "@/utils";
import MediaPager from "@/components/media-pager.vue";
import rightSidebar from "../components/right-sidebar.vue";

export default defineComponent({
    name: 'bookmark',
    // 数据
    data() {
        return {
            page: 1,
            count: 0,
            menuPoster: '',
            chapterInfo: {},
            list: [],
        }
    },

    // 传值
    props: [],

    // 组件
    components: {MediaPager, chapter, rightSidebar},

    // 计算
    computed: {},

    // 方法
    methods: {
        /**
         * 去往浏览界面
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
            const removeFirst = item.removeFirst;
            const direction = item.direction;
            let page = Number(item.page);

            if (browseType === 'double') {
                page = Math.ceil((page + 1) / 2);
            }

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
            global_set('removeFirst', removeFirst);
            global_set('direction', direction);

            // 不存储历史记录
            await this.$router.push({
                name: browseType,
                query: {
                    name: chapterName,
                    path: chapterPath,
                },
                params: {
                    page
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
            const res = await get_bookmark(start, pageSize);
            this.list = res.data.list;
            this.count = res.data.count;

            // 为章节请求海报图片
            get_poster(this.list, 'bookmarkAwait', 'pageImage');
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
        store.commit('switch_await', {running: 'bookmarkAwait', bool: true});

        this.page_change(1);
    },

    beforeUnmount() {
        store.commit('switch_await', {running: 'bookmarkAwait', bool: false});
    },
})
