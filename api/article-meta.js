/**
 * Vercel Edge Function: article-meta.js
 *
 * Intercepts requests to /article/:slug, fetches the article from Firestore
 * using the REST API, injects OG meta tags into the static index.html, and
 * returns the enriched HTML. This enables proper WhatsApp, Twitter, and
 * Facebook link previews from a Vite SPA without needing SSR or Next.js.
 *
 * Regular users: get the full SPA (React takes over after initial load).
 * Social bots: get the OG-enriched HTML they need for link previews.
 */

export const config = { runtime: 'edge' };

export default async function handler(req) {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug') || '';

    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    const apiKey = process.env.VITE_FIREBASE_API_KEY;
    const siteUrl = 'https://gracehub.vercel.app';
    const articleUrl = `${siteUrl}/article/${slug}`;
    const defaultImage = `${siteUrl}/og-default.png`;

    // Default meta — used if the Firestore fetch fails or article isn't found
    let meta = {
        title: 'GraceHub',
        description: 'Stories, insights, growth, and real life.',
        image: defaultImage,
    };

    // --- Fetch article from Firestore REST API ---
    try {
        const firestoreRes = await fetch(
            `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    structuredQuery: {
                        from: [{ collectionId: 'articles' }],
                        where: {
                            fieldFilter: {
                                field: { fieldPath: 'slug' },
                                op: 'EQUAL',
                                value: { stringValue: slug },
                            },
                        },
                        limit: 1,
                    },
                }),
            }
        );

        const data = await firestoreRes.json();
        const docFields = data[0]?.document?.fields;

        if (docFields) {
            const rawContent = docFields.content?.stringValue || '';
            const rawImage = docFields.imageUrl?.stringValue || '';

            meta = {
                title: docFields.title?.stringValue || 'GraceHub',
                description:
                    rawContent.slice(0, 160).trim() +
                    (rawContent.length > 160 ? '...' : ''),
                // Only use the stored image if it's a real URL (not a base64 data URI)
                image: rawImage.startsWith('http') ? rawImage : defaultImage,
            };
        }
    } catch (err) {
        console.error('[article-meta] Firestore fetch error:', err);
    }

    // --- Fetch the SPA index.html to inject meta into it ---
    let html = '';
    try {
        const indexRes = await fetch(`${siteUrl}/index.html`);
        html = await indexRes.text();
    } catch (err) {
        console.error('[article-meta] index.html fetch error:', err);
        // Fallback: serve a minimal redirect page
        return new Response(
            `<!DOCTYPE html><html><head>
              <meta property="og:title" content="${meta.title} | GraceHub">
              <meta property="og:description" content="${meta.description}">
              <meta property="og:image" content="${meta.image}">
              <meta property="og:url" content="${articleUrl}">
              <meta name="twitter:card" content="summary_large_image">
              <script>location.href="${articleUrl}"</script>
            </head><body><a href="${articleUrl}">${meta.title}</a></body></html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
    }

    // --- Inject dynamic OG tags into <head> ---
    const ogTags = `
    <!-- Dynamic OG Tags (injected by Edge function) -->
    <title>${meta.title} | GraceHub</title>
    <meta name="description" content="${meta.description}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${meta.title} | GraceHub">
    <meta property="og:description" content="${meta.description}">
    <meta property="og:url" content="${articleUrl}">
    <meta property="og:image" content="${meta.image}">
    <meta property="og:site_name" content="GraceHub">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${meta.title} | GraceHub">
    <meta name="twitter:description" content="${meta.description}">
    <meta name="twitter:image" content="${meta.image}">`;

    // Insert just after <head> so dynamic tags override the static defaults
    html = html.replace('<head>', `<head>${ogTags}`);

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            // Cache for 5 minutes on CDN, serve stale for up to 10 minutes while revalidating
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
    });
}
