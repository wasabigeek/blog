const { filterRelatedPosts } = require("../filterRelatedPosts")

const makePostCreator = () => {
  let postCount = 0
  return ({ slug = `example-slug-${postCount}`, tags = [] } = {}) => {
    postCount += 1
    return {
      node: {
        fields: { slug },
        frontmatter: { tags }
      }
    }
  }
}
const createPost = makePostCreator()

describe("filterRelatedPosts", () => {
  it("does not return the currentPost", () => {
    const currentPost = createPost()
    const allPosts = [currentPost]
    const relatedPosts = filterRelatedPosts(allPosts, currentPost)
    expect(relatedPosts).not.toContain(currentPost)
  })

  it("returns a post that has an overlapping tag", () => {
    const currentPost = createPost({
      tags: ["example-tag"]
    })
    const overlappingPost = createPost({
      tags: ["example-tag"]
    })
    const allPosts = [currentPost, overlappingPost]
    const relatedPosts = filterRelatedPosts(allPosts, currentPost)
    expect(relatedPosts).toContain(overlappingPost)
  })

  it("does not return posts that have other tags", () => {
    const currentPost = createPost({
      tags: ["example-tag"]
    })
    const anotherPost = createPost({
      tags: ["huzzah"]
    })
    const allPosts = [currentPost, anotherPost]
    const relatedPosts = filterRelatedPosts(allPosts, currentPost)
    expect(relatedPosts).not.toContain(anotherPost)
  })

  it("returns nothing if the currentPost has no tags", () => {
    const currentPost = createPost()
    const anotherPostWithoutTags = createPost()
    const anotherPostWithTags = createPost({
      tags: ["example-tag"]
    })
    const allPosts = [currentPost, anotherPostWithTags, anotherPostWithoutTags]
    const relatedPosts = filterRelatedPosts(allPosts, currentPost)
    expect(relatedPosts).toEqual([])
  })
})
