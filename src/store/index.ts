import {createStore} from 'vuex'

export default createStore({
    state: {
        chapterAwait: true,
        mangaAwait: true,
    } as any,
    mutations: {
        switch_await(state, {bool = true, running = 'chapterAwait',}) {
            state[running] = bool;
        },
    },
    actions: {},
    modules: {}
})
