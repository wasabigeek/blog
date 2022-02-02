import React from "react"
import { Link } from "gatsby"

import { rhythm, scale } from "../utils/typography"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  let header

  console.log(location.pathname)
  if (location.pathname.includes('/blog/')) {
    header = (
      <h3
        style={{
          marginTop: 0,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            color: `inherit`,
          }}
          to={`/blog`}
        >
          {`wasabigeek`}
        </Link>
      </h3>
    )
  } else {
    header = (
      <div style={{
        marginBottom: rhythm(1.5),
      }}>
        <h1
          style={{
            ...scale(1.5),
            marginBottom: rhythm(0.5),
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              color: `inherit`,
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h1>
        <div>
          <Link to="/blog" activeStyle={{ backgroundImage: 'none', color: '#111827' }}>Blog</Link>
          {` | `}
          <Link to="/projects" activeStyle={{ backgroundImage: 'none', color: '#111827' }}>Projects</Link>
        </div>
      </div>
    )
  }
  return (
    <div
      style={{
        marginLeft: `auto`,
        marginRight: `auto`,
        maxWidth: rhythm(24),
        padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
      }}
    >
      <header>{header}</header>
      <main>{children}</main>
      <footer>
        © {new Date().getFullYear()}, Built with
        {` `}
        <a href="https://www.gatsbyjs.org">Gatsby</a>
      </footer>
    </div>
  )
}

export default Layout
