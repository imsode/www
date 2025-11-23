import { createFileRoute } from "@tanstack/react-router";
import { Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_layout/upload")({
	component: UploadPage,
});

function UploadPage() {
	return (
		<div className="flex flex-1 flex-col bg-neutral-50 pb-[3.5rem] sm:pb-0">
			<header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
				<SidebarTrigger className="rounded-full border border-gray-200" />
				<div>
					<p className="text-lg font-semibold">Upload a story</p>
					<p className="text-sm text-gray-500">Vertical videos work best</p>
				</div>
			</header>

			<div className="flex flex-1 justify-center px-4 py-6">
				<Card className="w-full max-w-2xl bg-white">
					<CardHeader>
						<CardTitle>Share something new</CardTitle>
						<CardDescription>
							Drop a short vertical clip or selfie to appear in the feed.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<p className="text-sm font-medium">Video</p>
							<label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-center text-sm text-gray-500 transition hover:border-gray-300 hover:bg-white">
								<Video className="mb-3 h-8 w-8 text-gray-400" />
								<span className="font-semibold text-gray-700">
									Drag & drop or browse files
								</span>
								<span className="text-xs text-gray-500">MP4 · up to 60s</span>
								<input type="file" accept="video/*" className="hidden" />
							</label>
						</div>

						<div className="space-y-2">
							<p className="text-sm font-medium">Caption</p>
							<Textarea
								placeholder="Tell viewers what's happening..."
								className="min-h-[120px] resize-none rounded-2xl border-gray-200 bg-gray-50"
							/>
						</div>
					</CardContent>
					<CardFooter className="flex justify-end gap-3 border-t border-gray-100 pt-6">
						<Button variant="outline" className="rounded-full border-gray-200">
							Cancel
						</Button>
						<Button className="rounded-full bg-gray-900 text-white hover:bg-gray-800">
							<Upload className="mr-2 h-4 w-4" />
							Publish
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
