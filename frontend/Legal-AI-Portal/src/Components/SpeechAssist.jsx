import React, { useState, useRef } from 'react'
import IconButton from '@mui/material/IconButton'
import { FaStop, FaTimes } from 'react-icons/fa'
import axios from 'axios'

function SpeechAssist({ citations, closePopup }) {
    const [listening, setListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [answer, setAnswer] = useState("")
    const [loading, setLoading] = useState(false)
    const [stop, setStop] = useState(false)
    const controller = useRef(null)

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.lang = 'en-US'

    const startListening = () => {
        setListening(true)
        recognition.start()

        recognition.onresult = (event) => {
            const speechText = event.results[0][0].transcript
            setTranscript(speechText)
            sendToBackend(speechText)
        }

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error)
            setListening(false)
        }

        recognition.onend = () => {
            setListening(false)
        }
    }

    const sendToBackend = async (text) => {
        setAnswer("")
        setStop(false)
        setLoading(true)
        controller.current = new AbortController()

        try {
            const response = await axios.post("http://localhost:8000/voice-assist/", {
                text: text,
                context: citations
            }, { signal: controller.current.signal })

            const fullAnswer = response.data.answer
            const synth = window.speechSynthesis
            const utterance = new SpeechSynthesisUtterance(fullAnswer)
            synth.speak(utterance)

            // Stream the text gradually
            for (let i = 0; i < fullAnswer.length; i++) {
                if (stop) break
                setAnswer(prev => prev + fullAnswer[i])
                await new Promise(r => setTimeout(r, 20))
            }

        } catch (error) {
            if (error.name !== 'AbortError') console.error(error)
        }

        setLoading(false)
    }

    const handleStop = () => {
        setStop(true)
        controller.current?.abort()
        window.speechSynthesis.cancel()
        closePopup() // close the Paper popup immediately
    }

    return (
        <div>
            <h2>Voice Assistance</h2>
            <button
                className='bg-black text-gray-300 border-[1px] border-gray-400 px-5 py-2 rounded-md'
                onClick={startListening}
                disabled={listening}
            >
                {listening ? "Listening..." : "Start Listening"}
            </button>

            <p><strong>You: </strong>{transcript}</p>

            <div style={{ maxHeight: '40vh', overflowY: 'auto', border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}>
                <strong>Assistant: </strong>{answer}
            </div>

            {loading && (
                <IconButton onClick={handleStop} color="error">
                    <FaStop />
                </IconButton>
            )}
        </div>
    )
}


export default SpeechAssist
