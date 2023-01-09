import {defineComponent} from 'vue'
import {get_poster} from "@/api";
import {get_chapter} from "@/api/chapter"
import store from "@/store";
import {global_get, global_set, global_set_json} from "@/utils";
import chapter from "@/components/chapter.vue";

export default defineComponent({
    name: 'chapter-list',
    // 数据
    data() {
        return {
            currentPage: 1,
            pageSize: 14,
            showPage: 5,
            list: [],
            cList: [],
            keyWord: '',
        }
    },

    // 传值
    props: [],

    // 组件
    components: {chapter},

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
         * @param index
         */
        page_change(index: number) {
            const list = this.list;
            const pageSize = this.pageSize;

            this.cList = list.slice((index - 1) * pageSize, index * pageSize);

            // 为章节请求海报图片
            get_poster(this.cList, 'chapterAwait');
        },
        /**
         * 搜索
         * @param key
         */
        search(key: string) {
            this.cList = this.list.filter((i: any) => {
                return new RegExp(key).test(i.name);
            });
        },
        /**
         * 搜索取消
         */
        cancel() {
            const list = this.list;
            const pageSize = this.pageSize;
            const currentPage = this.currentPage;

            this.keyWord = '';
            this.cList = list.slice((currentPage - 1) * pageSize, currentPage * pageSize);
        },
        /**
         * 获取漫画章节
         */
        async load_chapter() {
            const res = await get_chapter(this.mangaId, 0, 1000);

            this.list = res.data.list;

            // 缓存章节
            global_set_json('chapterList', this.list);
        },
    },

    // 生命周期
    async created() {
        // 缓存浏览方式
        const browseType = this.$route.params.browseType;
        if (browseType) global_set('browseType', browseType);

        store.commit('switch_await', {running: 'chapterAwait', bool: true});

        await this.load_chapter();

        // 裁切数组 第一页
        this.cList = this.list.slice(0, this.pageSize);

        // 为章节请求海报图片
        get_poster(this.cList, 'chapterAwait');

    },
    beforeUnmount() {
        store.commit('switch_await', {running: 'chapterAwait', bool: false});
    },
})
