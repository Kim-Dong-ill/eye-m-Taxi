import React from 'react'
import '../css/components/inputBox.scss'


function inputBox({data}) {
  return (
    data.map((item, index) => (
        <div key={index} className='inputBox'>
        <div className='inputBoxIcon'>
            <img src={item.img} alt="" />
        </div>
      <input className='inputBoxInput' type={item.type} placeholder={item.placeholder}/>
    </div>
    ))
  )
}

export default inputBox