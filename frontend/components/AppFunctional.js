import React, { useState } from 'react'
import axios from 'axios'

const initialMessage = ''
const initialEmail = ''
const initialSteps = 0
const initialIndex = 4

export default function AppFunctional(props) {
  const [message, setMessage] = useState(initialMessage)
  const [email, setEmail] = useState(initialEmail)
  const [index, setIndex] = useState(initialIndex)
  const [steps, setSteps] = useState(initialSteps)

  function getXY() {
    const x = (index % 3) + 1
    let y
    if (index < 3) y = 1
    else if (index < 6) y = 2
    else if (index < 9) y = 3
    return [x, y]
  }

  function getXYMessage() {
    const [x, y] = getXY()
    return `Coordinates (${x}, ${y})`
  }

  function reset() {
    setIndex(initialIndex)
    setMessage(initialMessage)
    setSteps(initialSteps)
    setEmail(initialEmail)
  }

  function getNextIndex(direction) {
    switch (direction) {
      case 'up':
        return (index < 3) ? index : index - 3
      case 'down':
        return (index > 5) ? index : index + 3
      case 'left':
        return (index % 3 === 0) ? index : index - 1
      case 'right':
        return ((index - 2) % 3 === 0) ? index : index + 1
    }
  }

  function move(evt) {
    const direction = evt.target.id
    const nextIndex = getNextIndex(direction)
    if (nextIndex !== index) {
      setSteps(steps + 1)
      setMessage(initialMessage)
      setIndex(nextIndex)
    } else {
      setMessage(`You can't go ${direction}`)
    }
  }

  function onChange(evt) {
    const { value } = evt.target
    setEmail(value)
  }

  function onSubmit(evt) {
    evt.preventDefault()
    const [x, y] = getXY()
    let message
    axios.post('http://localhost:9000/api/result', { email, steps, x, y })
      .then(res => {
        message = res.data.message
      })
      .catch(err => {
        message = err.response.data.message
      })
      .finally(() => {
        setMessage(message)
        setEmail(initialEmail)
      })
  }

  return (
    <div id="wrapper" className={props.className}>
      <div className="info">
        <h3 id="coordinates">{getXYMessage()}</h3>
        <h3 id="steps">{`You moved ${steps} time${steps == 1 ? '' : 's'}`}</h3>
      </div>
      <div id="grid">
        {
          [0, 1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
            <div key={idx} className={`square${idx == index ? ' active' : ''}`}>
              {idx == index ? 'B' : null}
            </div>
          ))
        }
      </div>
      <div className="info">
        <h3 id="message">{message}</h3>
      </div>
      <div id="keypad">
        <button onClick={move} id="left">LEFT</button>
        <button onClick={move} id="up">UP</button>
        <button onClick={move} id="right">RIGHT</button>
        <button onClick={move} id="down">DOWN</button>
        <button onClick={reset} id="reset">reset</button>
      </div>
      <form onSubmit={onSubmit}>
        <input id="email" onChange={onChange} value={email} type="email" placeholder="type email"></input>
        <input id="submit" type="submit"></input>
      </form>
    </div>
  )
}
