"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowLeft } from "lucide-react"

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
    const inputRef = React.useRef<HTMLInputElement>(null)

    const isActive = isFocused || query.length > 0

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
        <div className={cn("w-full max-w-2xl", className, isActive && "z-50")}>
            {isActive && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity sm:hidden"
                    onClick={() => {
                        setQuery("")
                        setIsFocused(false)
                        inputRef.current?.blur()
                    }}
                />
            )}

            <div className={cn(
                "isolate group transition-all duration-300",
                isActive
                    ? "fixed left-0 right-0 top-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-2xl sm:relative sm:block sm:rounded-2xl sm:bg-background/50 sm:border sm:shadow-2xl"
                    : "relative rounded-2xl bg-background/50 backdrop-blur-md shadow-2xl hover:shadow-primary/5 border border-border/50"
            )}>
                <Command
                    shouldFilter={false}
                    className="flex flex-col h-full bg-transparent overflow-visible sm:block sm:h-auto border-none !rounded-none sm:!rounded-2xl"
                    loop
                >
                    <div className={cn(
                        "relative flex items-center px-4 sm:px-6 transition-all",
                        isActive ? "h-[calc(4rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] sm:h-20 sm:pt-0 border-b border-border/50 sm:border-none" : "h-20"
                    )} cmdk-input-wrapper="">
                        {isActive ? (
                            <button
                                onClick={() => {
                                    setQuery("")
                                    setIsFocused(false)
                                    inputRef.current?.blur()
                                }}
                                className="mr-3 sm:hidden p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 opacity-70" />
                            </button>
                        ) : null}

                        <Search className={cn(
                            "shrink-0 opacity-50 transition-all",
                            isActive ? "hidden sm:block mr-4 h-6 w-6" : "mr-4 h-6 w-6"
                        )} />

                        <CommandPrimitive.Input
                            ref={inputRef}
                            placeholder=""
                            value={query}
                            onValueChange={(val) => {
                                setQuery(val)
                                setHasTyped(val.length > 0)
                            }}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="flex h-full w-full bg-transparent px-0 py-4 text-xl outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 !border-0 focus:ring-0"
                        />
                        {!hasTyped && (
                            <div className={cn(
                                "pointer-events-none absolute flex items-center space-x-2 text-xl text-muted-foreground/80 overflow-hidden",
                                isActive ? "left-14 sm:left-16 w-[calc(100%-4rem)] sm:w-[calc(100%-4rem)] inset-y-0 pt-[env(safe-area-inset-top,0px)] sm:pt-0" : "left-16 w-[calc(100%-4rem)] inset-y-0"
                            )}>
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
                            "overflow-hidden transition-all duration-300",
                            (isActive && (results.length > 0 || query.length > 0))
                                ? "max-h-[calc(100dvh-4rem-env(safe-area-inset-top,0px))] opacity-100 sm:absolute sm:top-full sm:left-0 sm:right-0 sm:mt-2 sm:rounded-xl sm:border sm:border-border/50 sm:bg-background/95 sm:backdrop-blur-xl sm:shadow-2xl sm:max-h-[300px]"
                                : "max-h-0 opacity-0 sm:-translate-y-2 pointer-events-none"
                        )}
                    >
                        <CommandList className={cn(
                            "p-2",
                            isActive && "overflow-y-auto max-h-[calc(100dvh-4rem-env(safe-area-inset-top,0px))] sm:max-h-[300px]"
                        )}>
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
                                        onSelect={(val) => {
                                            handleSelect(title)
                                            setQuery("")
                                            setIsFocused(false)
                                            inputRef.current?.blur()
                                        }}
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
