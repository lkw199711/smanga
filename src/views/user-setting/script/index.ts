import {config} from '@/store';
import {useI18n} from 'vue-i18n';
import {set_theme, themes} from '@/style/theme';
import theme from '@/store/theme';
import languages from '@/store/language';
import {pageSizeConfig} from '@/store';
import {ref} from 'vue';
const {locale} = useI18n();

const form = ref({removeFirst: 0, range1: 30});

// 排序方式
const sortOrder = ['name', 'nameDesc', 'time', 'timeDesc'];

function language_change(val: string) {
	locale.value = val;
	localStorage.setItem('language', val);
}

function theme_change(val: string) {
	set_theme(val);
	localStorage.setItem('theme', val);
}

function theme_color(theme: string) {
	// @ts-ignore
	const color = themes[theme]['s-back'];
	return {
		backgroundColor: color,
	};
}

function sort_order_change(val: string) {}