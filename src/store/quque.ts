import {reactive} from 'vue';
import { userConfig } from '.';

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
const mangaQueue = new Queue(userConfig.loadCoverConcurrency);
const chapterQueue = new Queue(userConfig.loadCoverConcurrency);
const flowQueue = new Queue(1);
const saveLatestQueue = new Queue(1);
const queue = reactive({
	globalQueue,
	mangaQueue,
	chapterQueue,
	flowQueue,
	saveLatestQueue,
	clear() {
		globalQueue.clear();
		mangaQueue.clear();
		chapterQueue.clear();
		flowQueue.clear();
		saveLatestQueue.clear();
	},
});

export default queue;
