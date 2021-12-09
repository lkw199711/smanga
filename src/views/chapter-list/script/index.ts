import {defineComponent} from 'vue'
import {ajax} from "@/serve";
import mangaChapterItem from '../components/manga-chapter-item.vue';

export default defineComponent({
    name: 'index',
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


        ajax.post("php/get-chapter-list.php", {chapterPath:manga}).then(r => {
            const data = r.data;

            data.sort((a: any, b: any) => {
                const valueA: any = a.name.match(/\d+(?=\b)/);
                const valueB: any = b.name.match(/\d+(?=\b)/);

                return valueA - valueB;
            })

            this.list.push(data[0]);
        });
    },
})