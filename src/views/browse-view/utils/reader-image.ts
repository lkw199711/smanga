/**
 * Load and decode a reader image before it is swapped into the visible page.
 * Keeping the current page mounted until this resolves avoids placeholder flashes.
 */
export async function loadReaderImage(src: string): Promise<HTMLImageElement> {
	if (!src) throw new Error('Reader image source is empty');

	const image = new Image();
	image.decoding = 'async';
	image.src = src;

	if (typeof image.decode === 'function') {
		try {
			await image.decode();
			return image;
		} catch {
			if (image.complete) {
				if (image.naturalWidth > 0) return image;
				throw new Error('Reader image failed to decode');
			}
		}
	}

	if (!image.complete) {
		await new Promise<void>((resolve, reject) => {
			image.addEventListener('load', () => resolve(), {once: true});
			image.addEventListener('error', () => reject(new Error('Reader image failed to load')), {once: true});
		});
	}

	if (image.naturalWidth <= 0) throw new Error('Reader image has no drawable content');
	return image;
}

export async function preloadReaderImage(src: string): Promise<void> {
	if (!src) return;
	await loadReaderImage(src);
}
