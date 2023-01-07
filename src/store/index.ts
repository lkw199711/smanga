import {createStore} from 'vuex'
import {reactive} from 'vue'
import {GlobalData} from "@/store/type";

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
    pageImage: '',
});

export const config = reactive({
    sidebarCollapse: false,
    browseTop: true,
    browseFooter: true,
    chapterSelect: false,
    browseType: 'flow',
    bookmarkShow: false,
    screenType: 'large',
});

export const cache = reactive({
    bookmarkId: 0,
});
