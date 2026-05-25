/**
 * P2P 相关前端类型定义(与后端 prisma schema / controller 字段保持一致)
 */

export type P2PRole = 'node' | 'tracker' | 'both';

// 群组(对应 p2p_group)
export type P2PGroupType = {
  p2pGroupId?: number;
  groupNo: string;
  groupName: string;
  describe?: string | null;
  ownerNodeId?: string;
  isOwner?: number;
  trackerUrl?: string;
  memberCount?: number;
  joinTime?: string;
  lastSyncTime?: string;
  createTime?: string;
  updateTime?: string;
};

// 群内节点(对应 p2p_peer_cache / tracker member)
export type P2PPeerNodeType = {
  nodeId: string;
  nodeName?: string;
  publicUrl?: string;
  online?: number;
  version?: string;
  lastSeen?: string;
  lastHeartbeat?: string;
  shareCount?: number;
};

// 共享索引项 (tracker 聚合, listGroupShares 返回)
export type P2PShareIndexType = {
  trackerShareIndexId?: number;
  nodeId: string;
  nodeName?: string | null;
  online?: number;
  shareType: 'media' | 'manga';
  remoteMediaId?: number | null;
  remoteMangaId?: number | null;
  shareName: string;
  coverUrl?: string | null;
  mangaCount?: number;
  totalSize?: string | null;
  updateTime?: string;
};

// 本地共享配置(对应 p2p_local_share, index 接口附加 group/media/manga 名称)
export type P2PLocalShareType = {
  p2pLocalShareId?: number;
  p2pGroupId: number;
  shareType: 'media' | 'manga';
  mediaId?: number | null;
  mangaId?: number | null;
  shareName: string;
  enable: number;
  announceHash?: string | null;
  createTime?: string;
  updateTime?: string;
  // index 接口附加(后端在 enriched 中加入):
  groupNo?: string;
  groupName?: string;
  mediaName?: string;
  mangaName?: string;
};

// 节点身份
export type P2PIdentityType = {
  nodeId: string;
  nodeName: string;
  role: P2PRole;
  registered: boolean;
  publicUrl?: string;
  trackers?: string[];
};

// 传输任务(对应 p2p_transfer)
export type P2PTransferType = {
  p2pTransferId?: number;
  p2pGroupId?: number;
  transferType: 'media' | 'manga' | 'chapter';
  remoteMediaId?: number | null;
  remoteMangaId?: number | null;
  remoteChapterId?: number | null;
  remoteName: string;
  receivedPath?: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'canceled';
  progress?: number;
  totalBytes?: string | number | null;
  downloadedBytes?: string | number;
  speedBps?: number;
  error?: string | null;
  connectMode?: string | null;
  createTime?: string;
  updateTime?: string;
  startTime?: string | null;
  endTime?: string | null;
};

// 创建群组参数
export type P2PGroupCreateParams = {
  groupName: string;
  describe?: string;
  password?: string;
  maxMembers?: number;
};

// 加入群组参数
export type P2PGroupJoinParams = {
  groupNo: string;
  password?: string;
  inviteCode?: string;
};

// 创建本地共享参数(POST /p2p/share/create)
export type P2PLocalShareCreateParams = {
  groupNo: string;
  shareType: 'media' | 'manga';
  mediaId?: number;
  mangaId?: number;
  shareName?: string;
};

// 更新本地共享参数(PUT /p2p/share/:id)
export type P2PLocalShareUpdateParams = {
  enable?: number;
  shareName?: string;
};

// 发起拉取参数(POST /p2p/transfer/pull)
// 多源 P2P:不再由前端指定具体节点,后端通过 Tracker 自动发现并轮询所有持有该资源的节点
export type P2PPullCreateParams = {
  groupNo: string;
  transferType: 'media' | 'manga' | 'chapter';
  remoteMediaId?: number;
  remoteMangaId?: number;
  remoteChapterId?: number;
  remoteName: string;
  receivedPath?: string;
};

// Tracker 端注册节点(对应 tracker_node)
export type TrackerNodeType = {
  trackerNodeId: number;
  nodeId: string;
  nodeName?: string | null;
  publicUrl?: string | null;
  version?: string | null;
  userAgent?: string | null;
  online: number;
  lastHeartbeat?: string | null;
  totalUpload?: string;
  totalDownload?: string;
  banned: number;
  bannedReason?: string | null;
  groupCount?: number;
  ownedGroupCount?: number;
  shareIndexCount?: number;
  shareManifestCount?: number;
  createTime?: string;
  updateTime?: string;
};
