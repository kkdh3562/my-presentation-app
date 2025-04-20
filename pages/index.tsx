import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Bot, Zap, Users, Clock, FileText, Loader2, Wand2 } from 'lucide-react';

// Define the backend URL (adjust if your backend runs on a different port)
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const PresentationGenerator: NextPage = () => {
  // --- State Variables ---
  const [topic, setTopic] = useState<string>('Introduction to Quantum Computing');
  const [audience, setAudience] = useState<string>('University Students (CS Major)');
  const [lengthMinutes, setLengthMinutes] = useState<number>(15);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Changed presentation state to hold the string draft from the backend
  const [presentation, setPresentation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Function to call the backend API ---
  const generatePresentation = async () => {
    setIsLoading(true);
    setError(null);
    setPresentation(null); // Clear previous presentation

    // Basic input validation
    if (!topic.trim() || !audience.trim() || lengthMinutes <= 0) {
        setError('Please fill in all fields with valid values.');
        setIsLoading(false);
        return;
    }

    try {
        // --- Call the Backend API using fetch ---
        const response = await fetch(`${BACKEND_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Send user inputs in the request body as JSON
            body: JSON.stringify({
                topic: topic,
                audience: audience,
                lengthMinutes: lengthMinutes, // Key name matches backend expectation
            }),
        });

        // --- Handle the response ---
        if (!response.ok) {
            // If server returns an error (e.g., 4xx, 5xx status code)
            const errorData = await response.json().catch(() => ({})); // Try to parse error JSON, default to empty object
            // Throw an error to be caught by the catch block
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        // If response is successful (e.g., 2xx status code)
        const result = await response.json();

        // Update the presentation state with the draft text from the backend
        setPresentation(result.draft);

    } catch (e) {
        // Handle network errors or errors thrown from the response handling
        console.error("Error generating presentation:", e);
        setError(e.message || 'Failed to generate presentation. Please check the connection or backend server.');
    } finally {
        // Ensure loading indicator is hidden regardless of success or failure
        setIsLoading(false);
    }
  };

  // --- JSX for Rendering the UI ---
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 md:p-8 font-sans">
        <Head>
            <title>AI Presentation Generator</title>
            {/* Include Google Fonts if needed, e.g., Inter */}
           
        </Head>

      <header className="w-full max-w-4xl mb-8 md:mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-3 flex items-center justify-center gap-3">
            <Wand2 size={40} /> AI Presentation Drafter
        </h1>
        <p className="text-gray-400 text-lg md:text-xl">Let AI kickstart your next presentation based on your needs. Made by Donghui</p>
      </header>

      <main className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row gap-8">

        {/* Input Section (No changes needed here) */}
        <div className="md:w-1/3 flex flex-col gap-5">
            <h2 className="text-2xl font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-2 flex items-center gap-2"><FileText size={20}/> Specify Details</h2>

            <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-400 mb-1.5">Presentation Topic</label>
                <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Future of Renewable Energy"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition duration-200 text-gray-100"
                />
            </div>

             <div>
                <label htmlFor="audience" className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-1.5"><Users size={16}/> Target Audience</label>
                <input
                    id="audience"
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g., High School Students"
                     className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition duration-200 text-gray-100"
                />
            </div>

             <div>
                <label htmlFor="length" className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-1.5"><Clock size={16}/> Desired Length (minutes)</label>
                <input
                    id="length"
                    type="number"
                    value={lengthMinutes}
                    onChange={(e) => setLengthMinutes(parseInt(e.target.value) || 0)}
                    min="5"
                    max="60"
                    step="5"
                     className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition duration-200 text-gray-100 appearance-none" // Added appearance-none
                />
            </div>

            <button
                onClick={generatePresentation}
                disabled={isLoading}
                className={`w-full mt-4 p-3 rounded-lg font-semibold text-white transition duration-200 flex items-center justify-center gap-2 ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/30'}`}
            >
                {isLoading ? (
                    <><Loader2 size={20} className="animate-spin"/> Generating...</>
                ) : (
                    <><Zap size={20}/> Generate Draft</>
                )}
            </button>
            {error && <p className='text-red-400 text-sm mt-2 text-center'>{error}</p>}
        </div>

        {/* Output Section (JSX rendering logic updated) */}
        <div className="md:w-2/3 flex flex-col">
             <h2 className="text-2xl font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-4 flex items-center gap-2"><Bot size={20}/> Generated Draft</h2>
             <div className='flex-grow bg-gray-850 p-4 rounded-lg border border-gray-700 min-h-[300px] max-h-[60vh] overflow-y-auto custom-scrollbar'>
                {isLoading && (
                    <div className='flex flex-col items-center justify-center h-full text-gray-500'>
                        <Loader2 size={40} className='animate-spin mb-4 text-purple-400'/>
                        <p>AI is drafting your presentation...</p>
                        <p className='text-sm mt-1'>Topic: {topic}</p>
                    </div>
                )}
                {!isLoading && !presentation && !error && (
                     <div className='flex flex-col items-center justify-center h-full text-gray-500 text-center p-6'>
                        <FileText size={40} className='mb-4 text-gray-600'/>
                        <p className='font-medium'>Your presentation draft will appear here.</p>
                        <p className='text-sm mt-1'>Fill in the details and click 'Generate Draft'.</p>
                    </div>
                )}
                 {/* --- Updated JSX to display the presentation string --- */}
                 {!isLoading && presentation && (
                    // Use whitespace-pre-wrap to preserve line breaks and spacing from the backend response
                    <div className='whitespace-pre-wrap text-gray-300 text-sm'>
                        {presentation}
                    </div>
                 )}
                 {/* Display error message if there is one */}
                 {!isLoading && error && !presentation &&(
                     <div className='flex flex-col items-center justify-center h-full text-red-400 text-center p-6'>
                         <p className='font-medium'>Error generating draft:</p>
                         <p className='text-sm mt-1'>{error}</p>
                     </div>
                 )}
             </div>
        </div>

      </main>
        <footer className='text-center text-gray-500 text-sm mt-8'>
            Powered by AI Magic ✨ (via Backend)
        </footer>
        {/* Global styles for scrollbar and number input appearance */}
        <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: #1f2937; /* gray-800 */
                 border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #4b5563; /* gray-600 */
                border-radius: 10px;
            }
             .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #6b7280; /* gray-500 */
            }
            /* Hide spinner buttons on number input for Webkit */
            input[type=number]::-webkit-inner-spin-button,
            input[type=number]::-webkit-outer-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
            /* Hide spinner buttons on number input for Firefox */
            input[type=number] {
              -moz-appearance: textfield;
            }
        `}</style>
    </div>
  );
};

export default PresentationGenerator;

