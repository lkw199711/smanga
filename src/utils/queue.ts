/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-10-26 01:36:09
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-26 02:13:07
 * @FilePath: /smanga/src/utils/queue.ts
 */

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
            requestFunction!();
			// console.error(error);
		} finally {
			this.running--;
			this.run();
		}
	}
}

export default Queue;
