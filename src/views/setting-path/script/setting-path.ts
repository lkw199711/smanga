import {defineComponent, ref} from 'vue'
import {ajax} from "@/serve";
import previewListItem from "../components/preview-list-item.vue";
import {get_poster} from "@/api";
import store from "@/store";
import { ElMessage } from 'element-plus'

export default defineComponent({
    name: 'setting-path',
    // 数据
    data() {
        return {
            input: ref(''),
            previewList: [] as any[],
            routeList: [] as any[],
        }
    },

    // 传值
    props: [],

    // 组件
    components: {previewListItem},

    // 方法
    methods: {
        add() {
            ajax.post('php/get-manga-route.php', {newPath: this.input}).then(res => {
                if (!res.data) return;

                const data = res.data;

                if (!Array.isArray(data)){
                    ElMessage({
                        message: data,
                        type: 'warning',
                    })
                    return;
                }

                ElMessage({
                    message: '添加成功!',
                    type: 'success',
                })

                this.routeList = data;
                // 重置预览视图
                this.previewList = [];

            })
        },
        preview() {
            ajax.post("php/get-manga-list.php", {mangaPath: this.input}).then(res => {
                const data = res.data;

                if (!Array.isArray(data)){
                    ElMessage({
                        message: data,
                        type: 'warning',
                    })
                    return;
                }

                // 赋值到this 生成组件
                this.previewList = data;

                // 为章节请求海报图片
                get_poster(this.previewList, 'previewAwait');
            });
        },

        remove(delPath:string){
            ajax.post('php/delete-manga-path.php',{delPath}).then(res=>{
                if (!res.data) return;

                const data = res.data;

                if (!Array.isArray(data)){
                    ElMessage({
                        message: data,
                        type: 'warning',
                    })

                    return;
                }


                ElMessage({
                    message: '删除成功!',
                    type: 'success',
                })

                this.routeList = data;
            })
        },

        load_route(){
            ajax.post('php/get-manga-route.php', {newPath: this.input}).then(res => {
                if (!res.data) return;

                this.routeList = res.data;
            })
        },
    },

    // 生命周期
    created() {
        store.commit('switch_await', {running: 'previewAwait', bool: true});

        this.load_route();
    },

    beforeUnmount() {
        store.commit('switch_await', {running: 'previewAwait', bool: false});
    },
})