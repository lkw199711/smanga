import {ajax} from './index';

export function system_init(firstLoad: boolean) {
	return ajax({
		url: 'php/public/init.php',
		data: {firstLoad:firstLoad},
	});
}
