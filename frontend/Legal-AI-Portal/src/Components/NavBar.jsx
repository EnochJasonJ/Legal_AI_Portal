import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

function NavBar() {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
        window.location.reload(true);
    }
    return (
        <header className="fixed top-0 left-0 w-full z-50">
            <nav className="flex items-center justify-between px-6 py-3 bg-white/20 backdrop-blur-lg shadow-lg rounded-b-2xl border-b border-white/30">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-blue-700 tracking-tight drop-shadow-sm">LegalAI</span>
                </div>
                <ul className="flex flex-row items-center gap-8 text-base font-bold">
                    <li>
                        <Link to="/" className="text-gray-800 hover:text-blue-700 transition-colors duration-300 ease-in-out px-2 py-1 rounded focus:text-blue-500">Home</Link>
                    </li>
                    <li>
                        <Link to="/upload" className="text-gray-800 hover:text-blue-700 transition-colors duration-300 ease-in-out px-2 py-1 rounded focus:text-blue-500">Upload Documents</Link>
                    </li>
                    <li>
                        <Link to="/verified-citations" className="text-gray-800 hover:text-blue-700 transition-colors duration-300 ease-in-out px-2 py-1 rounded focus:text-blue-500">Verified Citations</Link>
                    </li>
                    {token ? (<li>
                        <button onClick={handleLogout} className="text-gray-800 hover:text-blue-700 transition-colors duration-300 ease-in-out px-2 py-1 rounded focus:text-blue-500">Logout</button>
                    </li>) : (<li>
                        <Link to="/login" className="text-gray-800 hover:text-blue-700 transition-colors duration-300 ease-in-out px-2 py-1 rounded focus:text-blue-500">Login</Link>
                    </li>) }
                </ul>
            </nav>
        </header>
    )
}

export default NavBar
