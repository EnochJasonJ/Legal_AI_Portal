import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginView from './Views/LoginView'
import HomePage from './Views/HomePage'
import CitationPage from './Views/CitationPage'
import VerifiedCitations from './Views/VerifiedCitations'
import RegisterView from './Views/RegisterView'
import NavBar from './Components/NavBar'
import SpeechAssist from './Components/SpeechAssist'
import { Toaster } from 'react-hot-toast'
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import { FaMicrophone, FaTimes } from "react-icons/fa"

function App() {
  const [showSpeechAssist, setShowSpeechAssist] = useState(false)
  const citations = JSON.parse(localStorage.getItem("citations")) || [];
  if (citations.length > 0) {
    console.log("Citations loaded from localStorage in App.jsx:", citations);
  } else {
    console.log("No citations found in localStorage in App.jsx.");
  }

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
        <Route path="/upload" element={<CitationPage />} />
        <Route path="/verified-citations" element={<VerifiedCitations />} />
        <Route path="/" element={<HomePage />} />
      </Routes>

      {/* Floating Microphone Button */}
      <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <Fab
          color="primary"
          aria-label="voice-assist"
          onClick={() => setShowSpeechAssist(true)}
        >
          <FaMicrophone />
        </Fab>
      </Box>

      {/* Glassmorphism Popup */}
      {showSpeechAssist && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowSpeechAssist(false)}
        >
          <Paper
            elevation={12}
            className='border-[1.5px] border-gray-400'
            sx={{
              position: 'relative',
              width: 400,
              p: 3,
              borderRadius: 4,
              backdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={() => setShowSpeechAssist(false)}>
                <FaTimes />
              </IconButton>
            </Box>
            <SpeechAssist citations={citations} closePopup={() => setShowSpeechAssist(false)} />
          </Paper>
        </Box>
      )}


      <Toaster position="top-right" reverseOrder={false} />
    </BrowserRouter>
  )
}

export default App
