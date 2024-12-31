import React from 'react'
import TextBox from '../components/TextBox'
import Button from '../components/Button'
import '../css/calling.scss'

function Calling() {

  const text = ['최대 2분 거리에서', '택시 호출중...'];
  const btnData = {
    text : "호출 취소하기",
    link : "/"
  }

  return (
    <div className='calling'>
       <TextBox 
         text={text.map((line, i) => (
           <React.Fragment key={i}>
             {line}
             {i < text.length - 1 && <br />}
           </React.Fragment>
         ))}
       />
       <Button btnData={btnData}/>
    </div>
  )
}

export default Calling
