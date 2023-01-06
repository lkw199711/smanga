import {defineComponent} from 'vue'
import mangaChapterItem from '../components/manga-chapter-item.vue';
import {get_poster} from "@/api";
import store from "@/store";
import {get_bookmark} from "@/api/bookmark";

export default defineComponent({
    name: 'bookmark',
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
    components: {mangaChapterItem},

    // 计算
    computed: {},

    // 方法
    methods: {
        /**
         * 跳页
         * @param index
         */
        page_change(index: number) {
            const list = this.list;
            const pageSize = this.pageSize;

            this.cList = list.slice((index - 1) * pageSize, index * pageSize);

            // 为章节请求海报图片
            get_poster(this.cList, 'chapterAwait', 'chapterCover');
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
            const res = await get_bookmark();
            this.list = res.data.list;
        },
    },

    // 生命周期
    async created() {
        store.commit('switch_await', {running: 'chapterAwait', bool: true});

        await this.load_chapter();

        // 裁切数组 第一页
        this.cList = this.list.slice(0, this.pageSize);

        // 为章节请求海报图片
        get_poster(this.cList, 'chapterAwait', 'pageImage');

    },

    beforeUnmount() {
        store.commit('switch_await', {running: 'chapterAwait', bool: false});
    },
})
