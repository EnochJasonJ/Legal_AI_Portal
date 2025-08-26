import React, { useState } from 'react'
import axios from 'axios';

function HomePage() {
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
      console.log(response.data);
    } catch (error) {
      console.error('Error processing citations:', error);
      alert('An error occurred while processing citations. Please try again.');
    }
  }

  const deleteFile = () => {
    setFile(null);
  }

  return (
    <div>
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
          {file && <button type="submit" onClick={deleteFile} className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md cursor-pointer hover:bg-red-700 transition-colors">Delete File</button>}
          {docId && <button type="submit" onClick={processCitations} className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md cursor-pointer hover:bg-green-700 transition-colors">Verify Citations</button>}
        </div>
        {file && <p className='mt-4 underline underline-offset-4 '>Selected File: <span className='font-bold'>{file.name}</span></p>}
        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Citation Results</h2>
            <div className="space-y-4">
              {results.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                  <p><strong>Citation:</strong> {item.citation}</p>
                  <p><strong>Case:</strong> {item.case_name} ({item.court})</p>
                  <p><strong>Date:</strong> {item.date}</p>
                  <p><strong>Summary:</strong> {item.summary}</p>
                  <p><strong>Semantic Score:</strong> {item.semantic_summary.toFixed(2)}</p>
                  <p><strong>Trust Score:</strong> {item.trust_score}</p>
                  {item.source_url && (
                    <a href={`https://www.courtlistener.com${item.source_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      View Source
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage