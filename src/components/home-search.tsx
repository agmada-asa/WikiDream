"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { searchWikipedia } from "@/lib/wikipedia"
import { cn } from "@/lib/utils"

const SUGGESTED_TOPICS = [
    "Quantum mechanics",
    "The Roman Empire",
    "Artificial intelligence",
    "James Webb Space Telescope",
    "World War II",
    "Renaissance",
    "Theory of relativity",
    "Ancient Egypt",
    "Industrial Revolution",
    "Apollo 11",
]

export function HomeSearch({ className }: { className?: string }) {
    const [query, setQuery] = React.useState("")
    const [results, setResults] = React.useState<string[]>([])
    const [topicIndex, setTopicIndex] = React.useState(0)
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasTyped, setHasTyped] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        if (!query) {
            setResults([])
            return
        }
        const timer = setTimeout(async () => {
            const data = await searchWikipedia(query)
            setResults(data)
        }, 300)
        return () => clearTimeout(timer)
    }, [query])

    React.useEffect(() => {
        const interval = setInterval(() => {
            setTopicIndex((prev) => (prev + 1) % SUGGESTED_TOPICS.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const handleSelect = React.useCallback((title: string) => {
        router.push(`/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`)
    }, [router])

    return (
        <div className={cn("w-full max-w-2xl relative", className)}>
            <div className="relative isolate group rounded-2xl bg-background/50 backdrop-blur-md shadow-2xl transition-all duration-300 hover:shadow-primary/5 border border-border/50">
                <Command
                    shouldFilter={false}
                    className="rounded-2xl border-none bg-transparent overflow-visible"
                    loop
                >
                    <div className="relative flex items-center px-6" cmdk-input-wrapper="">
                        <Search className="mr-4 h-6 w-6 shrink-0 opacity-50" />
                        <CommandPrimitive.Input
                            placeholder=""
                            value={query}
                            onValueChange={(val) => {
                                setQuery(val)
                                setHasTyped(val.length > 0)
                            }}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="flex h-20 w-full bg-transparent px-0 py-4 text-xl outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 !border-0 focus:ring-0"
                        />
                        {!hasTyped && (
                            <div className="pointer-events-none absolute left-16 flex items-center space-x-2 text-xl text-muted-foreground/80 overflow-hidden h-20 w-[calc(100%-4rem)]">
                                <div className="relative inline-block w-full overflow-hidden h-[1.5em]">
                                    {SUGGESTED_TOPICS.map((topic, index) => (
                                        <div
                                            key={topic}
                                            className={cn(
                                                "absolute inset-0 flex items-center transition-all duration-500 ease-in-out whitespace-nowrap",
                                                index === topicIndex
                                                    ? "translate-y-0 opacity-100"
                                                    : "-translate-y-full opacity-0"
                                            )}
                                            style={{
                                                transitionDelay: index === topicIndex ? "0s" : "0s",
                                                transform: index === topicIndex ? 'translateY(0)' : index < topicIndex ? 'translateY(-100%)' : 'translateY(100%)'
                                            }}
                                        >
                                            <span className="font-medium text-foreground/70">{topic}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Only show results if we have query and results, and it's focused */}
                    <div
                        className={cn(
                            "absolute top-full left-0 right-0 mt-2 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300 z-50",
                            (isFocused || query.length > 0) && results.length > 0 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
                        )}
                    >
                        <CommandList className="max-h-[300px] p-2">
                            {query.length > 0 && results.length === 0 && (
                                <CommandEmpty className="p-4 text-center text-sm text-muted-foreground">
                                    No results found for "{query}".
                                </CommandEmpty>
                            )}
                            <CommandGroup>
                                {results.map((title) => (
                                    <CommandItem
                                        key={title}
                                        value={title}
                                        onSelect={handleSelect}
                                        className="rounded-lg px-4 py-3 text-base cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
                                    >
                                        <Search className="mr-3 h-4 w-4 opacity-40" />
                                        {title}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </div>
                </Command>
            </div>
        </div>
    )
}
