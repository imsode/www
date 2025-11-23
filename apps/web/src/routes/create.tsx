import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
	ArrowRight,
	CheckCircle2,
	Loader2,
	Plus,
	RefreshCw,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";

// --- Server Functions ---

// Demo User ID for MVP
const DEMO_USER_ID = "demo-user";

// Fetch the presigned URL for viewing the user's selfie (if it exists)
// In a real app, this would look up the user's selfie key in the DB
export const fetchSelfie = createServerFn({ method: "GET" }).handler(
	async () => {
		// Hardcoded logic for MVP: Check if we have a way to persist this check?
		// Actually, for the MVP without auth, we can't easily "know" if the user has a selfie
		// unless we store a cookie or just assume the demo user logic.
		// Let's try to fetch the selfie for the demo user.
		try {
			const response = await fetch(
				// Assuming the API is running on localhost:3000 for dev, or relative path if proxy
				// For server functions, we need an absolute URL usually, or configured base
				// Let's mock the logic by calling the internal API function if possible,
				// but here we are in the "web" app calling "api" app.
				// For now, let's return null and rely on the client side state for the session
				// UNLESS we actually implemented the persistence fully.
				//
				// Given the instructions, we want persistence.
				// We'll implement a basic fetch to the API.
				`http://localhost:8787/api/selfies/users/${DEMO_USER_ID}/selfies/current.jpg/url`,
			);
			if (response.ok) {
				const data = (await response.json()) as { url: string };
				return data.url;
			}
		} catch {
			// Ignore errors (no selfie found)
		}
		return null;
	},
);

type StartGenerationInput = {
	selfieUrl: string; // This will now be the R2 key ideally, or we pass the URL
	templateId: string;
};

export const startVideoGeneration = createServerFn({ method: "POST" })
	.inputValidator((data: StartGenerationInput) => data)
	.handler(async ({ data }) => {
		console.log("Starting generation with", data);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return { jobId: Math.random().toString(36).substring(7) };
	});

export const checkVideoGenerationStatus = createServerFn({ method: "GET" })
	.inputValidator((data: { jobId: string }) => data)
	.handler(async ({ data }) => {
		console.log("Checking status for job:", data.jobId);
		await new Promise((resolve) => setTimeout(resolve, 500));

		const rand = Math.random();
		if (rand < 0.1)
			return {
				status: "completed",
				videoUrl:
					"https://videos.pexels.com/video-files/6893205/6893205-hd_1080_1920_25fps.mp4",
			};
		if (rand < 0.2) return { status: "failed" };
		return { status: "processing" };
	});

// --- Component ---

export const Route = createFileRoute("/create")({
	component: CreatePage,
});

const TEMPLATES = [
	{
		id: "1",
		name: "Epic Journey",
		description: "Perfect for travel highlights",
		image:
			"https://images.unsplash.com/photo-1469474932796-b494551f87f4?auto=format&fit=crop&w=400&q=80",
	},
	{
		id: "2",
		name: "Daily Vlog",
		description: "Share your day in style",
		image:
			"https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=400&q=80",
	},
	{
		id: "3",
		name: "Cinematic",
		description: "Movie-like atmosphere",
		image:
			"https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=400&q=80",
	},
	{
		id: "4",
		name: "Retro Vibes",
		description: "Vintage aesthetic for cool clips",
		image:
			"https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80",
	},
];

