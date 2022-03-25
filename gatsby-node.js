const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          filter: { frontmatter: { published: { eq: true } } }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
                tags
              }
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    throw result.errors
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges
  const postsByTag = posts.reduce((acc, post) => {
    tags = post.node.frontmatter.tags || []
    tags.forEach(tag => {
      if (tag in acc) {
        acc[tag].push(post)
      } else {
        acc[tag] = [post]
      }
    })
    return acc
  }, {})

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    const currentTags = post.node.frontmatter.tags || []
    const relatedPosts = currentTags
      .reduce((acc, tag) => {
        const postsForTag = postsByTag[tag] || []
        return acc.concat(postsForTag)
      }, [])
      .filter(relatedPost => relatedPost.node.fields.slug != post.node.fields.slug)
      .slice(0, 3)

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
        relatedPosts
      },
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value: `/blog${value}`,
    })
  }
}
