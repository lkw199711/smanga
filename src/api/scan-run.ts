import {ajax} from './index';
import type {ScanReportItem, ScanRun, ScanRunStatus, ScanTemplateCatalog} from '@/type/scan';

type ScanRunQuery = {
  mediaId?: number;
  pathId?: number;
  status?: ScanRunStatus;
};

const scanRunApi = {
  async get(page: number = 1, pageSize: number = 20, params: ScanRunQuery = {}) {
    const res = await ajax.get('scan-run', {params: {page, pageSize, ...params}});
    return res.data as {list: ScanRun[]; count: number};
  },

  async show(scanRunId: number) {
    const res = await ajax.get(`scan-run/${scanRunId}`);
    return res.data.data as ScanRun;
  },

  async items(scanRunId: number, page: number = 1, pageSize: number = 100, params: {level?: string; category?: string} = {}) {
    const res = await ajax.get(`scan-run/${scanRunId}/items`, {params: {page, pageSize, ...params}});
    return res.data as {list: ScanReportItem[]; count: number};
  },

  async catalog() {
    const res = await ajax.get('scan-template');
    return res.data.data as ScanTemplateCatalog;
  },
};

export default scanRunApi;
