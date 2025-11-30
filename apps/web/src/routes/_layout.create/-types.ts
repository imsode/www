export interface Actor {
	id: string;
	name: string;
	imageUrl: string;
	isUser?: boolean;
}

export interface StoryboardRole {
	id: string;
	name: string;
}

export interface Storyboard {
	id: string;
	name: string;
	description: string;
	previewImageUrl: string;
	previewVideoUrl: string;
	roles: StoryboardRole[];
	tags: string[];
}
