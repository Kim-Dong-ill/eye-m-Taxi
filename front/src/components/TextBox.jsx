import React from 'react'
import '../css/components/textBox.scss'

function TextBox({text}) {
  return (
    <div className='textBox'>
      {text}
    </div>
  )
}

export default TextBox
