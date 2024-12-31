import React from 'react'
import {useNavigate} from 'react-router-dom'
import arrowLeft from '../../../public/icon/Arrow-Left.svg'
import logo from '../../../public/icon/logo.svg'
import '../../css/header.scss'

function Header({showBackArrow,showMainPage}) {
    const navigate = useNavigate()

    const handleBack = () => {
        navigate(-1);
      }

    const moveToMain = () => {
        if(showMainPage == false){
            navigate('/');
        }
    }
      
      
console.log(showMainPage);

  return (
    <div className='header'>
      <div className='headerContainer'>
        <div className='headerLeft'>
        {showBackArrow && <img src={arrowLeft} alt="back" onClick={handleBack} />}
        </div>
        <div className='headerCenter'><img src={logo} onClick={moveToMain} /></div>
        <div className='headerRight'><img src={arrowLeft} alt="" /></div>
      </div>
    </div>
  )
}

export default Header
