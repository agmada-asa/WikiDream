/**
 * Wikipedia API utilities
 */

export interface WikiSection {
    toclevel: number;
    level: string;
    line: string;
    number: string;
    index: string;
    fromtitle: string;
    byteoffset: number;
    anchor: string;
}

export interface WikiPage {
    title: string;
    displaytitle: string;
    text: string;
    sections: WikiSection[];
}

export interface WikiFile {
    title: string;
    url: string;
    descriptionurl: string;
    description?: string;
    date?: string;
    author?: string;
    license?: string;
}

export function rewriteWikipediaLinks(html: string): string {
    return html
        // Redirect /w/ paths directly to Wikipedia
        .replace(/href="\/w\//g, 'href="https://en.wikipedia.org/w/')
        // Redirect standard external Wikimedia URLs
        .replace(/href="\/\/upload\.wikimedia\.org\//g, 'href="https://upload.wikimedia.org/')
        // Find /wiki/ links and rewrite based on namespace
        .replace(/href="\/wiki\/([^"]*)"/g, (match, path) => {
            let decodedPath = path;
            try {
                decodedPath = decodeURIComponent(path);
            } catch (e) {
                // If decode fails, just use original path
            }

            // Allow main articles and File:/Image: paths to stay within WikiDream
            if (!decodedPath.includes(':') || decodedPath.startsWith('File:') || decodedPath.startsWith('Image:')) {
                return match; // Keep the original href="/wiki/..."
            }

            // Redirect all other namespaces (Special:, Help:, Talk:, Wikipedia:, etc.) to true Wikipedia
            return `href="https://en.wikipedia.org/wiki/${path}"`;
        });
}

export async function getWikipediaPage(title: string): Promise<WikiPage | null> {
    const url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(
        title
    )}&prop=text|sections|displaytitle&origin=*`;

    try {
        const response = await fetch(url, { next: { revalidate: 3600 } });
        if (!response.ok) {
            throw new Error(`Failed to fetch Wikipedia page: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
            console.error("Wikipedia API Error:", data.error.info);
            return null;
        }

        return {
            title: data.parse.title,
            displaytitle: data.parse.displaytitle,
            text: rewriteWikipediaLinks(data.parse.text["*"]),
            sections: data.parse.sections,
        };
    } catch (error) {
        console.error("Error fetching from Wikipedia:", error);
        return null;
    }
}

export async function searchWikipedia(query: string) {
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${encodeURIComponent(
        query
    )}&limit=5&origin=*`;

    try {
        const response = await fetch(url);
        if (!response.ok) return [];

        const data = await response.json();
        return data[1] as string[];
    } catch (error) {
        console.error("Error searching Wikipedia:", error);
        return [];
    }
}

export async function getWikipediaFile(filename: string): Promise<WikiFile | null> {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(
        filename
    )}&prop=imageinfo&iiprop=url|extmetadata&origin=*`;

    try {
        const response = await fetch(url, { next: { revalidate: 3600 } });
        if (!response.ok) {
            throw new Error(`Failed to fetch Wikipedia file: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data?.query?.pages) return null;

        const pages = Object.values(data.query.pages) as any[];
        if (pages.length === 0 || pages[0].missing !== undefined) return null;

        const page = pages[0];
        if (!page.imageinfo || page.imageinfo.length === 0) return null;

        const info = page.imageinfo[0];
        const meta = info.extmetadata || {};

        return {
            title: page.title,
            url: info.url,
            descriptionurl: info.descriptionurl,
            description: meta.ImageDescription?.value,
            date: meta.DateTimeOriginal?.value || meta.DateTime?.value,
            author: meta.Artist?.value,
            license: meta.LicenseShortName?.value || meta.License?.value,
        };
    } catch (error) {
        console.error("Error fetching Wikipedia file:", error);
        return null;
    }
}
