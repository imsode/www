// ================================
// Storyboard
// ================================

export type StoryboardId = string;

type AspectRatio = "9:16" | "16:9" | "1:1";

export type Storyboard = {
	id: StoryboardId;
	title: string;
	description: string;
	aspectRatio: AspectRatio; // probably always "9:16" for your app, but good to keep
	scenes: Scene[];
	roles: Role[];
	tags: string[];
};

type SceneId = string;

type SceneAudioConfig = {
	dialogue?: {
		roleId: string;
		text: string;
	}[];
	ambienceTrackKey?: string;
	sfxTrackKey?: string;
};

export type Scene = {
	id: SceneId;
	storyboardId: StoryboardId;
	order: number;

	// Prompts
	firstFramePrompt: string; // prompt for generating the very first frame of THIS scene
	scenePrompt: string; // prompt for motion / style / story for the whole scene

	// Timing / layout
	durationSeconds: number; // target length of this scene

	// Visual / style hints (optional but useful)
	cameraStyle?: string; // e.g. "slow dolly-in", "handheld", "static close-up"
	locationHint?: string; // e.g. "on a rainy street", "in a cozy café"
	mood?: string; // e.g. "romantic", "dramatic", "comedy"

	// Audio linkage
	audioConfig?: SceneAudioConfig; // FK → template_audio / track segment, if you split audio per scene

	// Roles in this scene
	roles: Role[];
};

export type Role = {
	id: string;
	name: string;
	displayName: string;
	description?: string;
};

// ================================
// Video Generation
// ================================

export type Actor = {
	id: string;
	name: string;
	image: {
		key: string;
	};
};

export type GenerationRoleBinding = {
	role: Role;
	actor?: Actor;
};

export type GenerationSceneSpec = {
	sceneId: SceneId; // Scene.id
	order: number; // Scene.order

	// Prompts
	firstFramePrompt: string; // Scene.firstFramePrompt
	scenePrompt: string; // Scene.scenePrompt

	// Timing
	durationSeconds: number; // Scene.durationSeconds

	// Style hints
	cameraStyle?: string; // Scene.cameraStyle
	locationHint?: string; // Scene.locationHint
	mood?: string; // Scene.mood

	// Audio
	audioSegmentId?: string; // Scene.audioSegmentId

	// Role bindings for THIS generation
	roles: GenerationRoleBinding[];
};

export type GenerationRequest = {
	generationId: string;
	storyboardId: StoryboardId;
	userId: string;

	aspectRatio: AspectRatio; // from Storyboard.aspectRatio

	model: "wan-2.2" | "wan-2.5" | "kling" | "sora-proxy" | string;
	outputFormat: "mp4" | "mov";
	outputStorageKey: string; // where final video will be stored

	scenes: GenerationSceneSpec[];

	globalNegativePrompt?: string;
	stylePreset?: string;

	audioConfig?: {
		bgmTrackKey?: string;
		ttsScript?: string;
		ttsVoiceId?: string;
	};

	specVersion: number;
	metadata?: Record<string, any>;
};
