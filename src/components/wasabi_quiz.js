import React from "react"

import { rhythm } from "../utils/typography"

const WasabiQuiz = ({ }) => {
  return (
    <section style={{ marginBottom: rhythm(2) }}>
      <h2>Random Wasabi Question</h2>
      <p>
        Which plant belongs to the same family as wasabi?
      </p>
      <ol>
        <li>Cabbage</li>
        <li>Carrot</li>
        <li>Potato</li>
        <li>Onion</li>
      </ol>
    </section>
  )
}

export default WasabiQuiz
