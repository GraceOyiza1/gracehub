/**
 * Converts a string into a URL-friendly slug.
 * e.g. "My Story Title!" => "my-story-title"
 */
export function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')          // Replace spaces with hyphens
        .replace(/[^\w\-]+/g, '')      // Remove all non-word chars except hyphens
        .replace(/\-\-+/g, '-')        // Replace multiple hyphens with single hyphen
        .replace(/^-+/, '')            // Trim hyphens from start
        .replace(/-+$/, '');           // Trim hyphens from end
}
