import { getWikipediaPage, getWikipediaFile } from "@/lib/wikipedia";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ExternalLink, Calendar, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PageProps {
    // Next.js App Router exposes route parameters as promises in Next 15+
    params: Promise<{ slug: string }>;
}

/**
 * Dynamically generates SEO metadata (title, description) based on the current URL slug.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    return {
        // e.g., "Alan_Turing" -> "Alan Turing - WikiDream"
        title: `${decodedSlug.replace(/_/g, " ")} - WikiDream`,
        description: `Read about ${decodedSlug.replace(/_/g, " ")} on WikiDream.`,
    };
}

/**
 * The primary server component for rendering a Wikipedia article or file page.
 * It determines if the requested slug is a file/image or a standard article,
 * fetches the data accordingly, and returns the appropriate UI.
 */
export default async function WikiPage({ params }: PageProps) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // 1. Check if the user is trying to view a Wikipedia file (e.g., an image)
    if (decodedSlug.startsWith("File:") || decodedSlug.startsWith("Image:")) {
        const file = await getWikipediaFile(decodedSlug);

        // Standard 404 page if Wikipedia doesn't have the file
        if (!file) {
            notFound();
        }

        // Render the File View UI
        return (
            <div className="flex flex-col items-center max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
                <div className="w-full text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-tight">{file.title.replace(/_/g, " ")}</h1>
                </div>

                {/* Display the actual high-resolution file/image */}
                <div className="relative w-full max-w-3xl aspect-auto flex justify-center bg-muted/30 rounded-xl p-4 md:p-8 border border-border/50 backdrop-blur-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={file.url}
                        alt={file.title}
                        className="max-h-[60vh] object-contain rounded-md shadow-sm"
                        loading="lazy"
                    />
                </div>

                {/* Metadata Card displaying description, author, date, and external link */}
                <Card className="w-full max-w-3xl bg-card/50 backdrop-blur border-border/50">
                    <CardContent className="p-6 md:p-8 flex flex-col gap-6">
                        {file.description && (
                            <div className="space-y-2">
                                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Description
                                </span>
                                <div
                                    className="prose prose-sm dark:prose-invert max-w-none prose-a:text-primary [&_a:hover]:text-primary/80"
                                    dangerouslySetInnerHTML={{ __html: file.description }}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/40">
                            {file.author && (
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <User className="w-4 h-4" /> Author / Source
                                    </span>
                                    <div
                                        className="text-sm prose prose-sm dark:prose-invert max-w-none prose-a:text-primary [&_a:hover]:text-primary/80"
                                        dangerouslySetInnerHTML={{ __html: file.author }}
                                    />
                                </div>
                            )}
                            {file.date && (
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Date
                                    </span>
                                    <div
                                        className="text-sm prose prose-sm dark:prose-invert max-w-none prose-a:text-primary [&_a:hover]:text-primary/80"
                                        dangerouslySetInnerHTML={{ __html: file.date }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Link to view the unstyled info on Wikimedia Commons */}
                        <div className="pt-6 flex justify-center">
                            <Button asChild variant="outline" className="gap-2 rounded-full px-6 transition-all hover:bg-primary hover:text-primary-foreground min-w-[240px]">
                                <a href={file.descriptionurl} target="_blank" rel="noopener noreferrer">
                                    View on Wikimedia Commons
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 2. Fetch standard Wikipedia article data
    const page = await getWikipediaPage(decodedSlug);

    // Standard 404 page if the article does not exist
    if (!page) {
        notFound();
    }

    // Render the Article UI, injecting the pre-rendered HTML from the Wikipedia API
    return (
        <article className="prose prose-slate dark:prose-invert prose-headings:font-serif prose-h1:text-4xl prose-h1:font-bold prose-h2:text-2xl prose-h2:border-b-0 prose-a:text-primary [&_a:hover]:text-primary/80 prose-a:no-underline [&_a:hover]:underline max-w-none transition-colors duration-300 wiki-content animate-in fade-in duration-500">
            {/* Strip away HTML tags from displaytitle purely for the `<h1/>` page header */}
            <h1 className="mb-6">{page.displaytitle.replace(/<[^>]+>/g, '')}</h1>

            {/* Inject the sanitized, linked-rewritten Wikipedia HTML content */}
            <div
                dangerouslySetInnerHTML={{ __html: page.text }}
                className="wiki-body"
            />
        </article>
    );
}
