# WikiDream

WikiDream is a high-end, minimalist Wikipedia reader application designed to elevate the reading experience of the world's largest encyclopedia. Built with modern web technologies and a focus on beautiful, functional design, WikiDream provides a distraction-free, aesthetically pleasing environment for knowledge discovery.

## Features

- **Elegant Typography & Layout**: Carefully crafted article views with optimal line lengths, spacing, and typography using `@tailwindcss/typography`.
- **Glassmorphism Aesthetic**: Modern, premium UI utilizing subtle translucency and blurs to create depth and focus.
- **Seamless Dark/Light Mode**: Full support for system preferences and manual toggling, ensuring comfortable reading in any environment.
- **Responsive Navigation**: A robust sidebar-based layout that seamlessly transforms into a mobile-friendly drawer on smaller screens.
- **Intelligent Search**: Centered, command-palette style search for lightning-fast article discovery.
- **Dynamic Table of Contents**: Collapsible, sticky ToC that provides quick structural overview of the article.
- **Smart Link Handling**: Intelligent redirection for external links and automatic routing for internal Wikipedia links to stay within the WikiDream experience.
- **Floating Progress Bar**: Visual indicator of your reading progress as you scroll through long articles.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI primitives)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theming**: `next-themes`

## How it Works

WikiDream acts as a modern, custom frontend for Wikipedia. It utilizes dynamic routing in Next.js (`/wiki/[slug]`) to fetch and present article data dynamically.

1. **Routing**: When a user navigates to an article (e.g., `/wiki/Alan_Turing`), the Next.js App Router handles the dynamic route segment.
2. **Data Fetching**: The application fetches the corresponding article content, typically utilizing Wikipedia's APIs.
3. **Parsing & Rendering**: The raw content is parsed and sanitized. Internal Wikipedia links are intelligently rewritten to point back to WikiDream's `/wiki/...` routes, keeping the user immersed in the app. External links (like images, external references) are carefully handled to either open appropriately or redirect to the original source, avoiding broken links or missing resources.
4. **Presentation**: The content is injected into a beautifully crafted typography container, surrounded by our custom application layout which includes the dynamic sidebar, theme toggle, and search functionality.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running locally.
