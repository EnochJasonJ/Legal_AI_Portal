import React from 'react'
import Box from '@mui/material/Box';
// import { filledInputClasses } from '@mui/material/FilledInput';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';


function LoginView() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center animate-fade-in hover:scale-105 hover:shadow-blue-500 hover:shadow-lg transition-all duration-500 ease-in-out">
                <h1 className="text-3xl font-bold mb-6 text-blue-700">Login</h1>
                {/* <form className="w-full flex flex-col gap-6 " autoComplete='off'> */}
                    <Box
                        component="form"
                        sx={{ '& > :not(style)': { m: 1, width: '100%' } }}
                        noValidate
                        autoComplete="off"
                    >
                        <TextField
                            id="login-email"
                            label="Email"
                            variant="standard"
                            fullWidth
                            InputProps={{
                                sx: { borderRadius: 1, px: 1 },
                            }}
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
                        />
                    </Box>
                    <button
                        type="submit"
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-blue-300 font-semibold py-2 rounded-lg shadow transition-colors duration-200"
                    >
                        Sign In
                    </button>
                {/* </form> */}
            </div>
        </div>
    );
}

export default LoginView