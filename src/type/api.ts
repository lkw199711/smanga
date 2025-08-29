interface ResType {
	code: number;
	data: any;
	list: [];
	count: number;
	message: string;
	status: string;
	eMsg: string;
	request: string;
}

type listParamsType = {
	page: number;
	pageSize: number;
}

export { ResType, listParamsType };