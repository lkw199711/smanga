import {defineComponent} from 'vue'
import chapter from "@/components/chapter.vue";
import {get_poster} from "@/api";
import store from "@/store";
import {get_bookmark} from "@/api/bookmark";
import {get_chapter} from "@/api/chapter";
import {global_set, global_set_json} from "@/utils";

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
    components: {chapter},

    // 计算
    computed: {},

    // 方法
    methods: {
        /**
         * 去往浏览界面
         */
        async go_browse(item:any) {
            const chapterId = item.chapterId;
            const chapterName = item.chapterName;
            const chapterPath = item.chapterPath;
            const chapterType = item.chapterType;
            const chapterCover = item.chapterCover;
            const mangaId = item.mangaId;
            const mangaCover = item.mangaCover;
            const page = item.page;
            const browseType = item.browseType;

            const chapterListRes = await get_chapter(mangaId);
            const chapterList = chapterListRes.data;

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
                    page
                }
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
