import { defineComponent } from 'vue'
import mangaListItem from '../components/manga-list-item.vue'
import {ajax} from "@/serve";

export default defineComponent({
    name: 'index',
    // 数据
    data() {
        return {
            list: [],
        }
    },

    // 传值
    props: [],

    // 组件
    components: {mangaListItem},

    // 方法
    methods: {},

    // 生命周期
    created() {
        ajax('php/manga.php').then(res => {
            console.log(res);
            this.list = res.data
        })
    },
})