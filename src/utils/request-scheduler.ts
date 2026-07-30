export interface ScheduledTaskHandle<T> {
	promise: Promise<T>;
	cancel: () => void;
	promote: (priority: number) => void;
}

interface ScheduledTask<T> {
	order: number;
	priority: number;
	state: 'queued' | 'running' | 'settled';
	controller: AbortController;
	run: (signal: AbortSignal) => Promise<T>;
	resolve: (value: T | PromiseLike<T>) => void;
	reject: (reason?: unknown) => void;
}

export function createAbortError() {
	if (typeof DOMException !== 'undefined') {
		return new DOMException('The request was aborted', 'AbortError');
	}

	const error = new Error('The request was aborted');
	error.name = 'AbortError';
	return error;
}

export function isAbortError(error: unknown) {
	return (
		error instanceof Error &&
		(error.name === 'AbortError' || error.name === 'CanceledError')
	);
}

export class RequestScheduler {
	private queue: Array<ScheduledTask<unknown>> = [];
	private running = 0;
	private concurrency = 1;
	private nextOrder = 0;
	private drainPending = false;

	constructor(concurrency = 1) {
		this.setConcurrency(concurrency);
	}

	setConcurrency(concurrency: number) {
		const parsed = Math.floor(Number(concurrency));
		this.concurrency = Number.isFinite(parsed)
			? Math.min(32, Math.max(1, parsed))
			: 1;
		this.requestDrain();
	}

	schedule<T>(
		run: (signal: AbortSignal) => Promise<T>,
		{priority = 0}: {priority?: number} = {}
	): ScheduledTaskHandle<T> {
		let resolve!: (value: T | PromiseLike<T>) => void;
		let reject!: (reason?: unknown) => void;
		const promise = new Promise<T>((taskResolve, taskReject) => {
			resolve = taskResolve;
			reject = taskReject;
		});
		const task: ScheduledTask<T> = {
			order: this.nextOrder++,
			priority: Number(priority) || 0,
			state: 'queued',
			controller: new AbortController(),
			run,
			resolve,
			reject,
		};

		this.queue.push(task as ScheduledTask<unknown>);
		this.requestDrain();

		return {
			promise,
			cancel: () => {
				if (task.state === 'settled') return;

				if (task.state === 'queued') {
					task.state = 'settled';
					this.queue = this.queue.filter((item) => item !== task);
					task.reject(createAbortError());
					return;
				}

				task.controller.abort();
			},
			promote: (nextPriority: number) => {
				if (task.state !== 'queued') return;
				task.priority = Math.max(task.priority, Number(nextPriority) || 0);
				this.requestDrain();
			},
		};
	}

	private requestDrain() {
		if (this.drainPending) return;
		this.drainPending = true;
		Promise.resolve().then(() => {
			this.drainPending = false;
			this.drain();
		});
	}

	private drain() {
		this.queue.sort(
			(left, right) =>
				right.priority - left.priority || left.order - right.order
		);

		while (this.running < this.concurrency && this.queue.length > 0) {
			const task = this.queue.shift();
			if (!task || task.state !== 'queued') continue;

			task.state = 'running';
			this.running++;

			Promise.resolve()
				.then(() => task.run(task.controller.signal))
				.then(
					(value) => {
						task.state = 'settled';
						task.resolve(value);
					},
					(error) => {
						task.state = 'settled';
						task.reject(error);
					}
				)
				.finally(() => {
					this.running--;
					this.requestDrain();
				});
		}
	}
}
