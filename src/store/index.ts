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
    chapterList: [],
    chapterIndex: 0,
    chapterId: 0,
    chapterName: '',
    chapterPath: '',
    chapterCover: '',
    mediaId: 0,
    mangaId: 0,
    mangaName: '',
});

export const config = reactive({
    sidebarCollapse: false,
    browseTop: false,
    browseFooter: true,
    browseType: 'flow',
});
