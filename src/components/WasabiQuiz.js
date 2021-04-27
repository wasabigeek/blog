import React from "react"

import { rhythm } from "../utils/typography"

const Question = ({ text, answers }) => {
  return (
    <div>
      <p>{text}</p>
      <ol>
        {answers.map((answer) => <li>{answer}</li>)}
      </ol>
    </div>
  );
}

const WasabiQuiz = () => {
  const questions = [
    {
      text: "Which plant belongs to the same family as wasabi?",
      answers: [
        "Cabbage",
        "Carrot",
        "Potato",
        "Onion",
      ]
    },
    {
      text: "How long does it take for wasabi to mature?",
      answers: [
        "6 months",
        "8 months",
        "1 year",
        "2 years",
      ]
    },
    {
      text: "What is the main component of wasabi substitutes?",
      answers: [
        "Mustard",
        "Horseradish",
        "Green Chilli",
        "White Peppercorns",
      ]
    },
    {
      text: "Which part of the wasabi plant is used to create the sushi condiment?",
      answers: [
        "Stem",
        "Root",
        "Leaves",
        "Fruit",
      ]
    }
  ]
  const choice = Math.floor(Math.random() * questions.length)

  return (<section style={{ marginBottom: rhythm(2) }}>
    <h2>Random Wasabi Question</h2>
    <Question
      text={questions[choice].text}
      answers={questions[choice].answers}
    />
  </section>
  )
}

export default WasabiQuiz
