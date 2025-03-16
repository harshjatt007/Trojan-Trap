import { useEffect, useState } from "react"

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

const TextScramble = ({ text, delay = 3000 }) => {
  const [displayText, setDisplayText] = useState("")
  const [isScrambling, setIsScrambling] = useState(true)

  useEffect(() => {
    let interval
    let counter = 0
    const finalText = text
    const scrambleLength = finalText.length

    if (isScrambling) {
      interval = setInterval(() => {
        let scrambledText = ""
        for (let i = 0; i < scrambleLength; i++) {
          scrambledText += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        setDisplayText(scrambledText)
        counter++

        if (counter > 20) {
          // After 20 iterations, show the final text
          setIsScrambling(false)
          setDisplayText(finalText)
          clearInterval(interval)
        }
      }, 50)
    }

    return () => clearInterval(interval)
  }, [text, isScrambling])

  return <span>{displayText}</span>
}

export default TextScramble

