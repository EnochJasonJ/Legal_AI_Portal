import React, { useState } from 'react'
import axios from 'axios';
import CitationCard from '../Components/CitationCard';

function CitationPage() {
  const [file, setFile] = useState(null);
  const [docId, setDocId] = useState(null);
  const [results, setResults] = useState([]);
  const token = localStorage.getItem('token');
  console.log(token);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile);
    const formData = new FormData();
    formData.append('file', selectedFile);
    const response = await axios.post('http://localhost:8000/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Token ${localStorage.getItem('token')}`
      }
    });
    setDocId(response.data.doc_id);
    console.log(response.data);
    console.log(selectedFile.name);
  }

  const processCitations = async () => {
    try {
      const response = await axios.post('http://localhost:8000/citation-process/', { doc_id: docId }, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setResults(response.data.results);
      localStorage.setItem("citations", JSON.stringify(response.data.results));

      console.log("Citations stored in localStorage:", response.data.results);
      console.log(response.data);
    } catch (error) {
      console.error('Error processing citations:', error);
      alert('An error occurred while processing citations. Please try again.');
    }
  }

  const deleteFile = () => {
    setFile(null);
    setDocId(null);
    setResults([]);
    window.location.reload(true);
  }

  return (
    <div className=' min-h-screen pg flex flex-col items-center justify-start px-4 py-10 pt-24'>
      <div className='text-center'>
        <h1 className="mb-6 text-2xl font-bold">Upload the document</h1>
        <div className='flex flex-row items-center justify-center gap-4'>
          <label
            htmlFor="file-upload"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md cursor-pointer hover:bg-blue-700 transition-colors"
          >
            Choose File
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {file && <button type="submit" onClick={deleteFile} className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md cursor-pointer hover:bg-red-700 transition-colo</svg>rs">Delete File</button>}
          {docId && <button type="submit" onClick={processCitations} className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md cursor-pointer hover:bg-green-700 transition-colors">Verify Citations</button>}
        </div>
        {file && <p className='mt-4 underline underline-offset-4 '>Selected File: <span className='font-bold'>{file.name}</span></p>}
        {results.length > 0 && (
          <div className="my-8">
            <h2 className="text-xl font-bold mb-4">Citation Results</h2>
            <div className="flex flex-col items-center gap-6">
              {results.map((item, index) => (
                CitationCard({ item, key: index })

              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CitationPage