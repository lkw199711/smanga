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
};

export default { p2pGroupApi, p2pShareApi, p2pPeerApi, p2pTransferApi };