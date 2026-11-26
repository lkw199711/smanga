import provider115Icon from '@/assets/storage-providers/115生活.png'
import provider123Icon from '@/assets/storage-providers/123云盘.png'
import providerAliyunIcon from '@/assets/storage-providers/阿里云盘.png'
import providerBaiduIcon from '@/assets/storage-providers/百度网盘.png'
import providerQuarkIcon from '@/assets/storage-providers/夸克网盘.png'
import providerOneDriveIcon from '@/assets/storage-providers/Microsoft OneDrive.png'

export interface StorageRootPreset {
  providerKey: string
  name: string
  iconKey: string
  iconText: string
  iconSrc?: string
  description: string
  pathPlaceholder: string
}

export const storageRootPresets: StorageRootPreset[] = [
  {
    providerKey: '115',
    name: '115 网盘',
    iconKey: 'provider-115',
    iconText: '115',
    iconSrc: provider115Icon,
    description: '适合飞牛 fnOS 中已挂载的 115 网盘目录',
    pathPlaceholder: '例如：/vol1/.../115（以飞牛实际挂载目录为准）',
  },
  {
    providerKey: '123-cloud',
    name: '123 云盘',
    iconKey: 'provider-123',
    iconText: '123',
    iconSrc: provider123Icon,
    description: '使用系统或容器中已经挂载的 123 云盘目录',
    pathPlaceholder: '请输入服务器上的实际挂载目录',
  },
  {
    providerKey: 'aliyun-drive',
    name: '阿里云盘',
    iconKey: 'provider-aliyun',
    iconText: '☁',
    iconSrc: providerAliyunIcon,
    description: '使用系统或容器中已经挂载的阿里云盘目录',
    pathPlaceholder: '请输入服务器上的实际挂载目录',
  },
  {
    providerKey: 'baidu-netdisk',
    name: '百度网盘',
    iconKey: 'provider-baidu',
    iconText: '☁',
    iconSrc: providerBaiduIcon,
    description: '使用系统或容器中已经挂载的百度网盘目录',
    pathPlaceholder: '请输入服务器上的实际挂载目录',
  },
  {
    providerKey: 'quark-drive',
    name: '夸克网盘',
    iconKey: 'provider-quark',
    iconText: '☁',
    iconSrc: providerQuarkIcon,
    description: '使用系统或容器中已经挂载的夸克网盘目录',
    pathPlaceholder: '请输入服务器上的实际挂载目录',
  },
  {
    providerKey: 'onedrive',
    name: 'Microsoft OneDrive',
    iconKey: 'provider-onedrive',
    iconText: '☁',
    iconSrc: providerOneDriveIcon,
    description: '使用系统或容器中已经挂载的 OneDrive 目录',
    pathPlaceholder: '请输入服务器上的实际挂载目录',
  },
  {
    providerKey: 'smb',
    name: 'SMB / NAS',
    iconKey: 'storage-nas',
    iconText: '🗄',
    description: '适合 NAS、SMB 或 NFS 等网络挂载目录',
    pathPlaceholder: '例如：/mnt/nas/manga',
  },
  {
    providerKey: 'webdav',
    name: 'WebDAV 挂载',
    iconKey: 'storage-cloud',
    iconText: '🌐',
    description: '使用操作系统中已经挂载的 WebDAV 目录',
    pathPlaceholder: '请输入服务器上的实际挂载目录',
  },
  {
    providerKey: 'local',
    name: '本地磁盘',
    iconKey: 'storage-disk',
    iconText: '💽',
    description: '本机硬盘、移动硬盘或 Docker 挂载目录',
    pathPlaceholder: '例如：/mnt/media 或 D:\\Media',
  },
  {
    providerKey: 'custom',
    name: '自定义',
    iconKey: 'storage-folder',
    iconText: '📁',
    description: '未列出的网盘或其他自定义存储位置',
    pathPlaceholder: '请输入服务器上的绝对路径',
  },
]

export const storageRootIcons = [
  { key: 'provider-115', label: '115', text: '115', src: provider115Icon },
  { key: 'provider-123', label: '123 云盘', text: '123', src: provider123Icon },
  { key: 'provider-aliyun', label: '阿里云盘', text: '☁', src: providerAliyunIcon },
  { key: 'provider-baidu', label: '百度网盘', text: '☁', src: providerBaiduIcon },
  { key: 'provider-quark', label: '夸克网盘', text: '☁', src: providerQuarkIcon },
  { key: 'provider-onedrive', label: 'Microsoft OneDrive', text: '☁', src: providerOneDriveIcon },
  { key: 'storage-cloud', label: '云端', text: '☁' },
  { key: 'storage-nas', label: 'NAS', text: '🗄' },
  { key: 'storage-disk', label: '磁盘', text: '💽' },
  { key: 'storage-folder', label: '文件夹', text: '📁' },
]

export function storageRootIconText(iconKey: string): string {
  return storageRootIcons.find((item) => item.key === iconKey)?.text || '📁'
}

export function storageRootIconSource(iconKey: string): string | undefined {
  return storageRootIcons.find((item) => item.key === iconKey)?.src
}
