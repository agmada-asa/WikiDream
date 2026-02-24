import { getWikipediaPage } from "@/lib/wikipedia";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    return {
        title: `${decodedSlug.replace(/_/g, " ")} - WikiDream`,
        description: `Read about ${decodedSlug.replace(/_/g, " ")} on WikiDream.`,
    };
}

export default async function WikiPage({ params }: PageProps) {
    const { slug } = await params;
    const page = await getWikipediaPage(decodeURIComponent(slug));

    if (!page) {
        notFound();
    }

    return (
        <article className="prose prose-slate dark:prose-invert prose-headings:font-serif prose-h1:text-4xl prose-h1:font-bold prose-h2:text-2xl prose-h2:border-b-0 prose-a:text-primary hover:prose-a:text-primary/80 prose-a:no-underline hover:prose-a:underline max-w-none transition-colors duration-300 wiki-content">
            <h1 className="mb-6">{page.displaytitle.replace(/<[^>]+>/g, '')}</h1>
            <div
                dangerouslySetInnerHTML={{ __html: page.text }}
                className="wiki-body"
            />
        </article>
    );
}
