/**
 * Vercel Node.js Serverless Function: article-meta.js
 *
 * Intercepts /article/:slug requests, fetches the article from Firestore
 * using the REST API, injects dynamic OG meta tags into index.html,
 * and returns the enriched HTML so that WhatsApp / Twitter / Facebook
 * link scrapers see article-specific previews.
 *
 * Regular users also receive this HTML — the bundled JS takes over
 * and renders the full React SPA as normal.
 */

export default async function handler(req, res) {
    const { slug } = req.query;

    // Construct the base URL dynamically from the incoming request headers.
    // This works for both the main domain and Vercel preview deployments.
    const host =
        req.headers['x-forwarded-host'] ||
        req.headers['host'] ||
        'gracehub.vercel.app';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${proto}://${host}`;
    const articleUrl = `${baseUrl}/article/${slug}`;
    const defaultImage = `${baseUrl}/og-default.png`;

    // --- Default meta used if the article is not found or fetch fails ---
    let meta = {
        title: 'GraceHub',
        description: 'Stories, insights, growth, and real life.',
        image: defaultImage,
    };

    // --- Fetch article meta from Firestore REST API ---
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    const apiKey = process.env.VITE_FIREBASE_API_KEY;

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
                // Only use real hosted URLs for OG image — not base64 data URIs
                image: rawImage.startsWith('http') ? rawImage : defaultImage,
            };
        }
    } catch (err) {
        console.error('[article-meta] Firestore fetch error:', err.message);
    }

    // --- Fetch the built index.html to inject OG tags into ---
    let indexHtml = '';
    try {
        const indexRes = await fetch(`${baseUrl}/index.html`);
        if (indexRes.ok) {
            indexHtml = await indexRes.text();
        }
    } catch (err) {
        console.error('[article-meta] index.html fetch error:', err.message);
    }

    // --- Build the OG tag block ---
    const escapedTitle = meta.title.replace(/"/g, '&quot;');
    const escapedDesc = meta.description.replace(/"/g, '&quot;');

    const ogTags = `
    <!-- Dynamic OG meta (injected by Vercel function for article: ${slug}) -->
    <title>${escapedTitle} | GraceHub</title>
    <meta name="description" content="${escapedDesc}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapedTitle} | GraceHub">
    <meta property="og:description" content="${escapedDesc}">
    <meta property="og:url" content="${articleUrl}">
    <meta property="og:image" content="${meta.image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="GraceHub">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapedTitle} | GraceHub">
    <meta name="twitter:description" content="${escapedDesc}">
    <meta name="twitter:image" content="${meta.image}">`;

    if (indexHtml) {
        // Inject dynamic tags right after <head> — they override the static defaults
        indexHtml = indexHtml.replace('<head>', `<head>${ogTags}`);
    } else {
        // Fallback: serve a minimal but functional OG page
        indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${ogTags}
</head>
<body>
  <h1>${escapedTitle}</h1>
  <p>${escapedDesc}</p>
  <a href="${articleUrl}">Read on GraceHub →</a>
  <script>window.location.href = "${articleUrl}";</script>
</body>
</html>`;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.end(indexHtml);
}
