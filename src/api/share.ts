import { ajax } from './index';
import type { listParamsType } from '@/type/api';

type ShareCreateParams = {
    shareName?: string;
    mangaId?: number;
    mediaId: number;
    expires: number;
    origin: string;
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

    async create({ shareName, mangaId, mediaId, expires, domain, origin }: ShareCreateParams) {
        const res = ajax.post('share', {
            shareName,
            mangaId,
            mediaId,
            expires,
            domain,
            origin
        });

        return (await res).data;
    },
    
    /**
     * 批量删除漫画分享记录
     * @param shareIds 要删除的分享ID数组
     * @returns 删除结果
     */
    async batch_delete(shareIds: number[]) {
        const res = ajax.post(`share/${shareIds.join(',')}/batch`, {
            ids: shareIds
        });
        return (await res).data;
    }
};

export default shareApi;
