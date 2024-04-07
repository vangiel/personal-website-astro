export interface Publication {
	title: string;
	author: Array<string>;
	year: string;
	in: string;
	abstract: string;
	type: string;
	key: string;
	url: string;
	download: string;
	month?: string;
	day?: string;
	language?: string;
	booktitle?: string;
	publisher?: string;
	address?: string;
}
