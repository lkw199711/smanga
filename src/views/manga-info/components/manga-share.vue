<template>
    <el-form-item>
        <el-input v-model="input1" style="max-width: 600px" placeholder="example.smanga.com">
            <template #prepend>
                <el-select v-model="select" placeholder="" style="width: 115px">
                    <el-option label="http://" value="http://" />
                    <el-option label="https://" value="https://" />
                </el-select>
            </template>
            <template #append>/api/analysis?secret=</template>
        </el-input>
    </el-form-item>
    <!-- 表单项注释 -->
    <p class="note">
        请填写自己的域名或IP地址，分享链接将会在此基础上生成。
    </p>
    <el-form-item :label="$t('mangaInfo.shareExpires')">
        <el-radio-group v-model="radio2">
            <el-radio-button label="1天" value="1" />
            <el-radio-button label="1周" value="7" />
            <el-radio-button label="1月" value="30" />
            <el-radio-button label="1年" value="365" />
            <el-radio-button label="永久有效" value="" />
        </el-radio-group>
    </el-form-item>

    <div class="btn-box">
        <el-button @click="emit('close_dialog')">{{ $t('option.cancel') }}</el-button>
        <el-button type="primary" @click="create_share">{{ $t('mangaInfo.share') }}</el-button>
    </div>
</template>

<script setup lang="ts">
import shareApi from '@/api/share';
import { ElMessageBox } from 'element-plus';
import { ref } from 'vue'

const props = defineProps(['mangaInfo']);
const emit = defineEmits(['update_tags', 'close_dialog']);
const select = ref('http://');
const radio2 = ref('1')
const input1 = ref('');

async function create_share() {
    if (!input1.value) {
        ElMessageBox.alert('请输入域名或IP地址', '错误', {
            type: 'error',
            showClose: true,
            showCancelButton: false,
            showConfirmButton: true,
        });
        return;
    }

    const source = select.value + input1.value.trim();

    const shareResponse = await shareApi.create({
        mangaId: props.mangaInfo.mangaId,
        mediaId: props.mangaInfo.mediaId,
        expires: radio2.value ? parseInt(radio2.value) : undefined,
        source,
        domain: input1.value
    });
    const link = shareResponse.data.link;
    // 这里可以调用API来创建分享链接
    emit('close_dialog');

    ElMessageBox(
        {
            title: '分享链接已创建',
            message: `漫画分享链接: ${link}, 有效期: ${radio2.value}天`,
            type: 'success',
            showClose: true,
            showCancelButton: false,
            showConfirmButton: true,
        }
    ).then(() => {
        // 确认按钮点击后的逻辑
    }).catch(() => {
        // 取消按钮或关闭按钮点击后的逻辑
    });
}
</script>