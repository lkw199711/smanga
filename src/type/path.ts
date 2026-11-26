import type {MetadataProfileKey, ScanTemplateKey} from './scan';
import type {StorageRoot} from './storage-root';

type pathType = {
    pathId: number;
    mediaId: number;
    storageRootId?: number | null;
    storageRoot?: StorageRoot | null;
    resolvedPath?: string | null;
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
