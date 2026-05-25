import { ajax } from './index';
import type { listParamsType } from '@/type/api';
import type {
  P2PGroupCreateParams,
  P2PGroupJoinParams,
  P2PLocalShareCreateParams,
  P2PLocalShareUpdateParams,
  P2PPullCreateParams,
} from '@/type/p2p';

/**
 * P2P 群组管理
 * 后端: /api/p2p/group/*
 */
export const p2pGroupApi = {
  async list(_params?: listParamsType) {
    // 后端 index 未实现分页,返回全部
    const res = await ajax.get('p2p/group');
    return res.data;
  },

  async show(id: number) {
    const res = await ajax.get(`p2p/group/${id}`);
    return res.data;
  },

  async create(params: P2PGroupCreateParams) {
    const res = await ajax.post('p2p/group/create', params);
    return res.data;
  },

  async join(params: P2PGroupJoinParams) {
    const res = await ajax.post('p2p/group/join', params);
    return res.data;
  },

  async leave(groupNo: string) {
    const res = await ajax.post('p2p/group/leave', { groupNo });
    return res.data;
  },

  async refresh() {
    const res = await ajax.post('p2p/group/refresh');
    return res.data;
  },

  /** 获取本机节点身份(nodeId/nodeName) */
  async whoami() {
    const res = await ajax.get('p2p/group/whoami');
    return res.data;
  },

  /** 群组详情(本地 + tracker 最新群信息 + 成员) */
  async detail(groupNo: string) {
    const res = await ajax.get(`p2p/group/by-no/${encodeURIComponent(groupNo)}/detail`);
    return res.data;
  },

  /** 群主踢人(body: {groupNo, targetNodeId}) */
  async kick(groupNo: string, targetNodeId: string) {
    const res = await ajax.post('p2p/group/kick', {groupNo, targetNodeId});
    return res.data;
  },

  /** 群主解散群组(body: {groupNo}) */
  async dismiss(groupNo: string) {
    const res = await ajax.post('p2p/group/dismiss', {groupNo});
    return res.data;
  },
};

/**
 * P2P 本地共享配置
 * 后端: /api/p2p/share/*
 */
export const p2pShareApi = {
  async list(params: listParamsType & { groupNo?: string }) {
    const res = await ajax.get('p2p/share', { params });
    return res.data;
  },

  async create(params: P2PLocalShareCreateParams) {
    const res = await ajax.post('p2p/share/create', params);
    return res.data;
  },

  async update(id: number, params: P2PLocalShareUpdateParams) {
    const res = await ajax.put(`p2p/share/${id}`, params);
    return res.data;
  },

  async destroy(id: number) {
    const res = await ajax.delete(`p2p/share/${id}`);
    return res.data;
  },

  /** 主动重新向 tracker 广播本地某群的索引 */
  async announce(groupNo: string) {
    const res = await ajax.post('p2p/share/announce', { groupNo });
    return res.data;
  },
};

/**
 * P2P 群内对端节点 / 共享索引浏览
 * 后端: /api/p2p/peer/*
 */
export const p2pPeerApi = {
  /** 获取群组成员节点列表(从 tracker 拉取并更新缓存) */
  async members(groupNo: string) {
    const res = await ajax.get(`p2p/peer/members/${encodeURIComponent(groupNo)}`);
    return res.data;
  },

  /** 获取群组共享索引(从 tracker 拉取最新) */
  async shares(groupNo: string) {
    const res = await ajax.get(`p2p/peer/shares/${encodeURIComponent(groupNo)}`);
    return res.data;
  },

  /** 获取本地缓存的成员索引 */
  async cache(groupNo: string) {
    const res = await ajax.get(`p2p/peer/cache/${encodeURIComponent(groupNo)}`);
    return res.data;
  },

  /**
   * 获取群组 manifest 摘要列表(查看详情用)
   * - sync 默认 1: 顺带写入本地 p2p_peer_share_manifest 缓存
   * - fallback=1: tracker 不可达时回落本地缓存
   */
  async manifests(
    groupNo: string,
    opts: { since?: number; nodeId?: string; sync?: 0 | 1; fallback?: 0 | 1 } = {}
  ) {
    const params: Record<string, any> = {};
    if (opts.since) params.since = opts.since;
    if (opts.nodeId) params.nodeId = opts.nodeId;
    if (opts.sync !== undefined) params.sync = opts.sync;
    if (opts.fallback !== undefined) params.fallback = opts.fallback;
    const res = await ajax.get(`p2p/peer/manifests/${encodeURIComponent(groupNo)}`, { params });
    return res.data;
  },

  /** 获取单个 manifest 完整 payload(含元数据/章节/可选文件树) */
  async manifest(
    groupNo: string,
    params: {
      nodeId: string;
      shareType: 'media' | 'manga' | string;
      remoteMediaId?: number | null;
      remoteMangaId?: number | null;
    }
  ) {
    const res = await ajax.get(`p2p/peer/manifest/${encodeURIComponent(groupNo)}`, { params });
    return res.data;
  },

  /** 按需拉取指定 manga 的文件树(payload 被截断时用) */
  async mangaTree(groupNo: string, remoteMangaId: number) {
    const res = await ajax.get(`p2p/peer/manifest/${encodeURIComponent(groupNo)}/manga-tree`, {
      params: { remoteMangaId },
    });
    return res.data;
  },

  /** 按需拉取指定 chapter 的文件树 */
  async chapterTree(groupNo: string, remoteMangaId: number, remoteChapterId: number) {
    const res = await ajax.get(`p2p/peer/manifest/${encodeURIComponent(groupNo)}/chapter-tree`, {
      params: { remoteMangaId, remoteChapterId },
    });
    return res.data;
  },
};

