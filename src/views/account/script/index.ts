import {defineComponent} from 'vue'
import {delete_account, get_account, register, update_account} from "@/serve/account";
import {Plus} from '@element-plus/icons'
import {ElMessage, ElMessageBox} from 'element-plus'

export default defineComponent({
    name: 'account-index',
    setup() {
        return {
            Plus
        }
    },
    // 数据
    data() {
        return {
            addDialog: false,
            dialogFormVisible: false,
            tableData: [],
            form: {
                userName: '',
                passWord: '',
            },
            formInit: {
                userName: '',
                passWord: '',
            },
            formLabelWidth: '120px'
        }
    },

    // 传值
    props: [],

    // 引用
    computed: {},

    // 组件
    components: {},

    // 方法
    methods: {
        /**
         * 关闭开关
         * @param name
         */
        close_switch(name: string) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this[name] = false;
        },
        /**
         * 开启开关
         * @param name
         */
        open_switch(name: string) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this[name] = true;
        },
        /**
         * 编辑用户
         * @param index
         * @param val
         */
        handleEdit(index: any, val: any) {
            this.dialogFormVisible = true;
            Object.assign(this.form, val);
            this.form.passWord = '';
        },
        /**
         * 删除用户
         * @param index
         * @param val
         * @returns {Promise<void>}
         */
        async handleDelete(index: any, val: any) {

            ElMessageBox.confirm('确认删除此用户?', '确认删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await delete_account(val.userId);

                if (res.data.code === 0) {
                    this.load_table();
                }
            })
        },
        /**
         * 加载表格
         * @returns {Promise<void>}
         */
        async load_table() {
            const res = await get_account();
            this.tableData = res.data;
        },
        /**
         * 更改用户请求
         * @returns {Promise<void>}
         */
        async do_update() {
            const res = await update_account(this.form);

            if (res.data.code === 0) {
                this.load_table();
                this.dialogFormVisible = false;
            }
        },
        /**
         * 关闭弹框
         */
        dialog_close() {
            this.dialogFormVisible = false;
        },
        add_dialog_open() {
            Object.assign(this.form, this.formInit);
            this.addDialog = true;
        },
        add_dialog_close() {
            this.addDialog = false;
            this.reset();
        },
        /**
         * 注册行为
         * @returns {Promise<void>}
         */
        async do_register() {
            const data = this.form;

            if (!/^[a-zA-Z]\w{2,19}$/.test(data.userName)) {
                ElMessage({
                    message: '用户名长3-20位,以字母开头',
                    type: 'warning'
                });
                return;
            }
            const res = await register(data);

            if (res.data.code === 0) {
                this.add_dialog_close();
                this.load_table();
            }
        },

        /**
         * 清空表单
         */
        reset() {
            Object.assign(this.form, {
                userName: '',
                passWord: '',
            });
        },
    },

    // 生命周期
    created() {
        this.load_table();
    },
})
