import React from 'react';
import { Link } from 'react-router-dom';

function LearnMore() {
  return (
    <div className="min-h-screen pg text-gray-800">
      {/* Hero Section */}
      <section className="text-center py-16 px-6">
        <h1 className="text-4xl font-bold text-blue-700 mt-15 mb-4">Why Legal AI Portal?</h1>
        <p className="text-xl mb-4">Empowering your legal research with smart AI tools.</p>
        <p className="max-w-2xl mx-auto text-gray-600">
          Legal AI Portal uses advanced AI models to instantly verify citations, summarize legal
          documents, and provide accurate trust scores to help legal professionals make faster,
          informed decisions.
        </p>
      </section>

      {/* Features Section */}
      <section className="py-12 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {[
          { title: "AI Citation Analysis", desc: "Summarize and verify citations instantly." },
          { title: "Secure Document Upload", desc: "Upload legal documents safely." },
          { title: "Insightful Summaries", desc: "Generate concise summaries for easier decision-making." },
          { title: "Trust & Semantic Scores", desc: "Measure reliability of citations and content." },
        ].map((f, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-500 ease-in-out">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-white shadow-inner">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
          {["Upload your document.", "AI scans and extracts citations.", "Summaries and scores are generated.", "Download results or view verified citations."].map((step, idx) => (
            <div key={idx} className="p-6 bg-blue-50  rounded-xl shadow hover:shadow-xl hover:scale-105 transition-all duration-500 ease-in-out">
              <div className="text-3xl font-bold text-blue-600 mb-4">{idx + 1}</div>
              <p className="text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">Why Use Legal AI Portal?</h2>
        <ul className="space-y-4 text-lg text-gray-700">
          <li>✅ Save hours of manual research.</li>
          <li>✅ Ensure accuracy in legal citations.</li>
          <li>✅ Reduce human errors in document review.</li>
          <li>✅ AI-powered insights for better legal decisions.</li>
        </ul>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-blue-50">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[
            "Legal AI Portal cut my research time in half!",
            "The summaries and scores are extremely reliable.",
          ].map((quote, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow hover:shadow-xl hover:scale-105 transition-all duration-500 ease-in-out">
              <p className="text-gray-700 italic">“{quote}”</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-4">
          Ready to simplify your legal research?
        </h2>
        <p className="text-gray-600 mb-6">Get Started Today.</p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            to="/upload"
            className="bg-gray-100 text-blue-600 px-6 py-3 rounded-lg shadow hover:bg-gray-200 transition"
          >
            Upload Documents
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-white shadow-inner">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6 text-gray-700">
          <div className='bg-gray-100 py-2 px-2 w-[600px] rounded-md shadow-md'>
            <h3 className="font-semibold"><strong>Question: </strong>Is my document secure?</h3>
            <p><strong>Answer:  </strong>Yes, we use secure protocols to protect your uploaded files.</p>
          </div>
          <div className='bg-gray-100 py-2 px-2 w-[600px] rounded-md shadow-md'>
            <h3 className="font-semibold"><strong>Question: </strong>How accurate are the AI summaries?</h3>
            <p><strong>Answer:  </strong>Our AI models are fine-tuned for legal text and continuously improving for accuracy.</p>
          </div>
          <div className='bg-gray-100 py-2 px-2 w-[600px] rounded-md shadow-md'>
            <h3 className="font-semibold"><strong>Question: </strong>Can I download results?</h3>
            <p><strong>Answer:  </strong>Yes, you can export results after processing.</p>
          </div>
          <div className='bg-gray-100 py-2 px-2 w-[600px] rounded-md shadow-md'>
            <h3 className="font-semibold"><strong>Question: </strong>Do I need an account to use the platform?</h3>
            <p><strong>Answer:  </strong>Some features are available without an account, but registering unlocks the full experience.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LearnMore;