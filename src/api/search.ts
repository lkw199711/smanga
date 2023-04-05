import { ajax } from "./index";

export function search(searchText: string, searchType: string,recordStart: number, pageSize: number,order='') {
	return ajax({
		url: 'php/search/index.php',
		data: {searchText, searchType, recordStart, pageSize, order},
	});
}
