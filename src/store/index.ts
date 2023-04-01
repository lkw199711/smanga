import {createStore} from 'vuex'
import {reactive} from 'vue'
import {GlobalData} from "@/store/type";
import {get_cookie} from "../utils/index";

export default createStore({
    state: {
        chapterAwait: true,
        mangaAwait: true,
        previewAwait: true,
    } as any,
    mutations: {
        switch_await(state, {bool = true, running = 'chapterAwait',}) {
            state[running] = bool;
        },
    },
    actions: {},
    modules: {},
})

export const globalData: GlobalData = reactive({
    bookmarkList: [],
    chapterList: [],
    imgPathList: [],
    chapterIndex: 0,
    chapterId: 0,
    chapterName: '',
    chapterPath: '',
    chapterType: '',
    chapterCover: '',
    browseType: 'flow',
    mediaId: 0,
    mangaId: 0,
    mangaName: '',
    mangaCover: '',
    page: 0,
    doublePage: 0,
    pageImage: '',
    removeFirst: '0',
    direction: '0',
    loadedImages: 0,
});

const editUser = get_cookie('editUser');
const editMedia = get_cookie('editMedia');

export const config = reactive({
    sidebarCollapse: false,
    browseTop: true,
    browseFooter: true,
    chapterSelect: false,
    browseType: 'flow',
    bookmarkShow: false,
    screenType: 'large', //small | middle | large | 2k | 4k
    rightSidebar: false,
    language: 'zhCn',
    theme: 'grey',
    env: 'web',
    android: false,
    viewType: 'list',
    editUser: editUser==='1',
    editMedia: editMedia==='1',
});

export const cache = reactive({
    bookmarkId: 0,
});
