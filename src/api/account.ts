import {ajax} from './index';

export function register(data: any) {
	return ajax({
		url: 'php/account/register.php',
		data,
	});
}

export function get_account(recordStart: number, pageSize: number) {
	return ajax({
		url: 'php/account/get.php',
		data: {recordStart, pageSize},
	});
}

export function delete_account(targetUserId: number) {
	return ajax({
		url: 'php/account/delete.php',
		data: {
			targetUserId,
		},
	});
}

export function update_account(data: any) {
	return ajax({
		url: 'php/account/update.php',
		data,
	});
}

export function login(data: any) {
	return ajax({
		url: 'php/account/login.php',
		data,
	});
}

export function get_user_config() {
    return ajax({
		url: 'php/user-setting/get.php',
	});
}

export function set_user_config(userName: string, configValue: string) {
	return ajax({
		url: 'php/user-setting/set.php',
		data: {userName, configValue},
	});
}
