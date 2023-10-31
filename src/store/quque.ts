/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-10-26 03:47:24
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-26 04:45:53
 * @FilePath: /smanga/src/store/quque.ts
 */

import {reactive} from 'vue';

/**
 * @description: ts队列系统
 * @return {*}
 */
class Queue {
	private queue: Array<() => Promise<void>> = [];
	private running = 0;
	private concurrency: number;

	constructor(concurrency = 1) {
		this.concurrency = concurrency;
	}

	add(requestFunction: () => Promise<void>) {
		this.queue.push(requestFunction);
		this.run();
	}

	private async run() {
		if (this.running >= this.concurrency || this.queue.length === 0) {
			return;
		}

		this.running++;
		const requestFunction = this.queue.shift();

		try {
			await requestFunction!();
		} catch (error) {
			console.log('队列错误处理');

			requestFunction!();
			// console.error(error);
		} finally {
			this.running--;
			this.run();
		}
	}

	clear() {
		this.queue = [];
	}
}

const globalQueue = new Queue();
const mangaQueue = new Queue();
const chapterQueue = new Queue();
const queue = reactive({
	globalQueue,
	mangaQueue,
	chapterQueue,
	clear() {
		globalQueue.clear();
		mangaQueue.clear();
		chapterQueue.clear();
	},
});

export default queue;
