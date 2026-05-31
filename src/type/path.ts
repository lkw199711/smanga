type pathType = {
    pathId: number;
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
    scanTemplateKey?: string;
    scanTemplateConfig?: string;
    metadataProfileKey?: string;
    metadataProfileConfig?: string;
    pathContent: string;
}

export { pathType };
