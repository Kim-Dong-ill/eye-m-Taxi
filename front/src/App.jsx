import React from "react";
import { Routes, Route } from "react-router-dom";
import MainPage from "./page/MainPage";
import CallAccept from "./page/CallAccept";
import Calling from "./page/Calling";
import CallPreview from "./page/CallPreview";
import Driveing from "./page/Driveing";
import GetOnGetOff from "./page/GetOnGetOff";
import Login from "./page/Login";
import Register from "./page/Register";
import StarScope from "./page/StarScope";
import VoiceRecord from "./page/VoiceRecord";
import VoiceRecordList from "./page/VoiceRecordList";
import DriveFinish from "./page/DriveFinish";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import "./css/app.scss";
import PublicRoute from "./components/layout/PublicRoute.jsx";

function App() {
  return (
    <div className="mainContainer">
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>

        <Route element={<Layout />}>
          <Route element={<ProtectedRoute />}>
            <Route index element={<MainPage />} />
            <Route path="/callAccept" element={<CallAccept />} />
            <Route path="/calling" element={<Calling />} />
            <Route path="/callPreview" element={<CallPreview />} />
            <Route path="/driveing" element={<Driveing />} />
            <Route path="/getOnGetOff" element={<GetOnGetOff />} />
            <Route path="/starScope" element={<StarScope />} />
            <Route path="/voiceRecord" element={<VoiceRecord />} />
            <Route
              path="/voiceRecordList/:word"
              element={<VoiceRecordList />}
            />
            <Route path="/driveFinish" element={<DriveFinish />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
