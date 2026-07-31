<template>
  <teleport to="body">
    <transition name="thd-fade">
      <div v-if="modelValue" class="thd-mask smanga-backable" @click.self="close" @contextmenu.stop.prevent>
        <div class="thd-card tsd-card" role="dialog" aria-modal="true">
          <div class="thd-title">{{ $t('themeShare.title') }}</div>

          <!-- 表单态 -->
          <template v-if="!createdLink">
            <div class="tsd-domain-row">
              <div class="thd-chip-row tsd-protocol">
                <button
                  v-for="p in ['http://', 'https://']"
                  :key="p"
                  type="button"
                  class="thd-chip"
                  :class="{ 'is-active': protocol === p }"
                  @click="protocol = p"
                >
                  {{ p }}
                </button>
              </div>
              <input v-model="domain" class="thd-input" type="text" placeholder="example.smanga.com:9797" />
            </div>
            <p class="tsd-note">{{ $t('themeShare.domainNote') }}</p>

            <div class="tsd-label">{{ $t('mangaInfo.shareExpires') }}</div>
            <div class="thd-chip-row">
              <button
                v-for="opt in expireOptions"
                :key="opt.value"
                type="button"
                class="thd-chip"
                :class="{ 'is-active': expires === opt.value }"
                @click="expires = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>

            <div class="thd-actions">
              <button type="button" class="thd-btn" @click="close">{{ $t('option.cancel') }}</button>
              <button type="button" class="thd-btn is-primary" :disabled="creating" @click="createShare">
                {{ $t('mangaInfo.share') }}
              </button>
            </div>
          </template>

          <!-- 结果态: 链接展示 + 复制 -->
          <template v-else>
            <p class="tsd-note">{{ $t('themeShare.created') }}</p>
            <div class="tsd-link-box">
              <input class="thd-input" type="text" readonly :value="createdLink" @focus="($event.target as HTMLInputElement).select()" />
            </div>
            <div class="thd-actions">
              <button type="button" class="thd-btn" @click="close">{{ $t('option.cancel') }}</button>
              <button type="button" class="thd-btn is-primary" @click="copyLink">{{ $t('option.copy') }}</button>
            </div>
          </template>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import shareApi from '@/api/share'
import { useThemeToast } from '@/themes/composables/use-theme-toast'

const props = defineProps<{
  modelValue: boolean
  mangaInfo?: any
  mediaInfo?: any
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; done: [] }>()

const { t } = useI18n()
const toast = useThemeToast()

const protocol = ref('http://')
const domain = ref('')
const expires = ref('1')
const creating = ref(false)
const createdLink = ref('')

const expireOptions = [
  { label: t('themeShare.day1'), value: '1' },
  { label: t('themeShare.week1'), value: '7' },
  { label: t('themeShare.month1'), value: '30' },
  { label: t('themeShare.year1'), value: '365' },
  { label: t('themeShare.forever'), value: '' },
]

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) return
    // 每次打开重置为表单态, 默认当前站点地址
    createdLink.value = ''
    expires.value = '1'
    domain.value = window.location.hostname + (window.location.port ? `:${window.location.port}` : '')
  }
)

function close() {
  emit('update:modelValue', false)
  if (createdLink.value) emit('done')
}

async function createShare() {
  if (!domain.value.trim()) {
    toast.error(t('themeShare.domainRequired'))
    return
  }
  creating.value = true
  try {
    const origin = protocol.value + domain.value.trim()
    const paramsData: any = {
      mediaId: props.mediaInfo?.mediaId,
      shareName: props.mediaInfo?.mediaName,
      expires: parseInt(expires.value),
      origin,
      domain: domain.value.trim(),
    }
    if (props.mangaInfo) {
      paramsData.mangaId = props.mangaInfo.mangaId
      paramsData.mediaId = props.mangaInfo.mediaId
      paramsData.shareName = props.mangaInfo.mangaName
    }
    const shareResponse = await shareApi.create(paramsData)
    createdLink.value = shareResponse.data.link
  } catch {
    toast.error(t('themeShare.failed'))
  } finally {
    creating.value = false
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(createdLink.value)
    toast.success(t('themeShare.copied'))
  } catch {
    toast.error(t('themeShare.copyFailed'))
  }
}
</script>

<style scoped lang="less">
@import '@/themes/style/dialog.less';

.tsd-card {
  width: min(48rem, 92vw);
}

.tsd-domain-row {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.tsd-protocol {
  flex-shrink: 0;
}

.tsd-note {
  margin: 1rem 0 1.6rem;
  font-size: 1.2rem;
  line-height: 1.6;
  opacity: 0.6;
}

.tsd-label {
  margin-bottom: 0.8rem;
  font-size: 1.3rem;
  opacity: 0.85;
}

.tsd-link-box {
  margin-top: 0.4rem;
}

.thd-btn:disabled {
  opacity: 0.55;
  cursor: wait;
}
</style>
