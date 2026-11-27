import Axios from 'axios';
import {watch} from 'vue';
import {url, ajax} from '@/api';
import {Cookies} from '@/utils';
import useImageStore from '@/store/image';
import {userConfig} from '@/store';
import pinia from '@/store/pinia';
import {
	createAbortError,
	isAbortError,
	RequestScheduler,
	type ScheduledTaskHandle,
} from '@/utils/request-scheduler';
import placeholder from '@/assets/s-blue-high.png';

const img = Axios.create({
	baseURL: url + '/image',
	timeout: 15 * 1000,
	method: 'post',
	responseType: 'blob',
	params: {},
	headers: {
		'Content-Type': 'application/json; charset=UTF-8',
	},
	transformRequest: [
		(data, headers) => {
			headers['token'] = Cookies.getToken();
			const timestamp = new Date().getTime();
			data = data || {};
			data = Object.assign(data, {timestamp});
			return JSON.stringify(data);
		},
	],
	transformResponse: [
		function (data, _headers, status) {
			if (status && status >= 400) return data;
			data = data || {};
			return URL.createObjectURL(data);
		},
	],
});

const imageCache = useImageStore(pinia);

interface ImageGetOptions {
	file: string;
	saveCache?: boolean;
	again?: boolean;
	priority?: number;
	signal?: AbortSignal;
}

interface CoverGetOptions extends Omit<ImageGetOptions, 'file'> {
	kind: 'manga' | 'chapter' | 'meta';
	id?: number | string;
	file?: string;
	version?: string;
	cacheOnly?: boolean;
}

interface PendingImageRequest {
	file: string;
	saveCache: boolean;
	maxAttempts: number;
	priority: number;
	consumers: Set<symbol>;
	handle: ScheduledTaskHandle<string>;
}

const imageScheduler = new RequestScheduler(
	Number(userConfig.loadCoverConcurrency) || 1
);
const pendingImages = new Map<string, PendingImageRequest>();

watch(
	() => userConfig.loadCoverConcurrency,
	(concurrency) => imageScheduler.setConcurrency(Number(concurrency)),
	{immediate: true}
);

function waitForRetry(signal: AbortSignal, duration = 200) {
	return new Promise<void>((resolve, reject) => {
		if (signal.aborted) {
			reject(createAbortError());
			return;
		}

		const abort = () => {
			window.clearTimeout(timer);
			reject(createAbortError());
		};
		const timer = window.setTimeout(() => {
			signal.removeEventListener('abort', abort);
			resolve();
		}, duration);
		signal.addEventListener('abort', abort, {once: true});
	});
}

function consumeImageRequest(
	entry: PendingImageRequest,
	signal?: AbortSignal
): Promise<string> {
	if (signal?.aborted) return Promise.reject(createAbortError());

	const consumer = Symbol(entry.file);
	entry.consumers.add(consumer);

	return new Promise<string>((resolve, reject) => {
		let settled = false;

		const release = () => {
			entry.consumers.delete(consumer);
			if (entry.consumers.size === 0) {
				if (pendingImages.get(entry.file) === entry) {
					pendingImages.delete(entry.file);
				}
				entry.handle.cancel();
			}
		};
		const finish = (callback: (value: any) => void, value: any) => {
			if (settled) return;
			settled = true;
			signal?.removeEventListener('abort', abort);
			release();
			callback(value);
		};
		const abort = () => finish(reject, createAbortError());

		signal?.addEventListener('abort', abort, {once: true});
		entry.handle.promise.then(
			(value) => finish(resolve, value),
			(error) => finish(reject, error)
		);
	});
}

