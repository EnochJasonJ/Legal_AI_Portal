import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginView from './Views/LoginView'
import HomePage from './Views/HomePage'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
      <Toaster position="top-right" reverseOrder={false} />
    </BrowserRouter>
  )
}

export default App