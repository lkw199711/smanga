<template>
  <div class="ta-manage-page">
    <div class="ta-page-head">
      <h1>P2P 管理</h1>
    </div>

    <div class="ta-tabs">
      <button :class="['ta-tab', { active: activeTab === 'groups' }]" @click="activeTab = 'groups'">群组管理</button>
      <button :class="['ta-tab', { active: activeTab === 'shares' }]" @click="activeTab = 'shares'">本地共享</button>
      <button :class="['ta-tab', { active: activeTab === 'peers' }]" @click="activeTab = 'peers'">群内节点</button>
      <button :class="['ta-tab', { active: activeTab === 'transfers' }]" @click="activeTab = 'transfers'">传输任务</button>
      <button :class="['ta-tab', { active: activeTab === 'tracker' }]" @click="activeTab = 'tracker'">Tracker 管理</button>
    </div>

    <!-- 群组管理 -->
    <div v-if="activeTab === 'groups'">
      <div class="ta-page-actions" style="margin-bottom:1.6rem">
        <button class="ta-btn-ghost" @click="loadGroups">🔄 刷新</button>
        <button class="ta-btn-primary" @click="showGroupAdd = true">+ 创建群组</button>
        <button class="ta-btn-ghost" @click="showGroupJoin = true">🔗 加入群组</button>
      </div>
      <ResponsiveTable
        :columns="groupColumns"
        :items="groupList"
        :row-key="(item) => item.groupNo"
        :total="groupList.length"
        :page="1"
        :page-size="99999"
        empty-text="暂无群组"
      >
        <template #cell-active="{ item }">
          <span :class="['ta-badge', item.active ? 'ta-badge-success' : 'ta-badge-wait']">{{ item.active ? '活跃' : '离线' }}</span>
        </template>
        <template #actions="{ item }">
          <button class="ta-btn-sm ta-btn-sm-danger" @click="leaveGroup(item)">退出</button>
        </template>
      </ResponsiveTable>
    </div>

    <!-- 本地共享 -->
    <div v-if="activeTab === 'shares'">
      <div class="ta-page-actions" style="margin-bottom:1.6rem">
        <select v-model="shareFilterGroupNo" class="ta-select" @change="loadShares(1)">
          <option value="">全部群组</option>
          <option v-for="group in groupList" :key="group.groupNo" :value="group.groupNo">
            {{ group.groupName }} ({{ group.groupNo }})
          </option>
        </select>
        <button class="ta-btn-ghost" @click="loadShares(sharePage)">🔄 刷新</button>
        <button class="ta-btn-primary" :disabled="groupList.length === 0" @click="openShareAdd">+ 新增共享</button>
        <button class="ta-btn-ghost" :disabled="!shareFilterGroupNo" @click="announceShares">📢 广播当前群组</button>
      </div>
      <ResponsiveTable
        :columns="shareColumns"
        :items="shareList"
        :row-key="(item) => item.p2pLocalShareId"
        :total="shareCount"
        :page="sharePage"
        :page-size="sharePageSize"
        empty-text="暂无共享配置"
        @update:page="loadShares"
      >
        <template #cell-shareType="{ item }">
          {{ item.shareType === 'media' ? '媒体库' : '漫画' }}
        </template>
        <template #cell-_resource="{ item }">
          {{ item.mediaName || item.mangaName || item.shareName || '-' }}
        </template>
        <template #cell-enable="{ item }">
          <label class="ta-switch">
            <input
              type="checkbox"
              :checked="item.enable === 1"
              @change="toggleShare(item, ($event.target as HTMLInputElement).checked)"
            />
            <span class="ta-switch-slider"></span>
          </label>
        </template>
        <template #actions="{ item }">
          <button class="ta-btn-sm ta-btn-sm-danger" @click="deleteShare(item)">删除</button>
        </template>
      </ResponsiveTable>
    </div>

    <!-- 群内节点 -->
    <div v-if="activeTab === 'peers'">
      <div class="ta-page-actions" style="margin-bottom:1.6rem">
        <select v-model="peerGroupNo" class="ta-select" @change="loadPeers(true)">
          <option value="" disabled>请选择群组</option>
          <option v-for="group in groupList" :key="group.groupNo" :value="group.groupNo">
            {{ group.groupName }} ({{ group.groupNo }})
          </option>
        </select>
        <button class="ta-btn-primary" :disabled="!peerGroupNo || peerLoading" @click="loadPeers(true)">
          {{ peerLoading ? '加载中...' : '🔄 从 Tracker 刷新' }}
        </button>
        <button class="ta-btn-ghost" :disabled="!peerGroupNo || peerLoading" @click="loadPeerShares(false)">
          📋 读取本地缓存
        </button>
      </div>

      <h3 class="ta-section-title">群组成员</h3>
      <ResponsiveTable
        :columns="peerMemberColumns"
        :items="peerMembers"
        :row-key="(item) => item.nodeId"
        :total="peerMembers.length"
        :page="1"
        :page-size="99999"
        empty-text="暂无群组成员"
      >
        <template #cell-online="{ item }">
          <span :class="['ta-badge', item.online ? 'ta-badge-success' : 'ta-badge-wait']">
            {{ item.online ? '在线' : '离线' }}
          </span>
        </template>
      </ResponsiveTable>

      <h3 class="ta-section-title ta-section-title-spaced">群内共享资源</h3>
      <ResponsiveTable
        :columns="peerShareColumns"
        :items="peerShares"
        :row-key="peerShareRowKey"
        :total="peerShares.length"
        :page="1"
        :page-size="99999"
        empty-text="暂无群内共享资源"
      >
        <template #cell-shareType="{ item }">
          {{ item.shareType === 'media' ? '媒体库' : '漫画' }}
        </template>
        <template #actions="{ item }">
          <button class="ta-btn-sm" @click="openPeerDetail(item)">查看详情</button>
          <button class="ta-btn-sm ta-btn-sm-success" @click="openPullDialog(item)">拉取</button>
        </template>
      </ResponsiveTable>
    </div>

    <!-- 传输任务 -->
    <div v-if="activeTab === 'transfers'">
      <div class="ta-page-actions" style="margin-bottom:1.6rem">
        <button class="ta-btn-ghost" @click="loadTransfers">🔄 刷新</button>
        <button class="ta-btn-ghost" @click="clearTransfers">🧹 清理已完成</button>
      </div>
      <ResponsiveTable
        :columns="transferColumns"
        :items="transferList"
        :row-key="(item) => item.p2pTransferId"
        :total="transferList.length"
        :page="1"
        :page-size="99999"
        empty-text="暂无传输任务"
      >
        <template #cell-status="{ item }">
          <span v-if="item.status === 'success'" class="ta-badge ta-badge-success">成功</span>
          <span v-else-if="item.status === 'failed'" class="ta-badge ta-badge-danger">失败</span>
          <span v-else-if="item.status === 'canceled'" class="ta-badge ta-badge-wait">已取消</span>
          <span v-else class="ta-badge ta-badge-active">进行中</span>
        </template>
        <template #actions="{ item }">
          <button v-if="item.status !== 'success' && item.status !== 'canceled'" class="ta-btn-sm ta-btn-sm-danger" @click="cancelTransfer(item)">取消</button>
          <button class="ta-btn-sm ta-btn-sm-danger" @click="deleteTransfer(item)">删除</button>
        </template>
      </ResponsiveTable>
    </div>

    <!-- Tracker 管理 -->
    <div v-if="activeTab === 'tracker'">
      <div v-if="trackerStatus === 'loading'" class="ta-tracker-notice" aria-live="polite">
        <div class="ta-tracker-notice-icon">⏳</div>
        <div>
          <h3>正在检查 Tracker 状态</h3>
          <p>请稍候...</p>
        </div>
      </div>

      <div v-else-if="trackerStatus === 'disabled'" class="ta-tracker-notice ta-tracker-notice-warning" aria-live="polite">
        <div class="ta-tracker-notice-icon">⚠️</div>
        <div>
          <h3>本机未启用 Tracker 角色</h3>
          <p>{{ trackerStatusMessage }}</p>
          <RouterLink class="ta-btn-primary ta-tracker-setting-link" :to="{ name: 't-manage-server' }">
            前往服务器设置
          </RouterLink>
        </div>
      </div>

      <div v-else-if="trackerStatus === 'error'" class="ta-tracker-notice ta-tracker-notice-error" aria-live="polite">
        <div class="ta-tracker-notice-icon">❌</div>
        <div>
          <h3>无法获取 Tracker 状态</h3>
          <p>{{ trackerStatusMessage }}</p>
          <button class="ta-btn-ghost" @click="loadTrackerManagement">重新检查</button>
        </div>
      </div>

      <template v-else-if="trackerStatus === 'enabled'">
        <div class="ta-page-actions" style="margin-bottom:1.6rem">
          <button class="ta-btn-ghost" @click="loadTrackerGroups">🔄 刷新群组</button>
        </div>
        <h3 style="margin-bottom:1.2rem;font-size:1.5rem;font-weight:600">Tracker 群组</h3>
        <ResponsiveTable
          :columns="trackerGroupColumns"
          :items="trackerGroupList"
          :row-key="(item) => item.groupNo"
          :total="trackerGroupList.length"
          :page="1"
          :page-size="99999"
          empty-text="暂无 Tracker 群组"
        >
          <template #cell-enable="{ item }">
            <span :class="['ta-badge', item.enable ? 'ta-badge-success' : 'ta-badge-danger']">{{ item.enable ? '启用' : '禁用' }}</span>
          </template>
          <template #actions="{ item }">
            <button class="ta-btn-sm ta-btn-sm-danger" @click="dismissTrackerGroup(item)">解散</button>
          </template>
        </ResponsiveTable>

        <div class="ta-page-actions" style="margin-bottom:1.6rem;margin-top:2.4rem">
          <button class="ta-btn-ghost" @click="loadTrackerNodes">🔄 刷新节点</button>
        </div>
        <h3 style="margin-bottom:1.2rem;font-size:1.5rem;font-weight:600">Tracker 节点</h3>
        <ResponsiveTable
          :columns="trackerNodeColumns"
          :items="trackerNodeList"
          :row-key="(item) => item.nodeId"
          :total="trackerNodeList.length"
          :page="1"
          :page-size="99999"
          empty-text="暂无节点"
        >
          <template #cell-online="{ item }">
            <span :class="['ta-badge', item.online ? 'ta-badge-success' : 'ta-badge-wait']">{{ item.online ? '在线' : '离线' }}</span>
          </template>
          <template #cell-banned="{ item }">
            <span :class="['ta-badge', item.banned ? 'ta-badge-danger' : 'ta-badge-success']">{{ item.banned ? '是' : '否' }}</span>
          </template>
          <template #actions="{ item }">
            <button class="ta-btn-sm" @click="toggleBanNode(item)">{{ item.banned ? '解封' : '封禁' }}</button>
            <button class="ta-btn-sm ta-btn-sm-danger" @click="destroyNode(item)">注销</button>
          </template>
        </ResponsiveTable>
      </template>
    </div>

    <!-- 新增本地共享弹窗 -->
    <div v-if="showShareAdd" class="ta-dialog-overlay smanga-backable" @click.self="showShareAdd = false">
      <div class="ta-dialog">
        <div class="ta-dialog-head">
          <h3>新增本地共享</h3>
          <button class="ta-dialog-close smanga-back-close" @click="showShareAdd = false">×</button>
        </div>
        <div class="ta-dialog-body">
          <label class="ta-field">
            <span>共享到群组</span>
            <select v-model="shareForm.groupNo">
              <option value="" disabled>请选择群组</option>
              <option v-for="group in groupList" :key="group.groupNo" :value="group.groupNo">
                {{ group.groupName }} ({{ group.groupNo }})
              </option>
            </select>
          </label>
          <label class="ta-field">
            <span>共享类型</span>
            <select v-model="shareForm.shareType" @change="onShareTypeChange">
              <option value="media">媒体库</option>
              <option value="manga">漫画</option>
            </select>
          </label>
          <label v-if="shareForm.shareType === 'media'" class="ta-field">
            <span>媒体库</span>
            <select v-model="shareForm.mediaId">
              <option :value="undefined" disabled>请选择媒体库</option>
              <option v-for="media in mediaList" :key="media.mediaId" :value="media.mediaId">
                {{ media.mediaName }}
              </option>
            </select>
          </label>
          <template v-else>
            <label class="ta-field">
              <span>所属媒体库</span>
              <select v-model="shareMangaMediaId" @change="loadMangasForMedia">
                <option :value="undefined" disabled>请选择媒体库</option>
                <option v-for="media in mediaList" :key="media.mediaId" :value="media.mediaId">
                  {{ media.mediaName }}
                </option>
              </select>
            </label>
            <label class="ta-field">
              <span>漫画</span>
              <select v-model="shareForm.mangaId" :disabled="!shareMangaMediaId">
                <option :value="undefined" disabled>请选择漫画</option>
                <option v-for="manga in mangaList" :key="manga.mangaId" :value="manga.mangaId">
                  {{ manga.mangaName }}
                </option>
              </select>
            </label>
          </template>
        </div>
        <div class="ta-dialog-foot">
          <button class="ta-btn-primary" @click="createShare">确认</button>
          <button class="ta-btn-ghost" @click="showShareAdd = false">取消</button>
        </div>
      </div>
    </div>

    <!-- 拉取群内资源弹窗 -->
    <div v-if="showPullDialog" class="ta-dialog-overlay smanga-backable" @click.self="showPullDialog = false">
      <div class="ta-dialog">
        <div class="ta-dialog-head">
          <h3>拉取群内资源</h3>
          <button class="ta-dialog-close smanga-back-close" @click="showPullDialog = false">×</button>
        </div>
        <div class="ta-dialog-body">
          <label class="ta-field">
            <span>类型</span>
            <div class="ta-field-value">{{ pullForm.transferType === 'media' ? '媒体库' : '漫画' }}</div>
          </label>
          <label class="ta-field">
            <span>资源名称</span>
            <div class="ta-field-value">{{ pullForm.remoteName }}</div>
          </label>
          <label class="ta-field">
            <span>接收路径</span>
            <input
              v-model="pullForm.receivedPath"
              list="p2p-received-paths"
              placeholder="请选择或输入接收路径"
            />
            <datalist id="p2p-received-paths">
              <option v-for="pathItem in pathList" :key="pathItem.pathId" :value="pathItem.pathContent"></option>
            </datalist>
          </label>
        </div>
        <div class="ta-dialog-foot">
          <button class="ta-btn-primary" @click="submitPull">开始拉取</button>
          <button class="ta-btn-ghost" @click="showPullDialog = false">取消</button>
        </div>
      </div>
    </div>

    <ManifestDetailDialog
      v-model="showPeerDetail"
      :group-no="peerGroupNo"
      :share="selectedPeerShare"
    />

    <!-- 创建群组弹窗 -->
    <div v-if="showGroupAdd" class="ta-dialog-overlay smanga-backable" @click.self="showGroupAdd = false">
      <div class="ta-dialog">
        <div class="ta-dialog-head"><h3>创建群组</h3><button class="ta-dialog-close smanga-back-close" @click="showGroupAdd = false">×</button></div>
        <div class="ta-dialog-body">
          <label class="ta-field"><span>名称</span><input v-model="groupForm.groupName" /></label>
          <label class="ta-field"><span>描述</span><input v-model="groupForm.description" /></label>
        </div>
        <div class="ta-dialog-foot">
          <button class="ta-btn-primary" @click="createGroup">确认</button>
          <button class="ta-btn-ghost" @click="showGroupAdd = false">取消</button>
        </div>
      </div>
    </div>

    <!-- 加入群组弹窗 -->
    <div v-if="showGroupJoin" class="ta-dialog-overlay smanga-backable" @click.self="showGroupJoin = false">
      <div class="ta-dialog">
        <div class="ta-dialog-head"><h3>加入群组</h3><button class="ta-dialog-close smanga-back-close" @click="showGroupJoin = false">×</button></div>
        <div class="ta-dialog-body">
          <label class="ta-field"><span>群组号</span><input v-model="groupForm.groupNo" placeholder="输入邀请码或群组号" /></label>
        </div>
        <div class="ta-dialog-foot">
          <button class="ta-btn-primary" @click="joinGroup">确认</button>
          <button class="ta-btn-ghost" @click="showGroupJoin = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import {
  p2pGroupApi,
  p2pPeerApi,
  p2pShareApi,
  p2pTransferApi,
  trackerAdminGroupApi,
  trackerAdminNodeApi,
} from '@/api/p2p'
import mediaApi from '@/api/media'
import mangaApi from '@/api/manga'
import pathApi from '@/api/path'
import serveSettingApi from '@/api/serve-setting'
import ResponsiveTable from '@/themes/components/responsive-table.vue'
import ManifestDetailDialog from '@/views/p2p-peers/ManifestDetailDialog.vue'
import type { RtColumn } from '@/themes/components/responsive-table.vue'
import type {
  P2PLocalShareCreateParams,
  P2PLocalShareType,
  P2PPullCreateParams,
  P2PShareIndexType,
} from '@/type/p2p'
import type { mediaType } from '@/type/media'
import type { mangaType } from '@/type/manga'
import type { pathType } from '@/type/path'

