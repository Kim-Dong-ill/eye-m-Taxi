import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainPage from './page/MainPage'
import CallAccept from './page/CallAccept'
import Colling from './page/Calling'
import CollPreview from './page/CallPreview'
import Driveing from './page/Driveing'
import GetOnGetOff from './page/GetOnGetOff'
import Login from './page/Login'
import Register from './page/Register'
import StarScope from './page/StarScope'
import VoiceRecord from './page/VoiceRecord'
import VoiceRecordList from './page/VoiceRecordList'
import DriveFinish from './page/DriveFinish'
import Layout from './components/layout/layout'
import './css/app.scss'

function App() {
  return (
    <div className='mainContainer'>
      <Routes>
      <Route element={<Layout />}>
          <Route index element={<MainPage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/callAccept' element={<CallAccept />} />
          <Route path='/calling' element={<Colling />} />
          <Route path='/collPreview' element={<CollPreview />} />
          <Route path='/driveing' element={<Driveing />} />
          <Route path='/getOnGetOff' element={<GetOnGetOff />} />
          <Route path='/starScope' element={<StarScope />} />
          <Route path='/voiceRecord' element={<VoiceRecord />} />
          <Route path='/voiceRecordList' element={<VoiceRecordList />} />
          <Route path='/driveFinish' element={<DriveFinish />} />
          </Route>
      </Routes> 
    </div>
  )
}

export default App
