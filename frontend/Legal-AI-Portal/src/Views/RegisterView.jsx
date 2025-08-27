/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import Box from '@mui/material/Box';
// import { filledInputClasses } from '@mui/material/FilledInput';
import { Link, useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { HashLoader } from 'react-spinners';

function RegisterView() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/register/', {
                username,
                password,
                email
            })
            console.log(response.data);
            console.log(`Token: ${response.data.token}`);
            localStorage.setItem('token', response.data.token);
            toast('Registration Successful!',
                {
                    icon: '✅',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                }
            );
            
            setUsername('');
            setEmail('');
            setPassword('');
            setTimeout(() => {
                navigate('/login');
            }, 4500)
        } catch (error) {
            console.log(error)
            setIsLoading(false);
            setError('Registration failed! Please try again.');
            toast(error,
                {
                    icon: '❌',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                }
            );
        }
    }
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center animate-fade-in hover:scale-105">
                <h1 className="text-3xl font-bold mb-6 text-blue-700">Register</h1>
                <Box
                    component="form"
                    sx={{ '& > :not(style)': { m: 1, width: '100%' } }}
                    className="w-full flex flex-col gap-6 "
                    noValidate
                    autoComplete="off"
                    onSubmit={handleSubmit}
                >
                    <TextField
                        id="login-username"
                        label="Username"
                        variant="standard"
                        fullWidth
                        InputProps={{
                            sx: { borderRadius: 1, px: 1 },
                        }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        id="login-email"
                        label="Email"
                        variant="standard"
                        fullWidth
                        InputProps={{
                            sx: { borderRadius: 1, px: 1 },
                        }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        id="login-password"
                        label="Password"
                        type="password"
                        variant="standard"
                        fullWidth
                        InputProps={{
                            sx: { borderRadius: 1, px: 1 },
                        }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className='flex flex-row items-center justify-center gap-2 text-gray-600 font-medium'>
                        <p className="font-bold">Already a User? </p>
                        <Link to="/login" className="text-blue-400">Login</Link>
                    </div>
                    <button
                        type="submit"
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-blue-300 font-semibold py-2 rounded-lg shadow transition-colors duration-200"
                    >
                        Sign Up
                    </button>
                </Box>
            </div>
            {isLoading && <div className="fixed inset-0 bg-[#ffffff6c] backdrop-blur-[2px] flex flex-col items-center justify-center gap-5">
                            <HashLoader color="#000000" />
                            <h1 className='font-bold text-2xl'>Redirecting to Login Page</h1>
                        </div>}
        </div>
    );
}

export default RegisterView