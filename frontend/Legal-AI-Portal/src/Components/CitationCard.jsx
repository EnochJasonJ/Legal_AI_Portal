import React from "react";

function CitationCard({ item }) {
  return (
    <div className="crd  w-full max-w-3xl rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-3 animate-fade-in">
      {/* Citation */}
      <div className="flex flex-row items-center gap-2 mb-2">
        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold tracking-wide">
          Citation
        </span>
        <span className="font-medium text-gray-800">{item.raw_text}</span>
      </div>

      {/* Case */}
      <div className="flex flex-row items-center gap-2">
        <span className="inline-block px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
          Case
        </span>
        <span className="font-semibold text-gray-700">{item.case_name}</span>
      </div>

      {/* Court */}
      <div className="flex flex-row items-center gap-2">
        <span className="inline-block px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
          Court
        </span>
        <span className="text-gray-500">{item.court}</span>
      </div>

      {/* Date */}
      <div className="flex flex-row items-center gap-2">
        <span className="inline-block px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs">
          Date
        </span>
        <span className="text-gray-600">{item.date}</span>
      </div>

      {/* Summary */}
      <div className="mt-2">
        <span className="font-semibold text-blue-600">Summary:</span>
        <p className="mt-1 text-gray-700 text-left crd rounded p-3 ">
          {item.summary}
        </p>
      </div>

      {/* Scores */}
      <div className="flex flex-row gap-4 mt-2">
        <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
          Semantic Score
        </span>
        <span className="font-bold text-purple-700">
          {item.semantic_score?.toFixed(2)}
        </span>
        <span className="inline-block px-2 py-1 bg-pink-50 text-pink-700 rounded text-xs">
          Trust Score
        </span>
        <span className="font-bold text-pink-700">{item.trust_score}</span>
      </div>

      {/* Source link */}
      {item.source_url && (
        <a
          href={`https://www.courtlistener.com${item.source_url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-blue-600 hover:text-blue-800 underline font-semibold transition-colors"
        >
          View Source
        </a>
      )}
    </div>
  );
}

export default CitationCard;
