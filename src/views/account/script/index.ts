import {defineComponent} from 'vue'
import {delete_account, get_account, register, update_account} from "@/api/account";
import {Plus, Edit, Delete} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import tablePager from "@/components/table-pager.vue";
import i18n from '@/i18n';
const { t } = i18n.global;

export default defineComponent({
    name: 'account-index',
    setup() {
        return {
            Plus, Edit, Delete
        }
    },
    // 数据
    data() {
        return {
            // 分页数据
            count: 0,
            addDialog: false,
            dialogFormVisible: false,
            tableData: [],
            form: {
                userId: 0,
                userName: '',
                passWord: '',
            },
            formInit: {
                userId: 0,
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
    components: {tablePager},

    // 方法
    methods: {
        /**
         * 编辑用户
         * @param index
         * @param val
         */
        handleEdit(index: number, val: any) {
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
        async handleDelete(index: number, val: any) {
            ElMessageBox.confirm(
                t('account.confirmBoxTitle'),
                t('account.confirmBoxText'), {
                type: 'warning'
            }).then(async () => {
                const res = await delete_account(val.userId);

                if (res.data.code === 0) {
                    // 进入子组件调用刷新
                    (this.$refs as any).pager.reload_page();
                }
            }).catch(() => {
            })
        },
        /**
         * 加载表格
         * @returns {Promise<void>}
         */
        async load_table(page = 1, pageSize = 10) {
            const start = (page - 1) * pageSize;
            const res = await get_account(start, pageSize);
            this.count = Number(res.data.count);
            this.tableData = res.data.list;
        },
        /**
         * 更改用户请求
         * @returns {Promise<void>}
         */
        async do_update() {
            const targetUserId = this.form.userId;
            const res = await update_account(Object.assign(this.form, {targetUserId}));

            if (res.data.code === 0) {
                // 进入子组件调用刷新
                (this.$refs as any).pager.reload_page();
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
                    message: t('account.formWarning'),
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
