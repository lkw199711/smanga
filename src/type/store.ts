export type ObjectFit = 'contain' | 'cover' | 'fill' | 'inherit' | 'initial' | 'none' | 'scale-down' | 'unset';

type pageSizeConfigType = {
	mini: number[];
	small: number[];
	tablet: number[];
	middle: number[];
	large: number[];
	'2k': number[];
	'4k': number[];
};

type screenType = 'mini' | 'small' | 'tablet' | 'middle' | 'large' | '2k' | '4k';

export { pageSizeConfigType, screenType };
