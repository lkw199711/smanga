import {defineComponent} from 'vue'
import {ajax} from "@/serve";
import mangaChapterItem from '../components/manga-chapter-item.vue';
import {get_poster} from "@/api";
import store from "@/store";

export default defineComponent({
    name: 'chapter-list',
    // 数据
    data() {
        return {
            currentPage: 1,
            pageSize: 14,
            showPage: 5,
            manga: '' as any,
            list: [],
            cList: [],
            keyWord: '',
        }
    },

    // 传值
    props: [],

    // 组件
    components: {mangaChapterItem},

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
        },
        /**
         * 搜索
         * @param key
         */
        search(key:string) {
            this.cList = this.list.filter((i:any)=>{
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
            this.cList = list.slice((currentPage-1)*pageSize, currentPage*pageSize);
        },
    },

    // 生命周期
    created() {
        const manga = this.manga = this.$route.query.manga;

        store.commit('switch_await', {running: 'chapterAwait', bool: true});

        ajax.post("php/get-chapter-list.php", {chapterPath: manga}).then(res => {
            const data = res.data;

            // 赋值到this 生成组件
            this.list = data;

            // 为章节请求海报图片
            get_poster(this.list, 'chapterAwait');

            // 裁切数组 第一页
            this.cList = this.list.slice(0,this.pageSize);
        });
    },
    beforeUnmount() {
        store.commit('switch_await', {running: 'chapterAwait', bool: false});
    },
})