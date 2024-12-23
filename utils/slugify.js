// Slugify Function
export function slugify(str) {
  return encodeURIComponent(
   str
    .toLowerCase()
    .replace(/[\s_]/g, '-')
  )
}

// Deslugify Function
export function deslugify(slug) {
  return decodeURIComponent(
   slug
    .replace(/-/g, ' ')
   )
}