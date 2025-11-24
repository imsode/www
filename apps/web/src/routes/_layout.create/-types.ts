export interface Character {
	id: string;
	name: string;
	imageUrl: string;
	isUser?: boolean;
}

export interface Template {
	id: string;
	name: string;
	description: string;
	image: string;
	roles: string[]; // e.g. ["Hero", "Partner"]
	tags: string[];
}