/**
 * P2P 传输任务
 * 后端: /api/p2p/transfer/*
 */
export const p2pTransferApi = {
  async list(params: listParamsType & { status?: string; groupNo?: string }) {
    const res = await ajax.get('p2p/transfer', { params });
    return res.data;
  },

  async show(id: number) {
    const res = await ajax.get(`p2p/transfer/${id}`);
    return res.data;
  },

  async pull(params: P2PPullCreateParams) {
    const res = await ajax.post('p2p/transfer/pull', params);
    return res.data;
  },

  async cancel(id: number) {
    const res = await ajax.post(`p2p/transfer/${id}/cancel`);
    return res.data;
  },

  async retry(id: number) {
    const res = await ajax.post(`p2p/transfer/${id}/retry`);
    return res.data;
  },

  /** 删除单条传输记录 (进行中的会先取消再删除) */
  async destroy(id: number) {
    const res = await ajax.delete(`p2p/transfer/${id}`);
    return res.data;
  },

  /**
   * 批量清理已结束的任务记录
   * @param status 可选,指定只清理某个终态(success | failed | canceled);不传则清理全部已结束记录
   */
  async clear(status?: 'success' | 'failed' | 'canceled') {
    const res = await ajax.post('p2p/transfer/clear', status ? { status } : {});
    return res.data;
  },
};

/**
 * Tracker 管理员接口(本机 web 管理 tracker 上的群组)
 * 后端: /api/tracker-admin/group/*
 * 鉴权: 用户 token + admin 角色;且本机需开启 tracker 角色
 */
export const trackerAdminGroupApi = {
  /** 群组列表(分页) */
  async list(params: {page?: number; pageSize?: number; keyword?: string; enable?: number} = {}) {
    const res = await ajax.get('tracker-admin/group', {params});
    return res.data;
  },

  /** 群组详情(含成员/邀请/索引数) */
  async detail(groupNo: string) {
    const res = await ajax.get(`tracker-admin/group/${encodeURIComponent(groupNo)}`);
    return res.data;
  },

  /** 群组成员列表 */
  async members(groupNo: string) {
    const res = await ajax.get(`tracker-admin/group/${encodeURIComponent(groupNo)}/members`);
    return res.data;
  },

  /** 踢出成员 */
  async kick(groupNo: string, nodeId: string) {
    const res = await ajax.delete(
      `tracker-admin/group/${encodeURIComponent(groupNo)}/member/${encodeURIComponent(nodeId)}`,
    );
    return res.data;
  },

  /** 解散群组 */
  async dismiss(groupNo: string) {
    const res = await ajax.delete(`tracker-admin/group/${encodeURIComponent(groupNo)}`);
    return res.data;
  },
};

/**
 * Tracker 管理员接口(本机 web 管理 tracker 上的注册节点)
 * 后端: /api/tracker-admin/node/*
 */
export const trackerAdminNodeApi = {
  /** 节点列表(分页) */
  async list(params: {page?: number; pageSize?: number; keyword?: string; online?: number; banned?: number} = {}) {
    const res = await ajax.get('tracker-admin/node', {params});
    return res.data;
  },

  /** 节点详情(含所在群组/拥有群组/索引数量) */
  async detail(nodeId: string) {
    const res = await ajax.get(`tracker-admin/node/${encodeURIComponent(nodeId)}`);
    return res.data;
  },

  /** 封禁/解封节点 */
  async ban(nodeId: string, params: {banned: 0 | 1; bannedReason?: string}) {
    const res = await ajax.put(`tracker-admin/node/${encodeURIComponent(nodeId)}/ban`, params);
    return res.data;
  },

  /** 注销节点 */
  async destroy(nodeId: string) {
    const res = await ajax.delete(`tracker-admin/node/${encodeURIComponent(nodeId)}`);
    return res.data;
  },
};

export default {p2pGroupApi, p2pShareApi, p2pPeerApi, p2pTransferApi, trackerAdminGroupApi, trackerAdminNodeApi};
