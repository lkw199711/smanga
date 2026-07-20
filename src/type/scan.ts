export type ScanTemplateKey =
  | 'legacy'
  | 'auto'
  | 'custom'
  | 'manga_chapter_image'
  | 'manga_image'
  | 'category_manga_chapter_image'
  | 'category_manga_image'
  | 'manga_volume_chapter_image'
  | 'category_manga_volume_chapter_image';

export type MetadataProfileKey = 'auto' | 'smanga' | 'series-json' | 'comicinfo' | 'none';
export type ScanRunStatus = 'pending' | 'running' | 'success' | 'failed';
export type ScanReportLevel = 'info' | 'warning' | 'error';

export interface ScanTemplateInfo {
  key: ScanTemplateKey;
  label: string;
  pattern: string;
  mangaIndex?: number;
  chapterIndex?: number | null;
  singleChapter?: boolean;
}

export interface MetadataProfileInfo {
  key: MetadataProfileKey;
  label: string;
  description: string;
}

export interface ScanTemplateCatalog {
  defaultTemplateKey: ScanTemplateKey;
  activeEngine?: 'legacy' | 'template-v1' | 'template-v2';
  engines?: Array<'legacy' | 'template-v1' | 'template-v2'>;
  configVersion?: number;
  legacyTemplate: ScanTemplateInfo;
  templates: ScanTemplateInfo[];
  metadataProfiles: MetadataProfileInfo[];
}

export interface ScanPreviewInput {
  pathContent: string;
  mediaId?: number;
  mediaType?: number;
  directoryFormat?: number;
  autoScan?: number;
  include?: string;
  exclude?: string;
  scanTemplateKey?: ScanTemplateKey;
  scanTemplateConfig?: string;
  metadataProfileKey?: MetadataProfileKey;
  metadataProfileConfig?: string;
  isCloudMedia?: number;
}

export interface DiscoveredChapter {
  chapterName: string;
  chapterPath: string;
}

export interface DiscoveredManga {
  mangaName: string;
  mangaPath: string;
  parentPath: string;
  chapters: DiscoveredChapter[];
}

export interface ScanTemplateCandidate {
  key: ScanTemplateKey;
  label: string;
  pattern: string;
  mangaFound: number;
  chapterFound: number;
  score: number;
}

export interface ScanReportItem {
  scanRunItemId?: number;
  scanRunId?: number;
  level: ScanReportLevel;
  category: string;
  targetType: string;
  action?: string | null;
  reasonCode?: string | null;
  reason?: string | null;
  targetName?: string | null;
  targetPath?: string | null;
  extraJson?: string | null;
  createTime?: string;
}

export interface ScanSummary {
  mangaFound: number;
  chapterFound: number;
  skipped: number;
  warnings: number;
  errors: number;
  [key: string]: unknown;
}

export interface ScanPreviewResult {
  ok: boolean;
  summary: ScanSummary;
  template: ScanTemplateInfo;
  templateCandidates: ScanTemplateCandidate[];
  metadataSummary: {
    smanga: number;
    smangaSidecar: number;
    seriesJson: number;
    comicInfoCandidate: number;
  };
  mangas: DiscoveredManga[];
  samples: DiscoveredManga[];
  items: ScanReportItem[];
}

export interface ScanRun {
  scanRunId: number;
  runType: string;
  triggerType: string;
  status: ScanRunStatus;
  mediaId?: number | null;
  pathId?: number | null;
  pathContent?: string | null;
  configSnapshot?: string | null;
  summaryJson?: string | null;
  message?: string | null;
  error?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  expectedTasks?: number;
  completedTasks?: number;
  failedTasks?: number;
  createTime: string;
  updateTime: string;
}

export interface ScanTriggerResult {
  pathId: number;
  scanRunId: number;
}
