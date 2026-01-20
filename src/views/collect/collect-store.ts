import { defineStore } from "pinia"
const useSearchStore = defineStore('collect', {
    state: () => ({
        searchText: '',
        searchType: 'manga',
        collectType: 'manga',
    }),
    getters: {},
    actions: {},
})

export default useSearchStore;