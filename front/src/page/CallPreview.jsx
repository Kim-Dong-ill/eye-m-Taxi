import React from 'react'
import Map from '../components/Map'
import Button from '../components/button'
import '../css/callPreview.scss'

function CallPreview() {

  const height = 600;
  const btnData ={
    text : "호출하기",
    link : "/calling" 
  }
  return (
    <div className='callPreview'>
      <Map height={height}/>
      <Button btnData={btnData}/>
    </div>
  )
}

export default CallPreview
