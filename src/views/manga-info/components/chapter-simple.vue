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
	position: relative;
	overflow: hidden;
	cursor: pointer;
	padding: .6rem;
	padding-right: 1.4rem;
	border: 2px solid #ccc;
	border-radius: 1rem;
	text-align: center;
	width: 30rem;
	line-height: 2rem;
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
	}
}
</style>
