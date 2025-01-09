import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import '../css/layout.scss'
import Header from './contain/Header.jsx'

function layout() {

  const location = useLocation()

   // 뒤로가기 화살표 숨기기 경로 설정
   const hideBackArrowPaths = ['/', '/login', '/calling','/callAccept','/driveing','/starScope','/driveFinish'];
   const showBackArrow = !hideBackArrowPaths.includes(location.pathname);

   // 메인페이지 표시 경로 설정
   const showMainPagePaths = ['/calling','/callAccept','/driveing'];
   const showMainPage = showMainPagePaths.includes(location.pathname);

  return (
    <div className='layout'>
        <Header showBackArrow={showBackArrow} showMainPage={showMainPage}/>
        <div className='layoutContent'>
          <Outlet />
        </div>
    </div>
  )
}

export default layout
