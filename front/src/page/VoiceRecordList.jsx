import React from 'react'
import '../css/voiceRecordList.scss'

function VoiceRecordList() {

  const result = [
    {text: '가산디지털단지역 7호선'},
    {text: '가산디지털단지역환승 노상공영주차장'},
    {text: '가산디지털단지역환승 사거리'},
    {text: '가산디지털단지역환승 사거리'},
    {text: '올리브영 가산 디지털단지역'},
    {text: '리안헤어 가산디지털단지역'},
  ]

  return (
    <div className='voiceRecordList'>
      <div>input</div>
      <div className='voiceRecordListContainer'>
        {result.map((item,idx)=>{
          return (<div className='voiceRecordListText'>{item.text}</div>)
        })}
      </div>
    </div>
  )
}

export default VoiceRecordList
