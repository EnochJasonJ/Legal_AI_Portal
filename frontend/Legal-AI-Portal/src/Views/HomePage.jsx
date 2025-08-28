import React from 'react'
import { Typewriter } from 'react-simple-typewriter'
import { useNavigate } from 'react-router-dom';

function HomePage() {

    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const getStartedLink = () => token ? navigate('/upload') : navigate('/login');
    const learnMoreLink = () => navigate('/learn-more');

    return (
        <div className="min-h-screen pg flex flex-col items-center justify-center px-4 py-10">
            <section className="w-full max-w-3xl text-center mb-12 animate-fade-in">
                {/* <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4 drop-shadow-lg">Welcome to Legal AI Portal</h1> */}
                <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4 drop-shadow-lg">
                    <Typewriter
                        words={['Welcome to Legal AI Portal']}
                        loop={1}
                        cursor
                        cursorStyle="|"
                        typeSpeed={70}
                        deleteSpeed={50}
                        delaySpeed={1000}
                    />
                </h1>
                <p className="text-lg md:text-xl text-gray-700 mb-6">Empowering your legal research with AI-driven citation analysis and document intelligence.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={getStartedLink} className="px-8 py-3 bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded-lg hover:border hover:border-white shadow transition-all duration-500 ease-in-out">Get Started</button>
                    <button onClick={learnMoreLink} className="px-8 py-3 bg-white border border-blue-600 text-blue-700 font-semibold rounded-lg shadow hover:bg-blue-700 hover:border-white hover:text-white transition-all duration-500 ease-in-out">Learn More</button>
                </div>
            </section>
            <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border-t-4 border-blue-400 hover:scale-105 transition-all duration-500 ease-in-out">
                    <svg className="w-10 h-10 mb-3 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3v1a3 3 0 006 0v-1c0-1.657-1.343-3-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19 10v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" /></svg>
                    <h3 className="font-bold text-lg mb-2 text-blue-700">AI Citation Analysis</h3>
                    <p className="text-gray-600">Instantly verify and summarize legal citations in your documents with advanced AI models.</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border-t-4 border-green-400 hover:scale-105 transition-all duration-500 ease-in-out">
                    <svg className="w-10 h-10 mb-3 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 018 0v2" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 7a4 4 0 110 8 4 4 0 010-8z" /></svg>
                    <h3 className="font-bold text-lg mb-2 text-green-700">Secure Document Upload</h3>
                    <p className="text-gray-600">Upload your legal documents securely and privately for analysis and citation extraction.</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border-t-4 border-purple-400 hover:scale-105 transition-all duration-500 ease-in-out">
                    <svg className="w-10 h-10 mb-3 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0-5V3m-8 9v6a2 2 0 002 2h4a2 2 0 002-2v-6" /></svg>
                    <h3 className="font-bold text-lg mb-2 text-purple-700">Insightful Summaries</h3>
                    <p className="text-gray-600">Receive concise, trustworthy summaries and scores for every citation found in your files.</p>
                </div>
            </section>
        </div>
    );
}

export default HomePage