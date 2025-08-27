import React, { useState } from 'react'
import Box from '@mui/material/Box';
// import { filledInputClasses } from '@mui/material/FilledInput';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { HashLoader } from 'react-spinners';
import {Link} from 'react-router-dom';


function LoginView() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading,setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/login/', {
                username,
                password
            })
            console.log(response.data);
            console.log(`Token: ${response.data.token}`);
            localStorage.setItem('token', response.data.token);
            toast('Login Successful!',
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
            setPassword('');
            setTimeout(()=>{
                navigate('/');
            },4500)
        } catch (error) {
            console.log(error)
            setIsLoading(false);
            setError('Login failed. Please check your credentials and try again.');
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
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center animate-fade-in hover:scale-105 hover:shadow-blue-500 hover:shadow-lg transition-all duration-500 ease-in-out">
                <h1 className="text-3xl font-bold mb-6 text-blue-700">Login</h1>
                <Box
                    component="form"
                    sx={{ '& > :not(style)': { m: 1, width: '100%' } }}
                    noValidate
                    autoComplete="off"
                    className="w-full flex flex-col gap-6 "
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
                        <p className="font-bold">New User? </p>
                        <Link to="/register" className="text-blue-400">Register</Link>
                    </div>
                    <button
                        type="submit"
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-blue-300 font-semibold py-2 rounded-lg shadow transition-colors duration-200"
                    >
                        Sign In
                    </button>
                </Box>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
            {isLoading && <div className="fixed inset-0 bg-[#ffffff6c] backdrop-blur-[2px] flex flex-col items-center justify-center gap-5">
                <HashLoader color="#000000" />
                <h1 className='font-bold text-2xl'>Redirecting to Home Page</h1>
            </div>}
        </div>
    );
}

export default LoginView