function CreatePage() {
	const [step, setStep] = useState<
		"selfie" | "template" | "generating" | "completed"
	>("selfie");
	// selfieUrl can be a local blob URL (preview) or remote R2 URL
	const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
	const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
		null,
	);
	const [jobId, setJobId] = useState<string | null>(null);
	const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(
		null,
	);

	// Fetch existing selfie from server
	const { data: existingSelfie, isLoading: isLoadingSelfie } = useQuery({
		queryKey: ["selfie"],
		queryFn: () => fetchSelfie(),
		retry: false,
	});

	// Sync server selfie state to local state
	useEffect(() => {
		if (existingSelfie) {
			setSelfieUrl(existingSelfie);
		}
	}, [existingSelfie]);

	// Mutation to start generation
	const startMutation = useMutation({
		mutationFn: startVideoGeneration,
		onSuccess: (data) => {
			setJobId(data.jobId);
			setStep("generating");
		},
	});

	// Polling for status
	const { data: statusData } = useQuery({
		queryKey: ["generationStatus", jobId],
		queryFn: () => checkVideoGenerationStatus({ data: { jobId: jobId ?? "" } }),
		enabled: !!jobId && step === "generating",
		refetchInterval: (query) => {
			const data = query.state.data;
			if (data?.status === "completed" || data?.status === "failed") {
				return false;
			}
			return 2000;
		},
	});

	useEffect(() => {
		if (statusData?.status === "completed" && statusData.videoUrl) {
			setGeneratedVideoUrl(statusData.videoUrl);
			setStep("completed");
		}
	}, [statusData]);

	const handleAddSelf = () => {
		toast.info("Please upload your selfie using the mobile app.");
	};

	const handleRetake = () => {
		setSelfieUrl(null);
	};

	const handleStartGeneration = () => {
		if (selfieUrl && selectedTemplateId) {
			startMutation.mutate({
				data: { selfieUrl, templateId: selectedTemplateId },
			});
		}
	};

	return (
		<div className="flex flex-col min-h-screen bg-neutral-50">
			<header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
				<SidebarTrigger className="rounded-full border border-gray-200" />
				<div>
					<p className="text-lg font-semibold">Create Video</p>
				</div>
			</header>

			<div className="flex-1 container max-w-3xl mx-auto p-4 pb-24">
				{step === "selfie" && (
					<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
						<div className="text-center space-y-2">
							<h2 className="text-2xl font-bold">First, let's get your look</h2>
							<p className="text-gray-500">
								Take a selfie to star in your video.
							</p>
						</div>

						{isLoadingSelfie ? (
							<div className="flex justify-center py-12">
								<Loader2 className="w-8 h-8 animate-spin text-gray-400" />
							</div>
						) : selfieUrl ? (
							<Card className="p-6 flex flex-col items-center gap-6 relative overflow-hidden">
								<div className="relative group">
									<Avatar className="w-64 h-64 border-4 border-white shadow-lg">
										<AvatarImage src={selfieUrl} className="object-cover" />
										<AvatarFallback className="text-4xl bg-gray-100">
											😊
										</AvatarFallback>
									</Avatar>
								</div>

								<div className="flex flex-col w-full gap-3 max-w-xs">
									<Button
										onClick={() => setStep("template")}
										className="w-full rounded-full"
										size="lg"
									>
										Looks Good, Continue <ArrowRight className="ml-2 h-4 w-4" />
									</Button>
									<Button
										onClick={handleRetake}
										variant="outline"
										className="w-full rounded-full"
									>
										<RefreshCw className="mr-2 h-4 w-4" />
										Retake Selfie
									</Button>
								</div>
							</Card>
						) : (
							<Card className="p-12 flex flex-col items-center justify-center gap-6 text-center border-dashed border-2">
								<div className="rounded-full bg-gray-100 p-6">
									<User className="w-12 h-12 text-gray-400" />
								</div>
								<div className="space-y-2">
									<h3 className="font-semibold text-lg">No selfie found</h3>
									<p className="text-sm text-gray-500 max-w-xs mx-auto">
										You haven't uploaded a selfie yet.
									</p>
								</div>
								<Button
									onClick={handleAddSelf}
									size="lg"
									className="rounded-full"
								>
									<Plus className="mr-2 h-4 w-4" />
									Add self
								</Button>
							</Card>
						)}
					</div>
				)}

				{step === "template" && (
					<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
						<div className="text-center space-y-2">
							<h2 className="text-2xl font-bold">Choose a Vibe</h2>
							<p className="text-gray-500">Select a template for your video.</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{TEMPLATES.map((template) => (
								<button
									key={template.id}
									type="button"
									onClick={() => setSelectedTemplateId(template.id)}
									className={`w-full text-left cursor-pointer relative rounded-xl overflow-hidden border-2 transition-all ${selectedTemplateId === template.id ? "border-black ring-2 ring-black ring-offset-2" : "border-transparent hover:border-gray-200"}`}
								>
									<div className="aspect-[9/16] bg-gray-200 relative">
										<img
											src={template.image}
											alt={template.name}
											className="w-full h-full object-cover"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
											<h3 className="text-white font-bold text-lg">
												{template.name}
											</h3>
											<p className="text-white/80 text-sm">
												{template.description}
											</p>
										</div>
										{selectedTemplateId === template.id && (
											<div className="absolute top-2 right-2 bg-black text-white rounded-full p-1">
												<CheckCircle2 size={20} />
											</div>
										)}
									</div>
								</button>
							))}
						</div>
						<div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-10 flex justify-center">
							<Button
								onClick={handleStartGeneration}
								disabled={!selectedTemplateId || startMutation.isPending}
								className="w-full max-w-md rounded-full shadow-lg"
								size="lg"
							>
								{startMutation.isPending ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : null}
								Generate Video
							</Button>
						</div>
					</div>
				)}

				{step === "generating" && (
					<div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in duration-500">
						<div className="relative">
							<div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
							<div className="relative bg-white p-4 rounded-full shadow-xl">
								<Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
							</div>
						</div>
						<div className="text-center space-y-2">
							<h2 className="text-2xl font-bold">Creating Magic...</h2>
							<p className="text-gray-500 max-w-xs mx-auto">
								We are weaving your story. This might take a moment.
							</p>
						</div>
					</div>
				)}

				{step === "completed" && generatedVideoUrl && (
					<div className="space-y-6 animate-in zoom-in-95 duration-500">
						<div className="text-center space-y-2">
							<h2 className="text-2xl font-bold">Your Video is Ready!</h2>
							<p className="text-gray-500">
								Watch, download, or share your creation.
							</p>
						</div>

						<Card className="overflow-hidden bg-black">
							<div className="aspect-[9/16] relative">
								<video
									src={generatedVideoUrl}
									controls
									autoPlay
									loop
									className="w-full h-full object-contain"
								>
									<track kind="captions" />
								</video>
							</div>
						</Card>

						<div className="flex flex-col gap-3">
							<Button asChild size="lg" className="rounded-full w-full">
								<Link to="/">Go to Feed</Link>
							</Button>
							<Button
								variant="outline"
								onClick={() => {
									setStep("selfie");
									setGeneratedVideoUrl(null);
									setJobId(null);
									setSelectedTemplateId(null);
								}}
								className="rounded-full w-full"
							>
								Create Another
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
