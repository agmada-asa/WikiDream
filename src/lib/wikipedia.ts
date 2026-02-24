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
            text: data.parse.text["*"],
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
