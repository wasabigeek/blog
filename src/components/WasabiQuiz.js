import React, { useState } from "react"

import { rhythm } from "../utils/typography"

const Question = ({ text, answers, correctAnswer }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div>
      <p>{text}</p>
      <ol>
        {answers.map(answer => (
          <li style={showAnswer && answer === correctAnswer ? { color: "green" } : {}}>
            {answer}
          </li>
        ))}
      </ol>
      <div>
        <button onClick={() => setShowAnswer(true)}>Show Answer</button>
      </div>
    </div>
  );
}

const WasabiQuiz = () => {
  const questions = [
    {
      text: "Which plant belongs to the same family as wasabi?",
      answers: [
        "Carrot",
        "Potato",
        "Cabbage",
        "Onion",
      ],
      correctAnswer: "Cabbage"
    },
    {
      text: "How long does it take for wasabi to mature?",
      answers: [
        "6 months",
        "8 months",
        "1 year",
        "2 years",
      ],
      correctAnswer: "2 years"
    },
    {
      text: "What is the main component of wasabi substitutes?",
      answers: [
        "Mustard",
        "Horseradish",
        "Green Chilli",
        "White Peppercorns",
      ],
      correctAnswer: "Horseradish"
    },
    {
      text: "Which part of the wasabi plant is used to create the sushi condiment?",
      answers: [
        "Stem",
        "Root",
        "Leaves",
        "Fruit",
      ],
      correctAnswer: "Stem"
    }
  ]
  const choice = Math.floor(Math.random() * questions.length)

  return (<section style={{ marginBottom: rhythm(2) }}>
    <h2>Random Wasabi Question</h2>
    <Question
      {...questions[choice]}
    />
  </section>
  )
}

export default WasabiQuiz
