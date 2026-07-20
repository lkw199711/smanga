import type {MetadataProfileKey, ScanTemplateKey} from './scan';

type pathType = {
    pathId: number;
    mediaId: number;
    pathName: string;
    pathType: number;
    pathLink: string;
    pathCover: string;
    createTime: string;
    updateTime: string;
    describe: string;
    directoryFormat: number;
    autoScan: number;
    include?: string;
    exclude?: string;
    scanTemplateKey?: ScanTemplateKey;
    scanTemplateConfig?: string;
    metadataProfileKey?: MetadataProfileKey;
    metadataProfileConfig?: string;
    pathContent: string;
}

export { pathType };
