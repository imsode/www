import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { signIn } from "@/lib/auth/auth-client";

export const Route = createFileRoute("/login")({
	component: LoginPage,
	validateSearch: (search: Record<string, unknown>) => ({
		redirect: (search.redirect as string) || "/",
	}),
});

function LoginPage() {
	const navigate = useNavigate();
	const { redirect } = Route.useSearch();
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true);
		setError(null);
		try {
			await signIn.social({
				provider: "google",
				callbackURL: redirect,
			});
		} catch {
			setError("Failed to sign in with Google. Please try again.");
			setIsGoogleLoading(false);
		}
	};

	const handleEmailSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const result = await signIn.email({
				email: formData.email,
				password: formData.password,
			});

			if (result.error) {
				setError(result.error.message || "Invalid email or password.");
				setIsLoading(false);
				return;
			}

			navigate({ to: redirect });
		} catch {
			setError("An unexpected error occurred. Please try again.");
			setIsLoading(false);
		}
	};

	return (
		<div className="relative min-h-screen flex items-center justify-center overflow-hidden">
			{/* Animated background */}
			<div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900">
				{/* Subtle grid pattern */}
				<div
					className="absolute inset-0 opacity-[0.03]"
					style={{
						backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
						backgroundSize: "64px 64px",
					}}
				/>
				{/* Gradient orbs */}
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
				<div
					className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl animate-pulse"
					style={{ animationDelay: "1s" }}
				/>
				<div
					className="absolute top-1/2 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			{/* Content */}
			<div className="relative z-10 w-full max-w-md px-6 py-12">
				{/* Logo & Branding */}
				<div className="text-center mb-10">
					<Link to="/" className="inline-block">
						<div className="flex items-center justify-center gap-3 mb-4">
							<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
								<img
									src="/logo192.png"
									alt="Your Story"
									className="w-7 h-7 rounded-sm object-cover"
								/>
							</div>
						</div>
						<h1
							className="text-3xl font-bold text-white tracking-tight"
							style={{ fontFamily: "Lexend Deca, sans-serif" }}
						>
							Your Story
						</h1>
					</Link>
					<p className="text-slate-400 mt-2 text-sm">
						Create cinematic stories with AI
					</p>
				</div>

				{/* Auth Card */}
				<div className="neo-glass rounded-2xl p-8 shadow-2xl shadow-black/50">
					<h2
						className="text-xl font-semibold text-white mb-6 text-center"
						style={{ fontFamily: "Lexend Deca, sans-serif" }}
					>
						Welcome back
					</h2>

					{/* Error message */}
					{error && (
						<div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
							{error}
						</div>
					)}

					{/* Google Sign In */}
					<Button
						type="button"
						variant="outline"
						className="w-full h-11 bg-white hover:bg-slate-100 text-slate-900 border-0 font-medium"
						onClick={handleGoogleSignIn}
						disabled={isGoogleLoading || isLoading}
					>
						{isGoogleLoading ? (
							<Spinner className="text-slate-900" />
						) : (
							<>
								<svg className="w-5 h-5" viewBox="0 0 24 24">
									<title>Google</title>
									<path
										fill="currentColor"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="#34A853"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="#FBBC05"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="#EA4335"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
								Continue with Google
							</>
						)}
					</Button>

					{/* Divider */}
					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-slate-700" />
						</div>
						<div className="relative flex justify-center text-xs">
							<span className="bg-transparent px-3 text-slate-500 backdrop-blur-sm">
								or sign in with email
							</span>
						</div>
					</div>

					{/* Email Form */}
					<form onSubmit={handleEmailSignIn} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email" className="text-slate-300 text-sm">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								value={formData.email}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, email: e.target.value }))
								}
								required
								className="h-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password" className="text-slate-300 text-sm">
								Password
							</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={formData.password}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, password: e.target.value }))
								}
								required
								className="h-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
							/>
						</div>

						<Button
							type="submit"
							className="w-full h-11 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium border-0 shadow-lg shadow-violet-500/25"
							disabled={isLoading || isGoogleLoading}
						>
							{isLoading ? <Spinner /> : "Sign in"}
						</Button>
					</form>

					{/* Sign up link */}
					<p className="mt-6 text-center text-sm text-slate-400">
						Don't have an account?{" "}
						<Link
							to="/signup"
							search={{ redirect }}
							className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
						>
							Create one
						</Link>
					</p>
				</div>

				{/* Footer */}
				<p className="text-center text-xs text-slate-600 mt-8">
					By continuing, you agree to our Terms of Service and Privacy Policy
				</p>
			</div>
		</div>
	);
}
