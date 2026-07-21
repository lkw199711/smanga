import {userConfig} from '@/store';
import {ajax} from './index';
import type {ResType} from '@/type/api';

interface chapterGetRes extends ResType {
  list: [];
  count: number;
}

type chapterGetParamsType = {
  mangaId: number;
  mediaId?: number;
  page?: number;
  pageSize?: number;
  order?: string;
  keyWord?: string;
};

const chapterApi = {
	/**
	 * @description: 获取单个章节，用于从主题阅读入口恢复旧阅读器所需的路由参数
	 */
	async get_by_id(chapterId: number) {
		const res = await ajax.get(`chapter/${chapterId}`);
		return res.data?.data || {};
	},

  get: async function ({mangaId, mediaId = 0, page = 0, pageSize = 0, order = 'number', keyWord = ''}: chapterGetParamsType) {
    const res = await ajax.get('chapter', {
      params: {mangaId, mediaId, page, pageSize, order, keyWord},
    });
    const resData: chapterGetRes = res.data;

    return {
      list: resData.list || [],
      count: resData.count || 0,
    };
  },

  /**
   * @description: 获取漫画第一章
   * @param {number} mangaId
   * @param {string} order
   * @return {*}
   */
  async get_first(mangaId: number, order: string) {
    const res = await ajax({
      url: `chapter-first`,
      params: {mangaId, order},
    });

    const response = res.data;
    return response.data || {};
  },

  async get_images(chapterId: number, reTry: number) {
    const res = ajax({
      url: `chapter-images/${chapterId}`,
      params: {
        chapterId: chapterId,
        reTry: reTry,
        orderChapterByNumber: userConfig.orderChapterByNumber ? 1 : undefined,
      },
      timeout: 30 * 1000,
    });

    const data = (await res).data;

    return {
      list: data.data,
      count: data.count,
      state: data.status,
    };
  },

  /**
   * 修改章节记录
   * @param data
   */
  async update_chapter(data: any) {
    const res = ajax.put(`chapter/${data.chapterId}`, data);

    return (await res).data;
  },

  /**
   * 删除章节记录
   * @param chapterId
   * @param deleteFile
   */
  async delete_chapter(chapterId: any, deleteFile = false) {
    const res = ajax.delete(`chapter/${chapterId}`, {params: {deleteFile}});

    return (await res).data;
  },

  /**
   * 批量删除章节记录
   * @param chapterIds 章节ID数组
   * @param deleteFile 是否删除文件
   */
  async batch_delete_chapter(chapterIds: number[], deleteFile = false) {
    const res = ajax.delete(`chapter/${chapterIds.join(',')}/batch`, {data: {chapterIds, deleteFile}});

    return (await res).data;
  },
  /**
   * @description: 删除漫画章节压缩文件
   * @param {number} chapterId
   * @return {*}
   */
  async compress_delete(chapterId: number) {
    const res = ajax.delete(`chapter/${chapterId}/compress`, {data: {chapterId}});
    return (await res).data;
  },
};

type chapterGetFormatType = {
  list: [];
  count: number;
};

export default chapterApi;
