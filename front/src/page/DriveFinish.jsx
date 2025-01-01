import React from 'react'
import TextBox from '../components/TextBox'
import Button from '../components/button'
import '../css/driveFinish.scss'

function DriveFinish() {

  const text = ['운행이 종료되었습니다.']
  const btnData = [
    {
    text: "별점 남기기", 
    link: "/starScope"
  },
  {
    text: "종료하기",
    link: "/"
  }
]
  
return (
  <div className='container'>
    <div className='content'>
      <TextBox text={text} />
      <div className='driveFinish'>
        {btnData.map((btn, index) => (
          <Button key={index} btnData={btn} />
        ))}
      </div>
    </div>
  </div>
  )
}

export default DriveFinish
