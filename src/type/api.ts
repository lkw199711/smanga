export type ApiDateTimeString = string;

export type ApiBookmark = {
  bookmarkId: number;
  mediaId: number;
  mangaId: number;
  chapterId: number;
  userId: number;
  browseType: string;
  page: number;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
  pageImage?: string | null;
};

export type ApiChapter = {
  chapterId: number;
  mangaId: number;
  mediaId: number;
  pathId: number;
  browseType: string;
  subTitle?: string | null;
  picNum?: number | null;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
  chapterName: string;
  chapterPath: string;
  chapterType: string;
  chapterCover?: string | null;
  chapterNumber?: string | null;
  deleteFlag: number;
  outCovers?: string[];
  latest?: ApiLatest | null;
};

export type ApiCollect = {
  collectId: number;
  collectType: string;
  userId: number;
  mediaId: number;
  mangaId: number;
  mangaName?: string | null;
  chapterId?: number | null;
  chapterName?: string | null;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
};

export type ApiCompress = {
  compressId: number;
  compressType: string;
  compressPath: string;
  compressStatus?: string | null;
  imageCount?: number | null;
  mediaId: number;
  mangaId: number;
  chapterId: number;
  chapterPath: string;
  userId?: number | null;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
};

export type ApiHistory = {
  historyId: number;
  userId: number;
  mediaId: number;
  mangaId: number;
  mangaName?: string | null;
  chapterId: number;
  chapterName?: string | null;
  chapterPath?: string | null;
  browseType: string;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
};

export type ApiLatest = {
  latestId: number;
  page: number;
  count?: number | null;
  finish: number;
  mangaId: number;
  chapterId: number;
  userId: number;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
  nextChapter?: ApiChapter;
};

export type ApiLog = {
  logId: number;
  logType: string;
  logLevel: number;
  module?: string | null;
  queue?: string | null;
  message: string;
  exception?: string | null;
  version: string;
  environment: string;
  context?: string | null;
  device?: string | null;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
  userId?: number | null;
};

export type ApiLogin = {
  loginId: number;
  userId?: number | null;
  userName?: string | null;
  nickName?: string | null;
  request: number;
  ip: string;
  userAgent?: string | null;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
  token?: string | null;
};

export type ApiMangaTag = {
  mangaTagId: number;
  mangaId: number;
  tagId: number;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
};

export type ApiMeta = {
  metaId: number;
  metaName: string;
  mangaId: number;
  chapterId?: number | null;
  metaFile?: string | null;
  metaContent?: string | null;
  description?: string | null;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
};

export type ApiManga = {
  mangaId: number;
  mediaId: number;
  pathId: number;
  mangaName: string;
  mangaPath: string;
  parentPath?: string | null;
  mangaCover?: string | null;
  mangaNumber?: string | null;
  chapterCount: number;
  browseType: string;
  direction: number;
  removeFirst: number;
  title?: string | null;
  subTitle?: string | null;
  author?: string | null;
  describe?: string | null;
  publishDate?: ApiDateTimeString | null;
  deleteFlag: number;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
  chapterUpdate: ApiDateTimeString;
  metas?: ApiMeta[];
  tags?: ApiTag[];
  outCovers?: string[];
};

export type ApiMedia = {
  mediaId: number;
  mediaName: string;
  mediaType: number;
  mediaRating: string;
  mediaCover?: string | null;
  sourceWebsite?: string | null;
  isCloudMedia: number;
  directoryFormat: number;
  browseType: string;
  direction: number;
  removeFirst: number;
  deleteFlag: number;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
};

export type ApiMediaPermisson = {
  mediaPermissonId: number;
  userId: number;
  mediaId: number;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
};

export type ApiPath = {
  pathId: number;
  mediaId: number;
  pathType?: string | null;
  autoScan: number;
  include?: string | null;
  exclude?: string | null;
  lastScanTime?: ApiDateTimeString | null;
  deleteFlag: number;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
  pathContent: string;
};

export type ApiScan = {
  scanId: number;
  scanStatus: string;
  targetPath?: string | null;
  pathId: number;
  scanCount?: number | null;
  scanIndex?: number | null;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
  pathContent: string;
};

export type ApiShare = {
  shareId: number;
  shareType: string;
  shareName: string;
  origin: string;
  userId?: number | null;
  mediaId: number;
  mangaId?: number | null;
  link: string;
  secret: string;
  expires?: ApiDateTimeString | null;
  enable: number;
  whiteList?: string | null;
  blackList?: string | null;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
};

export type ApiSync = {
  syncId: number;
  syncType: string;
  syncName: string;
  receivedPath: string;
  origin: string;
  userId?: number | null;
  shareId: number;
  link: string;
  secret: string;
  auto: number;
  token?: string | null;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
};

export type ApiTag = {
  tagId: number;
  tagName: string;
  tagColor: string;
  userId?: number | null;
  description?: string | null;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
};

export type ApiTask = {
  taskId: number;
  taskName: string;
  command: string;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
  status: string;
  args?: string | null;
  startTime?: ApiDateTimeString | null;
  endTime?: ApiDateTimeString | null;
  error?: string | null;
  priority: number;
};

export type ApiTaskFailed = {
  taskId: number;
  taskName: string;
  status: string;
  command: string;
  args?: string | null;
  startTime?: ApiDateTimeString | null;
  endTime?: ApiDateTimeString | null;
  error?: string | null;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
};

export type ApiTaskSuccess = {
  taskId: number;
  taskName: string;
  status: string;
  command: string;
  args?: string | null;
  startTime?: ApiDateTimeString | null;
  endTime?: ApiDateTimeString | null;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
};

export type ApiToken = {
  tokenId: number;
  userId: number;
  token: string;
  expires?: ApiDateTimeString | null;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
};

export type ApiUser = {
  userId: number;
  userName: string;
  passWord: string;
  nickName?: string | null;
  header?: string | null;
  role?: string | null;
  mediaPermit?: string | null;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
  userConfig?: string | null;
};

export type ApiUserPermisson = {
  userPermissonId: number;
  userId: number;
  module: string;
  operation: string;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
};

export type ApiVersion = {
  versionId: number;
  version: string;
  description?: string | null;
  createTime: ApiDateTimeString;
  updateTime: ApiDateTimeString;
};

export interface ResType<TData = unknown, TItem = unknown, TError = unknown> {
  code: number;
  message: string;
  data?: TData;
  list?: TItem[];
  count?: number;
  status?: string;
  error?: TError;
  eMsg?: string;
  request?: string;
}

export type listParamsType = {
  page?: number;
  pageSize?: number;
};
