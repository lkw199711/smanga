<template>
	<div :class="['chapter', sourceWebsite]">
		<!--章节名称-->
		<p class="chapter-name single-line-text-overflow">{{ chapterName }}</p>
	</div>
</template>

<script lang="ts">
export default { name: 'manga-chapter-item' }
</script>
<script lang="ts" setup>
import { ref } from "vue";

const props = defineProps(['chapterInfo', 'bookmark', 'sourceWebsite']);
const chapterName = ref(props.chapterInfo.chapterName);


</script>

<style scoped lang="less">
.chapter {
	box-sizing: border-box;
	position: relative;
	overflow: hidden;
	cursor: pointer;
	width: 100%;
	padding: 1rem 1.4rem;
	border: 1px solid color-mix(in srgb, @s-border 82%, transparent);
	border-radius: 1rem;
	background: var(--s-back-soft-original, #f9f9f9);
	color: @s-back-text;
	line-height: 2rem;
	transition:
		transform 160ms ease,
		border-color 160ms ease,
		background-color 160ms ease,
		box-shadow 160ms ease;

	&:hover {
		transform: translateY(-1px);
		border-color: color-mix(in srgb, @s-primary 38%, transparent);
		background: color-mix(in srgb, @s-primary 5%, var(--s-back-soft-original, #f9f9f9));
		box-shadow: 0 .4rem 1.2rem fade(#000000, 6%);
	}

	.chapter-name {
		margin: 0;
	}
}

.anim {
	opacity: 0;
	animation: mymove 1s ease-in forwards;
}

@keyframes mymove {
	10% {
		opacity: 0.1;
	}

	50% {
		opacity: 0.5;
	}

	60% {
		opacity: 0.6;
	}

	90% {
		opacity: 0.9;
	}

	100% {
		opacity: 1;
	}
}

@media only screen and (min-width: 1920px) {

}

@media only screen and (max-width: 1919px) and (min-width: 1200px) {

}

@media only screen and (max-width: 1199px) and (min-width: 768px) {

}

@media only screen and (max-width: 767px) {
	.chapter {
		width: 100%;
		padding: .8rem 1rem;
	}
}
</style>
