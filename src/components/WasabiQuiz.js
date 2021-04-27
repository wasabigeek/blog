import React from "react"

import { rhythm } from "../utils/typography"

const WasabiQuiz = () => {
  const questions = [
    <React.Fragment>
      <p>
        Which plant belongs to the same family as wasabi?
      </p>
      <ol>
        <li>Cabbage</li>
        <li>Carrot</li>
        <li>Potato</li>
        <li>Onion</li>
      </ol>
    </React.Fragment>,
    <React.Fragment>
      <p>
        How long does it take for wasabi to mature?
      </p>
      <ol>
        <li>6 months</li>
        <li>8 months</li>
        <li>1 year</li>
        <li>2 years</li>
      </ol>
    </React.Fragment>,
    <React.Fragment>
      <p>
        What is the main component of wasabi substitutes?
      </p>
      <ol>
        <li>Mustard</li>
        <li>Horseradish</li>
        <li>Green Chilli</li>
        <li>White Peppercorns</li>
      </ol>
    </React.Fragment>,
    <React.Fragment>
      <p>
        Which part of the wasabi plant is used to create the sushi condiment?
      </p>
      <ol>
        <li>Stem</li>
        <li>Root</li>
        <li>Leaves</li>
        <li>Fruit</li>
      </ol>
    </React.Fragment>,
  ]
  const choice = Math.floor(Math.random() * questions.length)

  return (
    <section style={{ marginBottom: rhythm(2) }}>
      <h2>Random Wasabi Question</h2>
      {questions[choice]}
    </section>
  )
}

export default WasabiQuiz
