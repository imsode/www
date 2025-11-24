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
	videoUrl: string;
	roles: string[]; // e.g. ["Hero", "Partner"]
	tags: string[];
}
