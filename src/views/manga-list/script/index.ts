import {defineComponent,ref} from 'vue'
import mangaListItem from '../components/manga-list-item.vue'
import {ajax} from "@/serve";
import {get_poster} from "@/api";
import store from "@/store";

export default defineComponent({
    name: 'manga-list',
    // 数据
    data() {
        return {
            currentPage: 1,
            pageSize: 10,
            list: [],
            cList: []
        }
    },

    // 传值
    props: [],

    // 组件
    components: {mangaListItem},

    // 方法
    methods: {
        page_change(index: number) {
            const list = this.list;
            const pageSize = this.pageSize;

            this.cList = list.slice((index - 1) * pageSize, index * pageSize);
        },
    },

    // 生命周期
    created() {
        store.commit('switch_await', {running: 'mangaAwait', bool: true});

        ajax.post('php/get-all-manga.php').then(res => {
            this.list = res.data;

            // 为漫画请求海报图片
            get_poster(this.list, 'mangaAwait');

            // 裁切数组 第一页
            this.cList = this.list.slice(0,this.pageSize);
        })
    },
    beforeUnmount() {
        store.commit('switch_await', {running: 'mangaAwait', bool: false});
    },

})