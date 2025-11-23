import { Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchBarProps = {
	className?: string;
	placeholder?: string;
	defaultValue?: string;
	autoFocus?: boolean;
	onSearch?: (query: string) => void;
};

export function SearchBar({
	className,
	placeholder = "Search stories",
	defaultValue = "",
	autoFocus = false,
	onSearch,
}: SearchBarProps) {
	const [query, setQuery] = useState(defaultValue);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onSearch?.(query.trim());
	};

	return (
		<form className={cn("relative flex-1", className)} onSubmit={handleSubmit}>
			<Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
			<Input
				type="search"
				value={query}
				onChange={(event) => setQuery(event.target.value)}
				placeholder={placeholder}
				autoFocus={autoFocus}
				className="w-full rounded-full border-gray-200 bg-gray-50 pl-10 pr-24 text-sm"
			/>
			<Button
				type="submit"
				size="sm"
				className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
			>
				<Search className="h-4 w-4" />
			</Button>
		</form>
	);
}
