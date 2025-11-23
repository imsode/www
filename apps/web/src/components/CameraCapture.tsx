import { RefreshCw, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CameraCaptureProps {
	onCapture: (imageUrl: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	// Use a ref to store the stream so we can access it in cleanup/stop without triggering re-renders
	const streamRef = useRef<MediaStream | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isStreaming, setIsStreaming] = useState(false);

	const stopCamera = useCallback(() => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => {
				track.stop();
			});
			streamRef.current = null;
			setIsStreaming(false);
		}
	}, []);

	const startCamera = useCallback(async () => {
		setError(null);
		// Stop any existing stream first
		stopCamera();

		try {
			const newStream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: "user",
					width: { ideal: 1280 },
					height: { ideal: 720 },
				},
				audio: false,
			});
			streamRef.current = newStream;
			setIsStreaming(true);
			if (videoRef.current) {
				videoRef.current.srcObject = newStream;
			}
		} catch (err) {
			console.error("Error accessing camera:", err);
			setError(
				"Could not access camera. Please ensure permissions are granted.",
			);
		}
	}, [stopCamera]);

	const capturePhoto = useCallback(() => {
		if (videoRef.current) {
			const canvas = document.createElement("canvas");
			canvas.width = videoRef.current.videoWidth;
			canvas.height = videoRef.current.videoHeight;
			const ctx = canvas.getContext("2d");
			if (ctx) {
				// Mirror the image to match the user-facing camera view
				ctx.translate(canvas.width, 0);
				ctx.scale(-1, 1);
				ctx.drawImage(videoRef.current, 0, 0);
				const imageUrl = canvas.toDataURL("image/jpeg");
				onCapture(imageUrl);
				stopCamera();
			}
		}
	}, [onCapture, stopCamera]);

	useEffect(() => {
		startCamera();
		return () => {
			stopCamera();
		};
	}, [startCamera, stopCamera]);

	return (
		<Card className="w-full max-w-md mx-auto overflow-hidden bg-black relative aspect-[3/4] flex flex-col items-center justify-center rounded-3xl shadow-2xl">
			{error ? (
				<div className="text-center p-6 space-y-4 bg-white rounded-xl mx-4">
					<XCircle className="w-12 h-12 text-red-500 mx-auto" />
					<p className="text-red-600 font-medium">{error}</p>
					<Button onClick={startCamera} variant="outline">
						<RefreshCw className="w-4 h-4 mr-2" />
						Retry Camera
					</Button>
				</div>
			) : (
				<>
					<video
						ref={videoRef}
						autoPlay
						playsInline
						muted
						className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
					/>
					<div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
						<Button
							onClick={capturePhoto}
							size="lg"
							className="h-16 w-16 rounded-full border-4 border-white bg-transparent hover:bg-white/20 transition-all p-1"
							disabled={!isStreaming}
							aria-label="Take Photo"
						>
							<div className="w-full h-full bg-white rounded-full" />
						</Button>
					</div>
				</>
			)}
		</Card>
	);
}
