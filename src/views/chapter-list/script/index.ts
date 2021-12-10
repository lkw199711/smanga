import {defineComponent} from 'vue'
import {ajax, get_img} from "@/serve";
import mangaChapterItem from '../components/manga-chapter-item.vue';
import {array_sort_name, get_poster} from "@/api";
import store from "@/store";

export default defineComponent({
    name: 'chapter-list',
    // 数据
    data() {
        return {
            manga: '' as any,
            list: [] as any[],
        }
    },

    // 传值
    props: [],

    // 组件
    components: {mangaChapterItem},

    // 方法
    methods: {},

    // 生命周期
    created() {
        const manga = this.manga = this.$route.query.manga;

        ajax.post("php/get-chapter-list.php", {chapterPath: manga}).then(res => {
            const data = res.data;

            // 赋值到this 生成组件
            this.list = data;

            // 为章节请求海报图片
            get_poster(this.list, 'chapterAwait');
        });
    },
    beforeUnmount() {
        store.commit('switch_await', {running: 'chapterAwait', bool: false});
    },
})