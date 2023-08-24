const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)
const { filterRelatedPosts } = require("./gatsby_node_utils/filterRelatedPosts")

exports.createPages = async ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions

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
                date
                updated_date
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

  posts.forEach((currentPost, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    createPage({
      path: currentPost.node.fields.slug,
      component: blogPost,
      context: {
        slug: currentPost.node.fields.slug,
        previous,
        next,
        relatedPosts: filterRelatedPosts(posts, currentPost),
        updatedDate: currentPost.node.frontmatter.updated_date || currentPost.node.frontmatter.date,
      },
    })
    // some random site is sending traffic here :/
    createRedirect({ fromPath: `${currentPost.node.fields.slug}/null`, toPath: currentPost.node.fields.slug, isPermanent: true })
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
