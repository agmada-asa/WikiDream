"use client"

import * as React from "react"
import { Menu, BookOpen } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Progress } from "@/components/ui/progress"
import { SearchCommand } from "@/components/search-command"

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    const [scrollProgress, setScrollProgress] = React.useState(0)
    const pathname = usePathname()

    // Close mobile menu on route change
    React.useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [pathname])

    React.useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
            const progress = totalScroll / windowHeight
            setScrollProgress(isNaN(progress) ? 0 : progress * 100)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <>
            <Progress value={scrollProgress} className="fixed top-0 left-0 right-0 z-[100] h-1 rounded-none border-b-0" />
            <div className="flex min-h-screen flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-14 max-w-screen-2xl items-center px-4 md:px-8">
                        <div className="flex items-center">
                            <div className="md:hidden mr-4">
                                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" className="md:hidden">
                                            <Menu className="h-5 w-5" />
                                            <span className="sr-only">Toggle Menu</span>
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                        <SheetHeader className="sr-only">
                                            <SheetTitle>Navigation Menu</SheetTitle>
                                        </SheetHeader>
                                        <Sidebar className="w-full mt-4 border-none" onNavigate={() => setIsMobileMenuOpen(false)} />
                                    </SheetContent>
                                </Sheet>
                            </div>
                            <Link href="/" className="mr-6 hidden md:flex items-center space-x-2 text-primary">
                                <BookOpen className="h-6 w-6" />
                                <span className="text-xl font-bold tracking-tight">WikiDream</span>
                            </Link>
                        </div>
                        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                            <div className="w-full flex-1 md:w-auto md:flex-none">
                                <SearchCommand />
                            </div>
                            <nav className="flex items-center space-x-2">
                                <ThemeToggle />
                            </nav>
                        </div>
                    </div>
                </header>

                <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 px-4 md:px-8">
                    <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block border-r border-border/40">
                        <ScrollArea className="h-full py-6 pr-6 lg:py-8">
                            <Sidebar />
                        </ScrollArea>
                    </aside>
                    <main className="relative py-6 lg:py-8">
                        <div className="mx-auto w-full min-w-0 max-w-3xl">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}
