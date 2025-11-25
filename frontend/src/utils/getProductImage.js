// Returns the most appropriate image URL for a product.
export default function getProductImage(p) {
  if (!p) return "https://placehold.co/400x300?text=No+Image";

  // 1) Look for images array entries (ProductImage rows)
  if (Array.isArray(p.images) && p.images.length > 0) {
    for (const img of p.images) {
      if (!img) continue;
      if (typeof img === "string" && img.trim()) return img;
      if (img.url && typeof img.url === "string" && img.url.trim())
        return img.url;
    }
  }

  // 2) Legacy single fields
  if (p.image && typeof p.image === "string" && p.image.trim()) return p.image;
  if (p.imageUrl && typeof p.imageUrl === "string" && p.imageUrl.trim())
    return p.imageUrl;
  if (p.image_url && typeof p.image_url === "string" && p.image_url.trim())
    return p.image_url;

  // 3) Nothing found — return placeholder
  return "https://placehold.co/400x300?text=No+Image";
}
