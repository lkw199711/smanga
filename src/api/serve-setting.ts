import {ajax} from './index';

export function interval_set(interval: string) {
	return ajax({
		url: 'serve/scan/set',
		data: {interval},
	});
}

export function interval_get() {
	return ajax({
		url: 'serve/scan/get',
	});
}
