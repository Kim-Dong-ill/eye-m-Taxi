import React from 'react'
import Map from '../components/Map'
import Button from '../components/Button'

function Driveing() {

  const height = 600;
  const btnData ={
    text : "도착까지 1분",
    link : ""
  }

  return (
    <div className='callPreview'>
      <Map height={height}/>
      <Button btnData={btnData}/>
    </div>
  )
}

export default Driveing