const activeTab = ref('groups')
const groupList = ref<any[]>([])
const shareList = ref<P2PLocalShareType[]>([])
const shareCount = ref(0)
const sharePage = ref(1)
const sharePageSize = 10
const shareFilterGroupNo = ref('')
const mediaList = ref<mediaType[]>([])
const mangaList = ref<mangaType[]>([])
const showShareAdd = ref(false)
const shareMangaMediaId = ref<number>()
const shareForm = ref<P2PLocalShareCreateParams>({
  groupNo: '',
  shareType: 'media',
  mediaId: undefined,
  mangaId: undefined,
})
const peerGroupNo = ref('')
const peerMembers = ref<any[]>([])
const peerShares = ref<P2PShareIndexType[]>([])
const peerLoading = ref(false)
const pathList = ref<pathType[]>([])
const showPeerDetail = ref(false)
const selectedPeerShare = ref<any | null>(null)
const showPullDialog = ref(false)
const pullForm = ref<P2PPullCreateParams>({
  groupNo: '',
  transferType: 'manga',
  remoteMediaId: undefined,
  remoteMangaId: undefined,
  remoteChapterId: undefined,
  remoteName: '',
  receivedPath: '',
})
const transferList = ref<any[]>([])
const trackerGroupList = ref<any[]>([])
const trackerNodeList = ref<any[]>([])
const trackerStatus = ref<'idle' | 'loading' | 'enabled' | 'disabled' | 'error'>('idle')
const trackerStatusMessage = ref('')
const showGroupAdd = ref(false)
const showGroupJoin = ref(false)
const groupForm = ref({ groupName: '', description: '', groupNo: '' })

