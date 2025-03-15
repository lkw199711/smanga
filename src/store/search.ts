import { defineStore } from "pinia"
const useSearchStore = defineStore('search', {
    state: () => ({
        searchText: '',
        searchType: 'manga',
    }),
    getters: {},
    actions: {},
})

export default useSearchStore;