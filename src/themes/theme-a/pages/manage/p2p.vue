<template>
  <div class="ta-manage-page">
    <div class="ta-page-head">
      <h1>P2P 管理</h1>
    </div>

    <div class="ta-tabs">
      <button :class="['ta-tab', { active: activeTab === 'groups' }]" @click="activeTab = 'groups'">群组管理</button>
      <button :class="['ta-tab', { active: activeTab === 'shares' }]" @click="activeTab = 'shares'">共享管理</button>
      <button :class="['ta-tab', { active: activeTab === 'transfers' }]" @click="activeTab = 'transfers'">传输任务</button>
      <button :class="['ta-tab', { active: activeTab === 'tracker' }]" @click="activeTab = 'tracker'">Tracker 管理</button>
    </div>

    <!-- 群组管理 -->
    <div v-if="activeTab === 'groups'">
      <div class="ta-page-actions" style="margin-bottom:16px">
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

    <!-- 共享管理 -->
    <div v-if="activeTab === 'shares'">
      <div class="ta-page-actions" style="margin-bottom:16px">
        <button class="ta-btn-ghost" @click="loadShares">🔄 刷新</button>
      </div>
      <ResponsiveTable
        :columns="shareColumns"
        :items="shareList"
        :row-key="(item) => item.id"
        :total="shareList.length"
        :page="1"
        :page-size="99999"
        empty-text="暂无共享配置"
      >
        <template #cell-_targetId="{ item }">
          {{ item.mediaId || item.mangaId || '-' }}
        </template>
        <template #actions="{ item }">
          <button class="ta-btn-sm ta-btn-sm-danger" @click="deleteShare(item)">删除</button>
        </template>
      </ResponsiveTable>
    </div>

    <!-- 传输任务 -->
    <div v-if="activeTab === 'transfers'">
      <div class="ta-page-actions" style="margin-bottom:16px">
        <button class="ta-btn-ghost" @click="loadTransfers">🔄 刷新</button>
        <button class="ta-btn-ghost" @click="clearTransfers">🧹 清理已完成</button>
      </div>
      <ResponsiveTable
        :columns="transferColumns"
        :items="transferList"
        :row-key="(item) => item.id"
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
      <div class="ta-page-actions" style="margin-bottom:16px">
        <button class="ta-btn-ghost" @click="loadTrackerGroups">🔄 刷新群组</button>
      </div>
      <h3 style="margin-bottom:12px;font-size:15px;font-weight:600">Tracker 群组</h3>
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

      <div class="ta-page-actions" style="margin-bottom:16px;margin-top:24px">
        <button class="ta-btn-ghost" @click="loadTrackerNodes">🔄 刷新节点</button>
      </div>
      <h3 style="margin-bottom:12px;font-size:15px;font-weight:600">Tracker 节点</h3>
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
    </div>

    <!-- 创建群组弹窗 -->
    <div v-if="showGroupAdd" class="ta-dialog-overlay" @click.self="showGroupAdd = false">
      <div class="ta-dialog">
        <div class="ta-dialog-head"><h3>创建群组</h3><button class="ta-dialog-close" @click="showGroupAdd = false">×</button></div>
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
    <div v-if="showGroupJoin" class="ta-dialog-overlay" @click.self="showGroupJoin = false">
      <div class="ta-dialog">
        <div class="ta-dialog-head"><h3>加入群组</h3><button class="ta-dialog-close" @click="showGroupJoin = false">×</button></div>
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
import { ref, onMounted } from 'vue'
import { p2pGroupApi, p2pShareApi, p2pTransferApi, trackerAdminGroupApi, trackerAdminNodeApi } from '@/api/p2p'
import ResponsiveTable from '@/themes/components/responsive-table.vue'
import type { RtColumn } from '@/themes/components/responsive-table.vue'

const activeTab = ref('groups')
const groupList = ref<any[]>([])
const shareList = ref<any[]>([])
const transferList = ref<any[]>([])
const trackerGroupList = ref<any[]>([])
const trackerNodeList = ref<any[]>([])
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
  { key: 'id', label: 'ID' },
  { key: 'groupNo', label: '群组号' },
  { key: 'shareType', label: '类型' },
  { key: '_targetId', label: '目标ID', hideOnMobile: true },
  { key: 'createTime', label: '创建时间', hideOnMobile: true },
]

