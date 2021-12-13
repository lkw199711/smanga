import {defineComponent} from 'vue'
import {get_img, ajax} from "../../../serve";
import {window_go_top} from "@/utils";
import {ElMessage as msg} from "element-plus";
import {array_sort} from "@/api";
import store from '../../../store';

export default defineComponent({
    name: 'browse-views',

    // 数据
    data() {
        return {
            // 漫画名
            manga: '',
            // 章节名
            chapter: '' as any,
            // 章节列表
            menu: [] as string[],
            // 章节的坐标索引
            index: 0,

            // 图片文件列表
            imgFileList: [] as string[],
            // 图片路径列表
            imgPathList: [] as string[],
            // 当前图片页码
            page: -1,
            // 初始加载页码数量
            initPage: 3,
            // 是否正在加载图片
            loading: false,
            // 是否正在重载页面
            refreshing: false,
            // 是否加载完全部图片
            finished: false,

            // 弹出层
            popup: {
                menu: false,
            } as Popup
        }
    },

    // 传值
    props: [],

    // 组件
    components: {},

    // 方法
    methods: {
        /**
         * 加载图片
         */
        load_img() {
            const manga = this.manga;
            const chapter = this.chapter;
            const list = this.imgPathList;
            const initPage = this.initPage - 1;

            // 开启加载状态
            this.loading = true;

            // 无数据 退出
            if (!list.length) return false;

            // 页码递增
            const page = ++this.page;

            // 使用axios请求上传接口
            get_img({
                params: {file: list[page]}
            }).then(res => {
                // 获取图片数据,转变为blob链接
                const blob = URL.createObjectURL(res.data);
                // 加入数组
                this.imgFileList.push(blob);
                // 加载结束,更新状态
                this.loading = false;
                this.refreshing = false;
                // 是否加载完全部
                this.finished = this.page === this.imgPathList.length - 1;
                // 是否完成页面初始化加载,未完成则再次加载图片
                page < initPage && this.load_img();
            }).catch(error => {
                --this.page;
                this.load_img();
            });
        },

        refresh_page() {
            // 重置图片数据
            this.imgFileList = [];
            this.page = -1;

            // 开始加载图片
            this.load_img();
        },

        /**
         * 重载页面
         */
        reload_page() {
            // 重置图片数据
            this.imgFileList = [];
            this.page = -1;

            // 重置滚动条
            window_go_top();

            // 获取漫画名与章节
            const manga = this.manga;
            const chapter = this.chapter;

            ajax.post("php/get-image-list.php", {manga: manga + "/" + chapter})
                .then(r => {

                    // 获取数据
                    const data = r.data;

                    // 为图片排序
                    array_sort(data);

                    // 加入数据渲染页面
                    this.imgPathList = data;

                    // 开始加载图片
                    this.load_img();

                });
        },
        /**
         * 上一页
         * */
        before() {

            if (this.index == 0) {
                msg('已经到了第一章');
                return false;
            }

            // 更新缓存
            this.updata_cache(--this.index);

            /**
             * 刷新页面
             * 自定义重载方法没有重置滚动条,导致vant list不断触发触底事件
             * 因此暂时采用刷新页面的方式解决
             */
            this.reload_page();

        },
        /**
         * 下一页
         * */
        next() {
            if (this.index == this.menu.length - 1) {
                msg('已经到了最后一章');
                return false;
            }

            // 更新缓存
            this.updata_cache(++this.index);

            // 刷新页面
            this.reload_page();

        },
        /**
         * 选择章节
         * @param index
         */
        change_chapter(index: any) {
            // 更新缓存数据
            this.updata_cache(index)

            // 重载页面
            this.reload_page();

            this.open_popup('menu', false);
        },

        /**
         * 获取名称与章节
         * 通过缓存的方式记录现在的章节与漫画名称
         * 有传参则使用传参值，没有则调取缓存
         * @param name
         */
        get_manga_value(name: string) {
            let value: any = this.$route.query[name];

            //读取写入缓存
            if (value) {
                localStorage.setItem(name, value)
            } else {
                value = localStorage.getItem(name);
                if (name === 'menu') {
                    value = value.split(',')
                }
            }

            return value;
        },

        /**
         * 更新 漫画名 章节 章节坐标
         */
        updata_cache(index: any) {
            // 章节列表
            const menu = this.menu;
            this.index = index;

            // 设置章节索引
            localStorage.setItem('index', index);

            // 设置章节名称
            const chapter = this.chapter = menu[index];
            localStorage.setItem('chapter', chapter);
        },

        /**
         * 弹出层开关操作
         * @param name
         * @param bool
         */
        open_popup(name: string, bool: any = true) {
            this.popup[name] = bool;
        },

        // 阅读状态控制
        reading_state_update(bool = true) {
            // this.$store.commit('reading_state_update', bool);
        },
    },

    // 生命周期
    created() {
        const manga:any = this.manga = this.get_manga_value('manga');
        const chapter:any = this.chapter = this.$route.query.chapter;

        ajax.post("php/get-chapter-list.php", {chapterPath: manga}).then(r => {
            const data = r.data.map((i:any)=>{
                return i.name;
            });

            const menu = this.menu = data;
        }).then(()=>{
            const index:any = this.index = this.menu.indexOf(chapter);
            localStorage.setItem('index', index)

            // 加载页面
            this.reload_page();

            // 关闭菜单
            this.reading_state_update(true);
        })

    },
})