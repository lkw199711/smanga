import mangaListItem from '../components/manga-list-item.vue'

export default {
    name: 'index',
    // 数据
    data() {
        return {
            arr:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
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
    },
}