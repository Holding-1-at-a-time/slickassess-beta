// Inside the function where tags are processed
const damageTagsLower = damageTagsAI.map((tag) => {
  // Ensure tag is a string before calling toLowerCase
  if (typeof tag !== "string") {
    console.warn(`Invalid tag type found: ${typeof tag}. Using empty string.`)
    return ""
  }
  return tag.toLowerCase()
})

// Then use the validated tags
const matchingDamageTypes = damageTypes.filter((damageType) => {
  return damageType.tags.some((tag) => {
    // Ensure tag is a string before calling toLowerCase
    const tagLower = typeof tag === "string" ? tag.toLowerCase() : ""
    return damageTagsLower.includes(tagLower)
  })
})
