export const themes = {
    grey: {
        's-back': '#545c64',
        's-text': '#ffffff',
        's-active': '#ffd04b',
        's-hover-back': '#434a50',
        's-active-back': '#434a50',
    },
    black: {
        's-back': '#000000',
        's-text': '#ffffff',
        's-active': '#ffd04b',
        's-hover-back': '#434a50',
        's-active-back': '#434a50',
    },
    white: {
        's-back': '#ffffff',
        's-text': '#333333',
        's-active': '#409eff',
        's-hover-back': '#ecf5ff',
        's-active-back': '#ecf5ff',
    },
    red: {
        's-back': '#f5222d',
        's-text': '#ffffff',
        's-active': '#52c41a',
        's-hover-back': '#cf1322',
        's-active-back': '#cf1322',
    },
    redLight: {
        's-back': '#fa541c',
        's-text': '#ffffff',
        's-active': '#a0d911',
        's-hover-back': '#d4380d',
        's-active-back': '#d4380d',
    },
    orange: {
        's-back': '#fa8c16',
        's-text': '#ffffff',
        's-active': '#1677ff',
        's-hover-back': '#d46b08',
        's-active-back': '#d46b08',
    },
    gold: {
        's-back': '#faad14',
        's-text': '#ffffff',
        's-active': '#1677ff',
        's-hover-back': '#d48806',
    },
    yellow: {
        's-back': '#fadb14',
        's-text': '#333333',
        's-active': '#722ed1',
        's-hover-back': '#d4b106',
    },
    greenLight:{
        's-back': '#a0d911',
        's-text': '#ffffff',
        's-active': '#fa541c',
        's-hover-back': '#7cb305',
    },
    green:{
        's-back': '#52c41a',
        's-text': '#ffffff',
        's-active': '#f5222d',
        's-hover-back': '#389e0d',
    },
    cyan:{
        's-back': '#13c2c2',
        's-text': '#ffffff',
        's-active': '#eb2f96',
        's-hover-back': '#08979c',
    },
    blueLight: {
        's-back': '#1677ff',
        's-text': '#ffffff',
        's-active': '#fa541c',
        's-hover-back': '#0958d9',
    },
    blueDraw: {
        's-back': '#2f54eb',
        's-text': '#ffffff',
        's-active': '#f5222d',
        's-hover-back': '#1d39c4',
    },
    purple:{
        's-back': '#722ed1',
        's-text': '#ffffff',
        's-active': '#fadb14',
        's-hover-back': '#531dab',
    },
    magenta:{
        's-back': '#eb2f96',
        's-text': '#ffffff',
        's-active': '#13c2c2',
        's-hover-back': '#c41d7f',
    },

};


const changeStyle = (obj: any) => {
    for (const key in obj) {
        document
            .getElementsByTagName("body")[0]
            .style.setProperty(`--${key}`, obj[key]);
    }
};
// 改变主题的方法
export const set_theme = (themeName: string) => {
    localStorage.setItem("theme", themeName); // 保存主题到本地，下次进入使用该主题
    // @ts-ignore
    const themeConfig = themes[themeName];
    changeStyle(themeConfig); // 改变样式
};
