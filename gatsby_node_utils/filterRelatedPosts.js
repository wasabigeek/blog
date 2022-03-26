
const filterRelatedPosts = (allPosts, currentPost) => {
  const currentTags = currentPost.node.frontmatter.tags || []
  return allPosts
    .filter((postToCompare) => {
      const isSamePost = postToCompare.node.fields.slug == currentPost.node.fields.slug
      const tagsToCompare = postToCompare.node.frontmatter.tags || []
      const hasSameTag = currentTags.some(tag => tagsToCompare.includes(tag))

      return !isSamePost && hasSameTag
    })
}

module.exports = { filterRelatedPosts }
