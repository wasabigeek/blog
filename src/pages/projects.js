import { graphql, Link } from "gatsby"
import React from "react"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import { rhythm } from "../utils/typography"

const ProjectListing = ({ title, link, children }) => (
  <article>
    <header>
      <h3
        style={{
          marginBottom: rhythm(1 / 4),
        }}
      >
        <Link style={{ boxShadow: `none` }} to={link}>
          {title}
        </Link>
      </h3>
    </header>
    <section>
      <p>
        {children}
      </p>
    </section>
  </article>
)

const ProjectsPage = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title="Projects" />
      <section
        style={{
          marginBottom: rhythm(2),
        }}
      >
        <ProjectListing
          link={'https://t.me/parkcheep_bot'}
          title='Parkcheep'
        >
          A telegram bot for finding cheap parking in Singapore.
        </ProjectListing>
        <ProjectListing
          link={'https://wasabigeek.github.io/railshelp/'}
          title='rails.help'
        >
          A GUI for Rails generators, ironically built in React.
        </ProjectListing>
        <ProjectListing
          link={'https://wasabigeek.github.io/overthekit/'}
          title='Over the Kit'
        >
          Drum-kit sticking orchestration, using Vexflow and WebAudio.
        </ProjectListing>
        <ProjectListing
          link={'https://github.com/wasabigeek/cahoots/'}
          title='Cahoots'
        >
          A "kahoot!" clone, built in React and Firebase.
        </ProjectListing>
      </section >
      <Bio />
    </Layout >
  )
}

export default ProjectsPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
