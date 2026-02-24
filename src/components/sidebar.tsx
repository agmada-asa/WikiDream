"use client"

import * as React from "react"
import { BookOpen } from "lucide-react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    onNavigate?: () => void
}

interface TocItem {
    id: string
    text: string
    level: number
}

export function Sidebar({ className, onNavigate, ...props }: SidebarProps) {
    const [toc, setToc] = React.useState<TocItem[]>([])
    const [activeId, setActiveId] = React.useState<string>("")
    const pathname = usePathname()

    React.useEffect(() => {
        const timer = setTimeout(() => {
            const headings = Array.from(document.querySelectorAll(".wiki-body h2, .wiki-body h3"))

            const items = headings.map((heading) => {
                const headlineSpan = heading.querySelector(".mw-headline")
                const id = headlineSpan?.id || heading.id
                const text = headlineSpan?.textContent || heading.textContent || ""
                const level = parseInt(heading.tagName.substring(1))

                return { id, text, level }
            }).filter(item => item.id && item.text)

            setToc(items)

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            }, { rootMargin: "0px 0px -80% 0px" })

            items.forEach(item => {
                const el = document.getElementById(item.id)
                if (el) observer.observe(el)
            })

            return () => observer.disconnect()
        }, 300)

        return () => clearTimeout(timer)
    }, [pathname])

    const scrollToAnchor = (id: string) => {
        const el = document.getElementById(id)
        if (el) {
            el.scrollIntoView({ behavior: "smooth" })
        }
        if (onNavigate) onNavigate()
    }

    return (
        <div className={cn("pb-12 h-full", className)} {...props}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="flex items-center mb-6 pl-2 space-x-2 text-primary">
                        <BookOpen className="h-6 w-6" />
                        <h2 className="text-xl font-bold tracking-tight">WikiDream</h2>
                    </div>
                    <div className="space-y-1">
                        <div className="text-sm text-foreground/80 pl-2 pb-2 font-bold tracking-wider uppercase">
                            Contents
                        </div>
                        <div className="flex flex-col space-y-1 pl-2">
                            {toc.length === 0 ? (
                                <div className="text-sm text-muted-foreground italic">
                                    Loading...
                                </div>
                            ) : (
                                toc.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollToAnchor(item.id)}
                                        className={cn(
                                            "text-left text-sm py-1 transition-colors hover:text-primary",
                                            item.level === 3 ? "pl-4 text-muted-foreground" : "font-medium text-foreground/80",
                                            activeId === item.id && "text-primary font-bold"
                                        )}
                                    >
                                        {item.text}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
