import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'

const App = () => {
  return (
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  )
}

export default App