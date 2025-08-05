import { ajax } from './index';
import type { listParamsType } from '@/type/api';

type SyncCreateParams = {
    syncType: string; // e.g., 'manga', 'media'
    source: string; // e.g., 'sourceName'
    mediaId?: number; // Optional, for media sync
    shareId?: number; // Optional, for share sync
    link?: string; // Optional, for analysis
    secret?: string; // Optional, for analysis
    auto?: number; // Optional, for auto-sync
    token?: string; // Optional, for authentication token
};

const syncApi = {
    async delete(syncId: number) {
        const res = ajax.delete(`sync/${syncId}`);

        return (await res).data;
    },

    async get({ page, pageSize }: listParamsType) {
        const res = ajax.get('sync', { data: { page, pageSize } });

        return (await res).data;
    },

    async create({ syncType, source, mediaId, shareId, link, secret, auto, token }: SyncCreateParams) {
        const res = ajax.post('sync', {
            syncType, source, mediaId, shareId, link, secret, auto, token
        });

        return (await res).data;
    },

    async analysis(shareLink: string) {
        const res = ajax.get(shareLink);

        return (await res).data;
    }
};

export default syncApi;
