import type {MetadataProfileInfo, ScanTemplateCatalog, ScanTemplateInfo} from '@/type/scan';

export const fallbackScanTemplates: ScanTemplateInfo[] = [
  {key: 'auto', label: '自动推荐', pattern: 'auto'},
  {key: 'custom', label: '自定义模板规则', pattern: 'custom'},
  {key: 'manga_chapter_image', label: '漫画 > 章节 > 图片', pattern: 'manga > chapter > image'},
  {key: 'manga_image', label: '漫画 > 图片', pattern: 'manga > image'},
  {key: 'category_manga_chapter_image', label: '分类 > 漫画 > 章节 > 图片', pattern: 'category > manga > chapter > image'},
  {key: 'category_manga_image', label: '分类 > 漫画 > 图片', pattern: 'category > manga > image'},
  {key: 'manga_volume_chapter_image', label: '漫画 > 卷/目录 > 章节 > 图片', pattern: 'manga > volume > chapter > image'},
  {key: 'category_manga_volume_chapter_image', label: '分类 > 漫画 > 卷/目录 > 章节 > 图片', pattern: 'category > manga > volume > chapter > image'},
];

export const fallbackMetadataProfiles: MetadataProfileInfo[] = [
  {key: 'auto', label: '自动识别', description: '.smanga 优先，其次 series.json 和 ComicInfo.xml'},
  {key: 'smanga', label: 'SMANGA 元数据', description: '只扫描 .smanga 或 *-smanga-info'},
  {key: 'series-json', label: 'series.json', description: '只扫描漫画目录中的 series.json'},
  {key: 'comicinfo', label: 'ComicInfo.xml', description: '只扫描压缩章节内的 ComicInfo.xml'},
  {key: 'none', label: '不扫描元数据', description: '只建立漫画和章节'},
];

export const fallbackScanCatalog: ScanTemplateCatalog = {
  defaultTemplateKey: 'auto',
  legacyTemplate: {key: 'legacy', label: '兼容旧媒体库设置', pattern: 'legacy'},
  templates: fallbackScanTemplates,
  metadataProfiles: fallbackMetadataProfiles,
};
