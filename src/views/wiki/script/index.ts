import {defineComponent} from 'vue'
import operationCover from "../components/operation-cover.vue";

export default defineComponent({
    name: 'wiki',
    // 数据
    data() {
        return {
            version: '0.0.0',
        }
    },

    // 传值
    props: [],

    // 组件
    components: {operationCover},

    // 方法
    methods: {},

    // 生命周期
    created() {
        this.version = process.env.VUE_APP_VERSION;
    },
})
