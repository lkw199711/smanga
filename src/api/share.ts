import { ajax } from './index';
import type { listParamsType } from '@/type/api';

type ShareCreateParams = {
    shareName?: string;
    mangaId?: number;
    mediaId: number;
    expires: number;
    source?: string;
    domain: string;
}

const shareApi = {
    async delete(shareId: number) {
        const res = ajax.delete(`share/${shareId}`);
        return (await res).data;
    },

    async get({ page, pageSize }: listParamsType) {
        const res = ajax.get('share', { data: { page, pageSize } });

        return (await res).data;
    },

    async create({ shareName, mangaId, mediaId, expires, domain, source }: ShareCreateParams) {
        const res = ajax.post('share', {
            shareName,
            mangaId,
            mediaId,
            expires,
            domain,
            source
        });

        return (await res).data;
    }
};

export default shareApi;
