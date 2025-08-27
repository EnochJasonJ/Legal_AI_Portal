import React, { useState, useEffect } from 'react'
import axios from 'axios'
import CitationCard from '../Components/CitationCard';
import { IoIosWarning } from "react-icons/io";
function VerifiedCitations() {
    const token = localStorage.getItem('token');
    const [results, setResults] = useState([]);
    const fetchCitations = async () => {
        try {
            const response = await axios.get("http://localhost:8000/fetch-citations/", {
                headers: {
                    'Authorization': `Token ${token}`
                }
            })
            console.log(response.data);
            setResults(response.data);
        }
        catch (error) {
            console.log("Error fetching citations:", error);
            alert("An error occurred while fetching citations. Please try again.");
        }
    }
    useEffect(() => {
        const fetchData = async () => {
            await fetchCitations();
        };
        fetchData();
        // eslint-disable-next-line
    }, []);
    return (
        <div className="min-h-screen pg flex flex-col items-center justify-start px-4 py-10 pt-28">
            <h1 className="font-extrabold text-4xl md:text-5xl drop-shadow-lg text-blue-800 mb-8 tracking-tight animate-fade-in">Verified Citations</h1>
            <div>
                {results.length > 0 ? (
                    <div className="w-full flex flex-col max-w-4xl mx-auto my-8 gap-10 animate-fade-in">
                        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> */}
                            {results.map((item, index) => (
                                <CitationCard item={item} key={index} />
                            ))}
                        {/* </div> */}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4 mt-24 animate-fade-in">
                        <IoIosWarning className="text-yellow-400 text-5xl mb-2 animate-bounce" />
                        <p className="font-bold text-2xl text-yellow-400">No verified citations found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}


export default VerifiedCitations