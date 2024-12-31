import React from 'react'
import '../css/mainPage.scss'
import { useNavigate } from 'react-router-dom'

function MainPage() {
  const navigate = useNavigate()
  return (
    <div className='mainPage'>
      <div className='mainPageItem' onClick={() => navigate("/getOnGetOff")}>승차</div>
      <div className='mainPageItem' onClick={() => navigate("/getOnGetOff")}>하차</div>
    </div>
  )
}

export default MainPage
