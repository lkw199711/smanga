import {defineComponent} from 'vue'
import {get_poster} from "@/api";
import {get_chapter} from "@/api/chapter"
import store from "@/store";
import {global_get, global_set, global_set_json} from "@/utils";
import chapter from "@/components/chapter.vue";
import mediaPager from "@/components/media-pager.vue";

export default defineComponent({
    name: 'chapter-list',
    // 数据
    data() {
        return {
            count: 0,
            list: [],
            keyWord: '',
        }
    },

    // 传值
    props: [],

    // 组件
    components: {chapter, mediaPager},

    // 计算
    computed: {
        mangaId(): number {
            return Number(this.$route.query.mangaId || global_get('mangaId'));
        },
        browseType(): string {
            return String(this.$route.params.browseType || global_get('browseType'));
        },
    },

    // 方法
    methods: {
        go_browse(item: any) {
            const chapterId = item.chapterId;
            const chapterName = item.chapterName;
            const chapterPath = item.chapterPath;
            const chapterType = item.chapterType;
            const chapterCover = item.chapterCover;

            // 缓存章节信息
            global_set('chapterId', chapterId);
            global_set('chapterName', chapterName);
            global_set('chapterPath', chapterPath);
            global_set('chapterType', chapterType);
            global_set('chapterCover', chapterCover);

            this.$router.push({
                name: this.browseType,
                query: {
                    name: chapterName,
                    path: chapterPath,
                },
                params: {page: 1},
            })
        },
        /**
         * 跳页
         * @param page
         * @param pageSize
         */
        async page_change(page = 1, pageSize = 12) {
            const start = (page - 1) * pageSize;
            const res = await get_chapter(this.mangaId, start, pageSize);
            this.list = res.data.list;
            this.count = res.data.count;

            // 为章节请求海报图片
            get_poster(this.list, 'chapterAwait');
        },
        /**
         * 获取全部漫画章节
         */
        async load_chapter() {
            const res = await get_chapter(this.mangaId);
            global_set_json('chapterList', res.data.list);
        },
    },

    // 生命周期
    async created() {
        // 缓存浏览方式
        const browseType = this.$route.params.browseType;
        if (browseType) global_set('browseType', browseType);

        store.commit('switch_await', {running: 'chapterAwait', bool: true});
        this.page_change();
        this.load_chapter();
    },
    beforeUnmount() {
        store.commit('switch_await', {running: 'chapterAwait', bool: false});
    },
})
