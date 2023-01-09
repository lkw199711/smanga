import {defineComponent} from 'vue'
import {get_poster} from "@/api";
import {get_manga} from "@/api/manga"
import store from "@/store";
import {global_get} from "@/utils";
import manga from "@/components/manga.vue";

export default defineComponent({
    name: 'manga-list',
    // 数据
    data() {
        return {
            currentPage: 1,
            pageSize: 10,
            list: [],
            cList: [],
            keyWord: '',
        }
    },

    // 传值
    props: [],

    // 组件
    components: {manga},

    // 计算
    computed: {
        mediaId() {
            return Number(this.$route.query.mediaId || global_get('mediaId'));
        }
    },

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

            // 为漫画请求海报图片
            get_poster(this.cList, 'mangaAwait');
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
         * 获取漫画列表
         */
        async load_manga() {

            const res = await get_manga(this.mediaId, 0, 1000);

            this.list = res.data.list;
        },
    },

    // 生命周期
    async created() {
        store.commit('switch_await', {running: 'mangaAwait', bool: true});

        await this.load_manga();

        // 裁切数组 第一页
        this.cList = this.list.slice(0, this.pageSize);

        // 为漫画请求海报图片
        get_poster(this.cList, 'mangaAwait');
    },

    beforeUnmount() {
        store.commit('switch_await', {running: 'mangaAwait', bool: false});
    },

})