const groupColumns: RtColumn[] = [
  { key: '_idx', label: '#', type: 'index', hideOnMobile: true },
  { key: 'groupNo', label: '群组号' },
  { key: 'groupName', label: '名称' },
  { key: 'description', label: '描述', hideOnMobile: true },
  { key: 'active', label: '状态' },
]

const shareColumns: RtColumn[] = [
  { key: '_idx', label: '#', type: 'index', hideOnMobile: true },
  { key: 'groupName', label: '群组' },
  { key: 'shareType', label: '类型' },
  { key: '_resource', label: '共享资源' },
  { key: 'enable', label: '启用' },
  { key: 'updateTime', label: '更新时间', hideOnMobile: true },
]

const peerMemberColumns: RtColumn[] = [
  { key: '_idx', label: '#', type: 'index', hideOnMobile: true },
  { key: 'nodeId', label: '节点 ID' },
  { key: 'nodeName', label: '节点名称' },
  { key: 'online', label: '状态' },
  { key: 'lastHeartbeat', label: '最后心跳', hideOnMobile: true },
]

const peerShareColumns: RtColumn[] = [
  { key: '_idx', label: '#', type: 'index', hideOnMobile: true },
  { key: 'nodeName', label: '来源节点' },
  { key: 'shareType', label: '类型' },
  { key: 'shareName', label: '资源名称' },
  { key: 'mangaCount', label: '漫画数', hideOnMobile: true },
  { key: 'updateTime', label: '更新时间', hideOnMobile: true },
]

