
import React, { memo } from 'react'

import UserOnline from '../src/components/UserOnline'
import RoomCalling from '../src/components/RoomCalling'
import Login from '../src/components/Login'
import {
  Routes,
  Route
} from 'react-router-dom';
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/UserOnline" element={<UserOnline />}></Route>
        <Route path="/room/:id" element={<RoomCalling />}></Route>
      </Routes>
    </div>
  )
}

export default App