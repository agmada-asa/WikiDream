/**
 * Wikipedia API utilities
 * 
 * This module handles all interactions with the Wikipedia MediaWiki API.
 * It provides functions to fetch article content, handle Wikipedia's unique
 * internal link structures, search for articles, and retrieve media files.
 */

/**
 * Represents a section within a Wikipedia article's Table of Contents (ToC).
 */
export interface WikiSection {
    toclevel: number;       // The hierarchy level in the ToC (e.g., 1 for main section, 2 for subsection)
    level: string;          // The HTML heading level (e.g., "2" for <h2>)
    line: string;           // The plain text title of the section
    number: string;         // The hierarchical section number (e.g., "1.2.1")
    index: string;          // The internal index within the parsed document
    fromtitle: string;      // The title of the page the section belongs to
    byteoffset: number;     // The byte offset in the wikitext source
    anchor: string;         // The expected HTML ID / anchor link for this section
}

/**
 * Represents a fully parsed Wikipedia page ready for rendering.
 */
export interface WikiPage {
    title: string;          // The canonical title of the page
    displaytitle: string;   // The formatted title (often includes HTML tags like <i>)
    text: string;           // The fully rendered HTML content of the page
    sections: WikiSection[];// The hierarchical table of contents data
}

/**
 * Represents metadata and URLs for a file hosted on Wikimedia Commons.
 */
export interface WikiFile {
    title: string;          // The canonical title of the file (e.g., "File:Example.jpg")
    url: string;            // The direct URL to the source image/media file
    descriptionurl: string; // The URL to the file's description page on Wikimedia or Wikipedia
    description?: string;   // HTML description of the file (often parsed from commons templates)
    date?: string;          // The original creation or publication date of the file
    author?: string;        // The author or copyright holder of the file
    license?: string;       // The license under which the file is released (e.g., "CC BY-SA 4.0")
}

/**
 * Rewrites internal Wikipedia HTML links to point either to true Wikipedia
 * or back into the WikiDream application routing.
 *
 * @param html The raw HTML string fetched from the Wikipedia API.
 * @returns The transformed HTML string with rewritten `href` attributes.
 */
export function rewriteWikipediaLinks(html: string): string {
    return html
        // 1. Redirect absolute /w/ paths (like API calls or raw file loads) directly to true Wikipedia.
        .replace(/href="\/w\//g, 'href="https://en.wikipedia.org/w/')
        // 2. Redirect standard external Wikimedia URLs (like protocol-relative image URLs).
        .replace(/href="\/\/upload\.wikimedia\.org\//g, 'href="https://upload.wikimedia.org/')
        // 3. Find standard /wiki/ links and determine if they should stay in WikiDream or go to true Wikipedia.
        .replace(/href="\/wiki\/([^"]*)"/g, (match, path) => {
            let decodedPath = path;
            try {
                decodedPath = decodeURIComponent(path);
            } catch (e) {
                // If decode fails (e.g., malformed URI), fallback to using the original raw path.
            }

            // Stay within WikiDream if:
            // a) It's a standard article (no colon in the title, which indicates a namespace).
            // b) It's a File or Image namespace (we have custom handling for these in our localized route).
            if (!decodedPath.includes(':') || decodedPath.startsWith('File:') || decodedPath.startsWith('Image:')) {
                return match; // Keep the original href="/wiki/...", so Next.js router handles it.
            }

            // Redirect all other namespaces (Special:, Help:, Talk:, Wikipedia:, Category:, etc.)
            // to the real Wikipedia since WikiDream does not render them natively.
            return `href="https://en.wikipedia.org/wiki/${path}"`;
        });
}

/**
 * Fetches and parses a Wikipedia article by its title.
 *
 * @param title The canonical title of the Wikipedia page.
 * @returns A promise that resolves to the parsed WikiPage object, or null if it fails or the page doesn't exist.
 */
export async function getWikipediaPage(title: string): Promise<WikiPage | null> {
    // Construct the MediaWiki Action API URL for parsing a page.
    // 'prop=text|sections|displaytitle' requests the HTML text, ToC structure, and formatted title.
    const url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(
        title
    )}&prop=text|sections|displaytitle&origin=*`;

    try {
        // Fetch the data, caching the result at the edge or within Next.js cache for 1 hour (3600 seconds).
        const response = await fetch(url, { next: { revalidate: 3600 } });
        if (!response.ok) {
            throw new Error(`Failed to fetch Wikipedia page: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle native API errors returned successfully (200 OK) but containing an error body
        // (e.g., page does not exist).
        if (data.error) {
            console.error("Wikipedia API Error:", data.error.info);
            return null;
        }

        // Return the successfully parsed and structured data,
        // making sure to run the HTML text through our link rewriter.
        return {
            title: data.parse.title,
            displaytitle: data.parse.displaytitle,
            text: rewriteWikipediaLinks(data.parse.text["*"]),
            sections: data.parse.sections,
        };
    } catch (error) {
        // Catch network mapping issues or JSON parsing errors.
        console.error("Error fetching from Wikipedia:", error);
        return null;
    }
}

/**
 * Searches Wikipedia for article titles matching a query string.
 * Used for the autocomplete/search command palette.
 *
 * @param query The search string typed by the user.
 * @returns A promise that resolves to an array of matching article titles (up to 5).
 */
export async function searchWikipedia(query: string) {
    // Use the OpenSearch API endpoints which are optimized for fast autocomplete responses.
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${encodeURIComponent(
        query
    )}&limit=5&origin=*`;

    try {
        const response = await fetch(url);
        if (!response.ok) return [];

        const data = await response.json();
        // The OpenSearch response format is an array:
        // [search_term, [title1, title2, ...], [desc1, desc2, ...], [link1, link2, ...]]
        // We only care about the titles (index 1).
        return data[1] as string[];
    } catch (error) {
        console.error("Error searching Wikipedia:", error);
        return [];
    }
}

/**
 * Fetches metadata and the direct image URL for a file hosted on Wikipedia/Wikimedia.
 *
 * @param filename The title of the file (e.g., "File:Example.jpg").
 * @returns A promise that resolves to a WikiFile object containing metadata, or null if it fails.
 */
export async function getWikipediaFile(filename: string): Promise<WikiFile | null> {
    // Construct the MediaWiki Action API URL to query image information.
    // 'prop=imageinfo' gets file info, and 'iiprop=url|extmetadata' requests the direct URL
    // along with extended semantic metadata (author, license, description, date).
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(
        filename
    )}&prop=imageinfo&iiprop=url|extmetadata&origin=*`;

    try {
        // Cache the file metadata for 1 hour.
        const response = await fetch(url, { next: { revalidate: 3600 } });
        if (!response.ok) {
            throw new Error(`Failed to fetch Wikipedia file: ${response.statusText}`);
        }

        const data = await response.json();

        // Safety checks to handle missing data or unexpected API shapes.
        if (!data?.query?.pages) return null;

        // The MediaWiki API returns pages as a dictionary keyed by arbitrary page IDs.
        // We grab the first (and only) result regardless of the key name.
        const pages = Object.values(data.query.pages) as any[];
        if (pages.length === 0 || pages[0].missing !== undefined) return null;

        const page = pages[0];
        // Ensure the page actually has image info (might fail if the title isn't a file).
        if (!page.imageinfo || page.imageinfo.length === 0) return null;

        const info = page.imageinfo[0];
        const meta = info.extmetadata || {};

        // Extract and shape the relevant data. We use the `.value` property from the extmetadata
        // fields because the API wraps metadata fields in objects indicating their language.
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