const transferColumns: RtColumn[] = [
  { key: '_idx', label: '#', type: 'index', hideOnMobile: true },
  { key: 'p2pTransferId', label: 'ID' },
  { key: 'groupNo', label: '群组号' },
  { key: 'transferType', label: '类型' },
  { key: 'remoteName', label: '资源名称' },
  { key: 'status', label: '状态' },
  { key: 'progress', label: '进度', hideOnMobile: true },
  { key: 'createTime', label: '创建时间', hideOnMobile: true },
]

const trackerGroupColumns: RtColumn[] = [
  { key: '_idx', label: '#', type: 'index', hideOnMobile: true },
  { key: 'groupNo', label: '群组号' },
  { key: 'groupName', label: '名称' },
  { key: 'enable', label: '状态' },
]

const trackerNodeColumns: RtColumn[] = [
  { key: '_idx', label: '#', type: 'index', hideOnMobile: true },
  { key: 'nodeId', label: '节点ID' },
  { key: 'nodeName', label: '名称' },
  { key: 'online', label: '在线' },
  { key: 'banned', label: '封禁' },
]

// Groups
async function loadGroups() {
  try { const res = await p2pGroupApi.list(); groupList.value = res.list || [] } catch { groupList.value = [] }
}
async function createGroup() {
  if (!groupForm.value.groupName) return alert('群组名称不能为空')
  try { await p2pGroupApi.create({ groupName: groupForm.value.groupName, describe: groupForm.value.description }); showGroupAdd.value = false; loadGroups() } catch (e: any) { alert(e?.message || '创建失败') }
}
async function joinGroup() {
  if (!groupForm.value.groupNo) return alert('群组号不能为空')
  try { await p2pGroupApi.join({ groupNo: groupForm.value.groupNo }); showGroupJoin.value = false; loadGroups() } catch (e: any) { alert(e?.message || '加入失败') }
}
async function leaveGroup(row: any) {
  if (!confirm(`确定退出群组「${row.groupName || row.groupNo}」吗？`)) return
  try { await p2pGroupApi.leave(row.groupNo); loadGroups() } catch (e: any) { alert(e?.message || '退出失败') }
}

