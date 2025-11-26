export interface Character {
	id: string;
	name: string;
	imageUrl: string;
	isUser?: boolean;
}

export interface TemplateRole {
	id: string;
	name: string;
}

export interface Template {
	id: string;
	name: string;
	description: string;
	image: string;
	videoUrl: string;
	roles: TemplateRole[];
	tags: string[];
}
