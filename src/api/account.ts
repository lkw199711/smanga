import {ajax} from './index';

const userApi = {
	async register(data: any) {
		const res = ajax.post('user', data);

		return (await res).data;
	},

	async get_account(page: number, pageSize: number) {
		const res = ajax.get('user', {params: {page, pageSize}});

		return (await res).data;
	},

	/**
	 * @description: 删除用户
	 * @param {number} targetUserId
	 * @return {*}
	 */
	async delete_account(targetUserId: number) {
		const res = ajax.delete(`user/${targetUserId}`);

		return (await res).data;
	},

	/**
	 * @description: 更新用户信息
	 * @param {any} data
	 * @return {*}
	 */
	async update_account(targetUserId: number, data: any) {
		const res = ajax.put(`user/${targetUserId}`, data);

		return (await res).data;
	},

	async get_user_config() {
		const http = await ajax.get('client-user-config');
		const response = http.data;
		return response.data;
	},

	async update_user_config(data: any) {
		const http = await ajax.put('user-config', data);
		const response = http.data;
		return response.data;
	},

	async get_me() {
		const http = await ajax.get('user/me');
		const response = http.data;
		return response.data;
	},

	/**
	 * @description: 上传用户头像
	 * @param {File} file 图片文件
	 * @return {*} 返回 { header: 'avatars/user_1.png' }
	 */
	async upload_avatar(file: File) {
		const formData = new FormData();
		formData.append('avatar', file);

		const res = ajax({
			url: 'user/avatar',
			method: 'post',
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});

		return (await res).data;
	},
};

export default userApi;