// Shares
async function loadMedia() {
  try {
    const res = await mediaApi.get(1, 999)
    mediaList.value = res?.list || []
  } catch {
    mediaList.value = []
  }
}
async function loadMangasForMedia() {
  shareForm.value.mangaId = undefined
  if (!shareMangaMediaId.value) {
    mangaList.value = []
    return
  }
  try {
    const res = await mangaApi.get(shareMangaMediaId.value, 1, 999)
    mangaList.value = res?.list || []
  } catch {
    mangaList.value = []
  }
}
async function loadShares(page = sharePage.value) {
  sharePage.value = page
  try {
    const res = await p2pShareApi.list({
      page,
      pageSize: sharePageSize,
      groupNo: shareFilterGroupNo.value || undefined,
    })
    shareList.value = res?.list || res?.data?.list || []
    shareCount.value = res?.count || res?.data?.count || shareList.value.length
  } catch {
    shareList.value = []
    shareCount.value = 0
  }
}
async function loadLocalShareTab() {
  await Promise.all([loadGroups(), loadMedia()])
  await loadShares(1)
}
function openShareAdd() {
  shareForm.value = {
    groupNo: shareFilterGroupNo.value || groupList.value[0]?.groupNo || '',
    shareType: 'media',
    mediaId: undefined,
    mangaId: undefined,
  }
  shareMangaMediaId.value = undefined
  mangaList.value = []
  showShareAdd.value = true
}
function onShareTypeChange() {
  shareForm.value.mediaId = undefined
  shareForm.value.mangaId = undefined
  shareMangaMediaId.value = undefined
  mangaList.value = []
}
async function createShare() {
  if (!shareForm.value.groupNo) return alert('请选择共享群组')
  if (shareForm.value.shareType === 'media' && !shareForm.value.mediaId) {
    return alert('请选择媒体库')
  }
  if (shareForm.value.shareType === 'manga' && !shareForm.value.mangaId) {
    return alert('请选择漫画')
  }
  try {
    await p2pShareApi.create(shareForm.value)
    showShareAdd.value = false
    await loadShares(1)
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || '新增共享失败')
  }
}
async function toggleShare(row: P2PLocalShareType, enable: boolean) {
  if (!row.p2pLocalShareId) return
  const previous = row.enable
  row.enable = enable ? 1 : 0
  try {
    await p2pShareApi.update(row.p2pLocalShareId, { enable: row.enable })
  } catch (e: any) {
    row.enable = previous
    alert(e?.response?.data?.message || e?.message || '更新共享失败')
  }
}
async function announceShares() {
  if (!shareFilterGroupNo.value) return
  try {
    await p2pShareApi.announce(shareFilterGroupNo.value)
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || '广播失败')
  }
}
async function deleteShare(row: P2PLocalShareType) {
  if (!row.p2pLocalShareId) return
  if (!confirm('确定删除此共享配置吗？')) return
  try {
    await p2pShareApi.destroy(row.p2pLocalShareId)
    await loadShares(sharePage.value)
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || '删除失败')
  }
}

