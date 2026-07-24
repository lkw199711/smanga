export const logoOptions = [
	{ key: 'folded-page', label: '折页 S', shortLabel: '1' },
	{ key: 'panel-flow', label: '漫画分镜', shortLabel: '2' },
	{ key: 'bookmark-burst', label: '书签爆点', shortLabel: '3' },
	{ key: 'twin-pages', label: '双页书脊', shortLabel: '4' },
] as const;

export type LogoVariant = (typeof logoOptions)[number]['key'];
