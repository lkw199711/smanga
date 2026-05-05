/**
 * P2P 相关前端类型定义
 */

export type P2PRole = 'node' | 'tracker' | 'both';

// 群组
export type P2PGroupType = {
  p2pGroupId?: number;
  groupNo: string;
  groupName: string;
  describe?: string;
  password?: string;
  trackerUrl?: string;
  ownerNodeId?: string;
  isOwner?: number;
  maxMembers?: number;
  memberCount?: number;
  shareCount?: number;
  createTime?: string;
  updateTime?: string;
};

// 群内节点
export type P2PPeerNodeType = {
  nodeId: string;
  nodeName: string;
  publicHost?: string;
  publicPort?: number;
  localHost?: string;
  localPort?: number;
  online?: number;
  lastSeen?: string;
  shareCount?: number;
};

// 共享索引项 (tracker 聚合)
export type P2PShareIndexType = {
  shareId?: number | string;
  nodeId: string;
  nodeName?: string;
  groupNo: string;
  shareType: 'media' | 'manga';
  mediaId?: number;
  mediaName?: string;
  mangaId?: number;
  mangaName?: string;
  mangaCount?: number;
  chapterCount?: number;
  updateTime?: string;
};

// 本地共享配置 (本机暴露给群组的资源)
export type P2PLocalShareType = {
  p2pLocalShareId?: number;
  p2pGroupId: number;
  groupNo?: string;
  groupName?: string;
  shareType: 'media' | 'manga';
  mediaId?: number;
  mediaName?: string;
  mangaId?: number;
  mangaName?: string;
  enable: number;
  createTime?: string;
  updateTime?: string;
};

// 节点身份
export type P2PIdentityType = {
  nodeId: string;
  nodeName: string;
  role: P2PRole;
  registered: boolean;
  publicHost?: string;
  publicPort?: number;
  localHost?: string;
  localPort?: number;
  trackers?: string[];
};

// 传输任务
export type P2PTransferType = {
  p2pTransferId?: number;
  transferType: 'pull' | 'push';
  resourceType: 'media' | 'manga' | 'chapter';
  resourceId?: number;
  resourceName?: string;
  fromNodeId?: string;
  toNodeId?: string;
  p2pGroupId?: number;
  groupNo?: string;
  receivedPath?: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'canceled';
  progress?: number;
  total?: number;
  current?: number;
  errorMessage?: string;
  createTime?: string;
  updateTime?: string;
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

// 创建本地共享参数
export type P2PLocalShareCreateParams = {
  p2pGroupId: number;
  shareType: 'media' | 'manga';
  mediaId?: number;
  mangaId?: number;
  enable?: number;
};

// 发起拉取参数
export type P2PPullCreateParams = {
  p2pGroupId: number;
  fromNodeId: string;
  resourceType: 'media' | 'manga' | 'chapter';
  resourceId: number;
  receivedPath: string;
  resourceName?: string;
};