// Peers
async function loadPaths() {
  try {
    const res = await pathApi.get(0)
    pathList.value = res?.list || []
  } catch {
    pathList.value = []
  }
}
async function loadPeerMembers() {
  if (!peerGroupNo.value) {
    peerMembers.value = []
    return
  }
  try {
    const res = await p2pPeerApi.members(peerGroupNo.value)
    peerMembers.value = res?.list || res?.data?.list || res?.data || []
  } catch {
    peerMembers.value = []
  }
}
async function loadPeerShares(fromTracker = true) {
  if (!peerGroupNo.value) {
    peerShares.value = []
    return
  }
  try {
    const res = fromTracker
      ? await p2pPeerApi.manifests(peerGroupNo.value, { sync: 1, fallback: 1 })
      : await p2pPeerApi.manifests(peerGroupNo.value, { sync: 0, fallback: 1 })
    const data = res?.data || res
    peerShares.value = data?.list || []
  } catch {
    peerShares.value = []
  }
}
async function loadPeers(fromTracker = true) {
  if (!peerGroupNo.value) {
    peerMembers.value = []
    peerShares.value = []
    return
  }
  peerLoading.value = true
  try {
    await Promise.all([loadPeerMembers(), loadPeerShares(fromTracker)])
  } finally {
    peerLoading.value = false
  }
}
async function loadPeersTab() {
  await Promise.all([loadGroups(), loadPaths()])
  if (!groupList.value.some((group) => group.groupNo === peerGroupNo.value)) {
    peerGroupNo.value = groupList.value[0]?.groupNo || ''
  }
  await loadPeers(true)
}
function peerShareRowKey(item: P2PShareIndexType) {
  return [
    item.nodeId,
    item.shareType,
    item.remoteMediaId ?? '',
    item.remoteMangaId ?? '',
  ].join(':')
}
function openPeerDetail(row: P2PShareIndexType) {
  selectedPeerShare.value = {
    nodeId: row.nodeId,
    nodeName: row.nodeName,
    shareType: row.shareType,
    remoteMediaId: row.remoteMediaId ?? null,
    remoteMangaId: row.remoteMangaId ?? null,
    shareName: row.shareName,
    payloadTruncated: (row as any).payloadTruncated ?? 0,
  }
  showPeerDetail.value = true
}
function openPullDialog(row: P2PShareIndexType) {
  const transferType: 'media' | 'manga' = row.shareType === 'media' ? 'media' : 'manga'
  pullForm.value = {
    groupNo: peerGroupNo.value,
    transferType,
    remoteMediaId: transferType === 'media' ? (row.remoteMediaId ?? undefined) : undefined,
    remoteMangaId: transferType === 'manga' ? (row.remoteMangaId ?? undefined) : undefined,
    remoteChapterId: undefined,
    remoteName: row.shareName || '',
    receivedPath: pathList.value[0]?.pathContent || '',
  }
  showPullDialog.value = true
}
async function submitPull() {
  if (!pullForm.value.receivedPath) return alert('请选择或输入接收路径')
  if (pullForm.value.transferType === 'media' && !pullForm.value.remoteMediaId) {
    return alert('资源缺少 remoteMediaId')
  }
  if (pullForm.value.transferType === 'manga' && !pullForm.value.remoteMangaId) {
    return alert('资源缺少 remoteMangaId')
  }
  if (!pullForm.value.remoteName) return alert('资源名称不能为空')
  try {
    await p2pTransferApi.pull(pullForm.value)
    showPullDialog.value = false
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || '拉取失败')
  }
}