const transferColumns: RtColumn[] = [
  { key: '_idx', label: '#', type: 'index', hideOnMobile: true },
  { key: 'id', label: 'ID' },
  { key: 'groupNo', label: '群组号' },
  { key: 'shareType', label: '类型' },
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
async function loadShares() {
  try { const res = await p2pShareApi.list({ page: 1, pageSize: 100 }); shareList.value = res.list || [] } catch { shareList.value = [] }
}
async function deleteShare(row: any) {
  if (!confirm('确定删除此共享配置吗？')) return
  try { await p2pShareApi.destroy(row.id); loadShares() } catch (e: any) { alert(e?.message || '删除失败') }
}

// Transfers
async function loadTransfers() {
  try { const res = await p2pTransferApi.list({ page: 1, pageSize: 100 }); transferList.value = res.list || [] } catch { transferList.value = [] }
}
async function cancelTransfer(row: any) {
  try { await p2pTransferApi.cancel(row.id); loadTransfers() } catch (e: any) { alert(e?.message || '取消失败') }
}
async function deleteTransfer(row: any) {
  if (!confirm('确定删除此传输记录吗？')) return
  try { await p2pTransferApi.destroy(row.id); loadTransfers() } catch (e: any) { alert(e?.message || '删除失败') }
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

onMounted(() => {
  loadGroups()
  loadShares()
  loadTransfers()
  loadTrackerGroups()
  loadTrackerNodes()
})
</script>

<style scoped>
.ta-manage-page { max-width: 1100px; }
.ta-page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.ta-page-head h1 { font-size: 20px; font-weight: 700; margin: 0; }
.ta-page-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.ta-tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 2px solid #eaeaea; padding-bottom: 0; }
.ta-tab { padding: 8px 16px; border: none; background: none; cursor: pointer; font-size: 14px; color: #6b7280; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: .2s; }
.ta-tab:hover { color: #2563eb; }
.ta-tab.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }
.ta-btn-primary,.ta-btn-ghost,.ta-btn-sm,.ta-btn-sm-danger { cursor: pointer; font-size: 13px; border-radius: 8px; }
.ta-btn-primary { padding: 8px 16px; color: #fff; background: #2563eb; border: none; font-weight: 500; }
.ta-btn-primary:hover { background: #1d4ed8; }
.ta-btn-ghost { padding: 8px 16px; color: #4b5563; background: #fff; border: 1px solid #eaeaea; }
.ta-btn-ghost:hover { background: #f3f4f6; }
.ta-btn-sm { padding: 5px 10px; color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 12px; }
.ta-btn-sm:hover { background: #dbeafe; }
.ta-btn-sm-danger { color: #ef4444; background: #fef2f2; border-color: #fecaca; }
.ta-btn-sm-danger:hover { background: #fee2e2; }
.ta-badge { padding: 2px 10px; border-radius: 10px; font-size: 12px; display: inline-block; }
.ta-badge-success { color: #16a34a; background: #f0fdf4; }
.ta-badge-danger { color: #dc2626; background: #fef2f2; }
.ta-badge-active { color: #2563eb; background: #eff6ff; }
.ta-badge-wait { color: #d97706; background: #fffbeb; }
.ta-dialog-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; }
.ta-dialog { background: #fff; border-radius: 14px; width: 480px; max-width: 90vw; max-height: 85vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,.12); }
.ta-dialog-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #eaeaea; }
.ta-dialog-head h3 { margin: 0; font-size: 16px; font-weight: 600; }
.ta-dialog-close { width: 32px; height: 32px; border: none; background: none; font-size: 20px; cursor: pointer; color: #9ca3af; border-radius: 6px; }
.ta-dialog-close:hover { background: #f3f4f6; }
.ta-dialog-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.ta-dialog-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid #eaeaea; }
.ta-field { display: flex; flex-direction: column; gap: 6px; }
.ta-field span { font-size: 13px; font-weight: 500; color: #374151; }
.ta-field input { padding: 8px 12px; border: 1px solid #eaeaea; border-radius: 8px; font-size: 13px; outline: none; }
.ta-field input:focus { border-color: #2563eb; }
</style>