function getOrCreateImageRequest({
	file,
	key = file,
	coverUrl,
	saveCache = true,
	again = true,
	priority = 0,
}: Omit<ImageGetOptions, 'signal'> & {key?: string; coverUrl?: string}) {
	const existing = pendingImages.get(key);
	if (existing) {
		existing.saveCache ||= saveCache;
		existing.maxAttempts = Math.max(existing.maxAttempts, again ? 2 : 1);
		existing.priority = Math.max(existing.priority, Number(priority) || 0);
		existing.handle.promote(existing.priority);
		return existing;
	}

	let entry!: PendingImageRequest;
	const handle = imageScheduler.schedule(
		async (signal) => {
			const cached = imageCache.get(key);
			if (cached) return cached;

			for (let attempt = 0; attempt < entry.maxAttempts; attempt++) {
				if (signal.aborted) throw createAbortError();

				try {
					const response = coverUrl
						? await img({url: coverUrl, signal})
						: await img({data: {file}, signal});
					if (signal.aborted) throw createAbortError();

					if (entry.saveCache) {
						imageCache.set(
							key,
							response.data,
							Number(userConfig.imageCacheLimit) || 0
						);
					}
					return response.data;
				} catch (error) {
					if (signal.aborted || Axios.isCancel(error) || isAbortError(error)) {
						throw createAbortError();
					}
					if (coverUrl && Axios.isAxiosError(error) && [400, 401, 403, 404].includes(error.response?.status ?? 0)) break;

					if (attempt + 1 < entry.maxAttempts) {
						await waitForRetry(signal);
					}
				}
			}

			return coverUrl ? '' : placeholder;
		},
		{priority}
	);

	entry = {
		file: key,
		saveCache,
		maxAttempts: again ? 2 : 1,
		priority: Number(priority) || 0,
		consumers: new Set(),
		handle,
	};
	pendingImages.set(key, entry);

	const cleanup = () => {
		if (pendingImages.get(key) === entry) pendingImages.delete(key);
	};
	handle.promise.then(cleanup, cleanup);

	return entry;
}

const imageApi = {
	async get({
		file,
		saveCache = true,
		again = true,
		priority = 0,
		signal,
	}: ImageGetOptions): Promise<any> {
		if (!file) return false;
		if (signal?.aborted) throw createAbortError();

		const cached = imageCache.get(file);
		if (cached) return cached;

		const entry = getOrCreateImageRequest({
			file,
			saveCache,
			again,
			priority,
		});
		return consumeImageRequest(entry, signal);
	},

	async getCover({kind, id, file = '', version, cacheOnly = false, signal, ...options}: CoverGetOptions): Promise<string> {
		const coverId = Number(id);
		if (!Number.isSafeInteger(coverId) || coverId <= 0) return this.get({file, signal, ...options});
		if (signal?.aborted) throw createAbortError();
		const key = JSON.stringify(['cover', kind, coverId, file, version, cacheOnly]);
		const cached = imageCache.get(key);
		if (cached) return cached;
		const entry = getOrCreateImageRequest({
			file,
			key,
			coverUrl: `cover/${kind}/${coverId}${cacheOnly ? '?cacheOnly=1' : ''}`,
			...options,
		});
		return consumeImageRequest(entry, signal);
	},

	async get_from({file, origin, again = true}: any): Promise<any> {
		if (!file) return false;

		const cached = imageCache.get(file);
		if (cached) return cached;

		const [res, err] = await img({
			url: `${origin}/file`,
			data: {file},
			method: 'get',
			params: {file},
		})
			.then((response) => [response, null])
			.catch((error) => [null, error]);

		if (res) {
			imageCache.set(file, res.data, Number(userConfig.imageCacheLimit) || 0);
			return res.data;
		}

		if (err && again) {
			return this.get_from({file, origin, again: false});
		}

		return placeholder;
	},

	async chapter_img(
		file: string,
		page: number,
		chapterId: number,
		mangaId: number
	) {
		if (!file) return false;
		const res = await img({data: {file, page, chapterId, mangaId}});
		return res.data;
	},

	async upload({
		file,
		chapterId = '',
		mangaId = '',
		mediaId = '',
	}: {
		file: File;
		chapterId?: string;
		mangaId?: string;
		mediaId?: string;
	}) {
		const formData = new FormData();
		formData.append('image', file);
		formData.append('chapterId', chapterId);
		formData.append('mangaId', mangaId);
		formData.append('mediaId', mediaId);

		const res = ajax({
			url: 'image/upload',
			method: 'post',
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});

		return (await res).data?.data?.filePath || '';
	},
};

export default imageApi;
