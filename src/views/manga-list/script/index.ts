import {defineComponent} from 'vue'
import {get_poster} from "@/api";
import {get_manga} from "@/api/manga"
import store, {config} from "@/store";
import {global_get} from "@/utils";
import manga from "@/components/manga.vue";
import mediaPager from "@/components/media-pager.vue";
import {mediaPageSize} from "@/store/page-size";

export default defineComponent({
    name: 'manga-list',
    // 数据
    data() {
        return {
            count: 0,
            list: [],
        }
    },

    // 传值
    props: [],

    // 组件
    components: {manga, mediaPager},

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
         * @param page
         * @param pageSize
         */
        async page_change(page = 1, pageSize = 12) {
            const start = (page - 1) * pageSize;
            const res = await get_manga(this.mediaId, start, pageSize);
            this.list = res.data.list;
            this.count = res.data.count;

            // 为漫画请求海报图片
            get_poster(this.list, 'mangaAwait');
        },
    },

    // 生命周期
    async created() {
        store.commit('switch_await', {running: 'mangaAwait', bool: true});
        const screenType = config.screenType;
        // @ts-ignore
        const pageSize = mediaPageSize[screenType];
        this.page_change(1, pageSize);
    },

    beforeUnmount() {
        store.commit('switch_await', {running: 'mangaAwait', bool: false});
    },

})