// Transfers
async function loadTransfers() {
  try { const res = await p2pTransferApi.list({ page: 1, pageSize: 100 }); transferList.value = res.list || [] } catch { transferList.value = [] }
}
async function cancelTransfer(row: any) {
  if (!row.p2pTransferId) return
  try { await p2pTransferApi.cancel(row.p2pTransferId); loadTransfers() } catch (e: any) { alert(e?.message || '取消失败') }
}
async function deleteTransfer(row: any) {
  if (!row.p2pTransferId) return
  if (!confirm('确定删除此传输记录吗？')) return
  try { await p2pTransferApi.destroy(row.p2pTransferId); loadTransfers() } catch (e: any) { alert(e?.message || '删除失败') }
}
async function clearTransfers() {
  if (!confirm('确定清理所有已完成的传输记录吗？')) return
  try { await p2pTransferApi.clear(); loadTransfers() } catch (e: any) { alert(e?.message || '清理失败') }
}

// Tracker
async function loadTrackerGroups() {
  try { const res = await trackerAdminGroupApi.list(); trackerGroupList.value = res.list || [] } catch { trackerGroupList.value = [] }
}
async function loadTrackerNodes() {
  try { const res = await trackerAdminNodeApi.list(); trackerNodeList.value = res.list || [] } catch { trackerNodeList.value = [] }
}
async function loadTrackerManagement() {
  trackerStatus.value = 'loading'
  trackerStatusMessage.value = ''
  trackerGroupList.value = []
  trackerNodeList.value = []

  try {
    const config = await serveSettingApi.get()
    if (!config?.p2p?.enable || !config?.p2p?.role?.tracker) {
      trackerStatus.value = 'disabled'
      trackerStatusMessage.value = !config?.p2p?.enable
        ? 'P2P 总开关尚未开启。请先在服务器设置中启用 P2P，再开启 Tracker 角色。'
        : '请在服务器设置中开启“作为 Tracker”角色后再使用此功能。'
      return
    }

    trackerStatus.value = 'enabled'
    await Promise.all([loadTrackerGroups(), loadTrackerNodes()])
  } catch {
    trackerStatus.value = 'error'
    trackerStatusMessage.value = '服务器配置读取失败，请稍后重试。'
  }
}
async function dismissTrackerGroup(row: any) {
  if (!confirm(`确定解散群组「${row.groupNo}」吗？`)) return
  try { await trackerAdminGroupApi.dismiss(row.groupNo); loadTrackerGroups() } catch (e: any) { alert(e?.message || '解散失败') }
}
async function toggleBanNode(row: any) {
  try {
    await trackerAdminNodeApi.ban(row.nodeId, { banned: row.banned ? 0 : 1 })
    loadTrackerNodes()
  } catch (e: any) { alert(e?.message || '操作失败') }
}
async function destroyNode(row: any) {
  if (!confirm(`确定注销节点「${row.nodeName || row.nodeId}」吗？`)) return
  try { await trackerAdminNodeApi.destroy(row.nodeId); loadTrackerNodes() } catch (e: any) { alert(e?.message || '注销失败') }
}

watch(activeTab, (tab) => {
  if (tab === 'groups') {
    loadGroups()
  } else if (tab === 'shares') {
    loadLocalShareTab()
  } else if (tab === 'peers') {
    loadPeersTab()
  } else if (tab === 'transfers') {
    loadTransfers()
  } else if (tab === 'tracker') {
    loadTrackerManagement()
  }
}, { immediate: true })
</script>

