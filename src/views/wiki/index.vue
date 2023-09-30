<!--
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-10-01 01:40:03
 * @LastEditors: lkw199711 lkw199711@163.com
 * @LastEditTime: 2023-10-01 01:40:03
 * @FilePath: /smanga/src/views/wiki/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
	<div class="wiki">
		<div class="version">
			当前版本
			<span class="version-text">{{ version }} -- 4</span>
		</div>
		<div class="content">
			<p>
				github:
				<a href="https://github.com/lkw199711/smanga" target="_blank"
					>https://github.com/lkw199711/smanga</a
				>
			</p>
			<p>
				docker:
				<a href="https://hub.docker.com/r/lkw199711/smanga" target="_blank"
					>https://hub.docker.com/r/lkw199711/smanga</a
				>
			</p>

			<p>qq: <a href="https://jq.qq.com/?_wv=1027&k=CaeWd6im" target="_blank">534086782</a></p>
			<p>tg: <a href="https://t.me/+FFgQ7AMIdrg2M2Y1" target="_blank">https://t.me/+FFgQ7AMIdrg2M2Y1</a></p>
			<p>版本发布频道(tg): <a href="https://t.me/smangachannel" target="_blank">https://t.me/smangachannel</a></p>
		</div>
		<div class="content">媒体库名称</div>
		<div class="content op-demo">
			<operationCover />
		</div>
	</div>
</template>

<script src="./script/index.ts" lang="ts"></script>

<style src="./style/index.less" scoped lang="less"></style>
