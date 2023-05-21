/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-03-17 20:18:31
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-05-16 01:23:07
 * @FilePath: \smanga\src\views\wiki\script\index.ts
 */
import {defineComponent} from 'vue'
import operationCover from "../components/operation-cover.vue";
import { get_version } from '@/api/version';

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

        get_version();
    },
})