<style scoped>
.ta-manage-page { max-width: 110rem; }
.ta-page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1.2rem; }
.ta-page-head h1 { font-size: 2rem; font-weight: 700; margin: 0; }
.ta-page-actions { display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; }
.ta-tabs { display: flex; gap: 0.4rem; margin-bottom: 2rem; border-bottom: 0.2rem solid #eaeaea; padding-bottom: 0; overflow-x: auto; }
.ta-tab { padding: 0.8rem 1.6rem; border: none; background: none; cursor: pointer; font-size: 1.4rem; color: #6b7280; border-bottom: 0.2rem solid transparent; margin-bottom: -0.2rem; transition: .2s; }
.ta-tab:hover { color: #2563eb; }
.ta-tab.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }
.ta-btn-primary,.ta-btn-ghost,.ta-btn-sm,.ta-btn-sm-danger { cursor: pointer; font-size: 1.3rem; border-radius: 0.8rem; }
.ta-btn-primary:disabled,.ta-btn-ghost:disabled,.ta-btn-sm:disabled { opacity: .5; cursor: not-allowed; }
.ta-btn-primary { padding: 0.8rem 1.6rem; color: #fff; background: #2563eb; border: none; font-weight: 500; }
.ta-btn-primary:hover { background: #1d4ed8; }
.ta-btn-ghost { padding: 0.8rem 1.6rem; color: #4b5563; background: #fff; border: 1px solid #eaeaea; }
.ta-btn-ghost:hover { background: #f3f4f6; }
.ta-btn-sm { padding: 0.5rem 1rem; color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 1.2rem; }
.ta-btn-sm:hover { background: #dbeafe; }
.ta-btn-sm-success { color: #15803d; background: #f0fdf4; border-color: #bbf7d0; }
.ta-btn-sm-success:hover { background: #dcfce7; }
.ta-btn-sm-danger { color: #ef4444; background: #fef2f2; border-color: #fecaca; }
.ta-btn-sm-danger:hover { background: #fee2e2; }
.ta-select { min-width: 22rem; padding: 0.8rem 3.2rem 0.8rem 1.2rem; border: 1px solid #eaeaea; border-radius: 0.8rem; background: #fff; color: #374151; font-size: 1.3rem; outline: none; }
.ta-select:focus { border-color: #2563eb; }
.ta-section-title { margin: 0 0 1.2rem; font-size: 1.5rem; font-weight: 600; color: #1f2937; }
.ta-section-title-spaced { margin-top: 2.4rem; }
.ta-badge { padding: 0.2rem 1rem; border-radius: 1rem; font-size: 1.2rem; display: inline-block; }
.ta-badge-success { color: #16a34a; background: #f0fdf4; }
.ta-badge-danger { color: #dc2626; background: #fef2f2; }
.ta-badge-active { color: #2563eb; background: #eff6ff; }
.ta-badge-wait { color: #d97706; background: #fffbeb; }
.ta-tracker-notice { display: flex; align-items: flex-start; gap: 1.6rem; padding: 2.4rem; border: 1px solid #dbeafe; border-radius: 1.2rem; background: #eff6ff; color: #1e3a8a; }
.ta-tracker-notice-warning { border-color: #fde68a; background: #fffbeb; color: #92400e; }
.ta-tracker-notice-error { border-color: #fecaca; background: #fef2f2; color: #991b1b; }
.ta-tracker-notice-icon { font-size: 2.4rem; line-height: 1; }
.ta-tracker-notice h3 { margin: 0 0 0.8rem; font-size: 1.6rem; }
.ta-tracker-notice p { margin: 0 0 1.6rem; font-size: 1.3rem; line-height: 1.6; }
.ta-tracker-setting-link { display: inline-block; text-decoration: none; }
.ta-dialog-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; }
.ta-dialog { background: #fff; border-radius: 1.4rem; width: 48rem; max-width: 90vw; max-height: 85vh; overflow-y: auto; box-shadow: 0 0.8rem 3.2rem rgba(0,0,0,.12); }
.ta-dialog-head { display: flex; align-items: center; justify-content: space-between; padding: 1.6rem 2rem; border-bottom: 1px solid #eaeaea; }
.ta-dialog-head h3 { margin: 0; font-size: 1.6rem; font-weight: 600; }
.ta-dialog-close { width: 3.2rem; height: 3.2rem; border: none; background: none; font-size: 2rem; cursor: pointer; color: #9ca3af; border-radius: 0.6rem; }
.ta-dialog-close:hover { background: #f3f4f6; }
.ta-dialog-body { padding: 2rem; display: flex; flex-direction: column; gap: 1.6rem; }
.ta-dialog-foot { display: flex; justify-content: flex-end; gap: 0.8rem; padding: 1.2rem 2rem; border-top: 1px solid #eaeaea; }
.ta-field { display: flex; flex-direction: column; gap: 0.6rem; }
.ta-field span { font-size: 1.3rem; font-weight: 500; color: #374151; }
.ta-field input,.ta-field select { padding: 0.8rem 1.2rem; border: 1px solid #eaeaea; border-radius: 0.8rem; background: #fff; font-size: 1.3rem; outline: none; }
.ta-field input:focus,.ta-field select:focus { border-color: #2563eb; }
.ta-field input:disabled,.ta-field select:disabled { background: #f3f4f6; color: #9ca3af; }
.ta-field-value { min-height: 2rem; padding: 0.8rem 1.2rem; border-radius: 0.8rem; background: #f9fafb; color: #374151; font-size: 1.3rem; }
.ta-switch { position: relative; display: inline-block; width: 4rem; height: 2.2rem; cursor: pointer; }
.ta-switch input { width: 0; height: 0; opacity: 0; }
.ta-switch-slider { position: absolute; inset: 0; border-radius: 2rem; background: #d1d5db; transition: .2s; }
.ta-switch-slider::before { content: ''; position: absolute; width: 1.8rem; height: 1.8rem; left: .2rem; top: .2rem; border-radius: 50%; background: #fff; box-shadow: 0 1px .3rem rgba(0,0,0,.2); transition: .2s; }
.ta-switch input:checked + .ta-switch-slider { background: #2563eb; }
.ta-switch input:checked + .ta-switch-slider::before { transform: translateX(1.8rem); }
</style>
