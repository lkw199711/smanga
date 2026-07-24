<template>
	<svg
		class="smanga-logo-mark"
		viewBox="0 0 32 32"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<template v-if="variant === 'folded-page'">
			<path
				d="M3.75 6.5C8.4 5.15 12.7 5.85 16 9.15V27.1C12.55 24.4 8.5 23.85 3.75 25.25V6.5Z"
				stroke="currentColor"
				stroke-width="2.6"
				stroke-linejoin="round"
			/>
			<path
				d="M16 9.2C19.25 5.85 23.25 5.05 28.25 3.8V10.65C23.05 11.05 19.6 12.25 19.6 14.85C19.6 16.65 21.5 17.25 24.05 18.05C27 18.95 28.55 20.4 28.15 22.85C27.7 25.7 24.15 27.35 18.05 26.55V22.5C22.1 23.15 24.25 22.7 24.4 21.55C24.55 20.55 23.15 20.15 21.2 19.55C17.95 18.55 16 17.2 16 14.1V9.2Z"
				fill="currentColor"
			/>
			<path d="M8 11.1C10.35 10.8 12.25 11.3 13.8 12.55M8 16.1C10.35 15.8 12.25 16.3 13.8 17.55" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" opacity=".55" />
		</template>

		<template v-else-if="variant === 'panel-flow'">
			<path d="M4 5.5L25.75 3.75L24.9 12.75L18.45 14.1C15.7 14.65 13.9 16.1 12.4 17.55L5.15 18.9L4 5.5Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" />
			<path d="M7.1 21.1L13.55 19.75C16.3 19.2 18.1 17.75 19.6 16.3L26.85 14.95L28 26.5L6.25 28.25L7.1 21.1Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" />
			<path d="M8 10.2L18.9 9.3M13.1 23.1L24 22.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".45" />
		</template>

		<template v-else-if="variant === 'bookmark-burst'">
			<path d="M15 5H26V27L20.5 23L15 27V5Z" fill="currentColor" />
			<path d="M12.5 9L7 5.5L9.2 12L3.5 11L9 15L3 18L10.5 18.2L7.5 25L13.3 20" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round" />
		</template>

		<template v-else>
			<path d="M3.5 5.25H8.25C11.55 5.25 14.05 7.6 15.25 9V27C13.4 25.25 11.15 24.25 8.25 24.25H3.5V5.25Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" />
			<path d="M28.5 5.25H23.75C20.45 5.25 17.95 7.6 16.75 9V27C18.6 25.25 20.85 24.25 23.75 24.25H28.5V5.25Z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" />
			<path d="M7.5 19.2L12.2 21.3V16.35L7.5 14.25V19.2ZM24.5 19.2L19.8 21.3V16.35L24.5 14.25V19.2Z" fill="currentColor" opacity=".45" />
		</template>
	</svg>
</template>

<script lang="ts" setup>
import type { LogoVariant } from './logo-options';

withDefaults(defineProps<{
	variant?: LogoVariant;
}>(), {
	variant: 'twin-pages',
});
</script>

<style scoped>
.smanga-logo-mark {
	display: block;
	flex: 0 0 auto;
	width: 1em;
	height: 1em;
	overflow: visible;
}
</style>
