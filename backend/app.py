# backend/app.py

import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS # Import CORS for handling cross-origin requests
from dotenv import load_dotenv
import traceback # Import traceback for detailed error logging

# Load environment variables from .env file
load_dotenv()
# backend/app.py

# ... 다른 import 문들 ...
from dotenv import load_dotenv
import traceback # Import traceback for detailed error logging

# .env 파일에서 환경 변수 로드
load_dotenv()
# --- 디버깅 코드 추가 ---
print(f"--- Loaded API Key from .env: {os.getenv('GEMINI_API_KEY')} ---")
# ----------------------
api_key = os.getenv("GEMINI_API_KEY") # 이 줄은 원래 있던 코드

# ... 나머지 코드 ...
# Initialize Flask app
app = Flask(__name__)
# Configure CORS: Allow requests from all origins for development.
# For production, restrict this to your frontend's domain for security.
CORS(app)

# Configure Gemini API
try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in .env file.")
        model = None
    else:
        genai.configure(api_key=api_key)
        # Select the model to use
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        print("Gemini API configured successfully.")
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    model = None # Set model to None if configuration fails

# API endpoint for generating presentation draft
@app.route('/api/generate', methods=['POST'])
def generate_presentation_api():
    # Return an error if the Gemini model failed to load
    if model is None:
        return jsonify({"error": "Gemini API configuration failed. Check API key and environment variables."}), 500

    # Get JSON data sent from the frontend
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    # Extract input data
    topic = data.get('topic')
    audience = data.get('audience')
    length_minutes = data.get('lengthMinutes') # Match key name from React code

    # Validate required input fields
    if not topic or not audience or not length_minutes:
        return jsonify({"error": "Missing required fields: topic, audience, lengthMinutes"}), 400

    try:
        # --- Construct the prompt for the LLM ---
        # This prompt guides the AI on what kind of output you want.
        # You can modify this prompt to improve the quality or format of the results.
        prompt = f"""
        Create a presentation draft outline based on the following requirements:
        Topic: {topic}
        Target Audience: {audience}
        Desired Length: Approximately {length_minutes} minutes

        Provide the output as a structured outline, including slide titles and key bullet points for each slide.
        Estimate the number of slides based on the length (around 2-3 minutes per core content slide).
        Start with a Title slide, Introduction/Agenda, then core content slides, and end with Conclusion/Q&A.
        Focus on clear, concise points suitable for a presentation.
        Generate the output in Markdown format.
        """

        print(f"--- Sending prompt to Gemini --- \n{prompt}\n-----------------------------")

        # Call the Gemini API to generate content
        response = model.generate_content(prompt)

        print(f"--- Received response from Gemini ---")
        # print(response.text) # Uncomment for debugging: print the full response text

        # Return the generated text in JSON format to the frontend
        # Note: Currently returns the entire generated text as a single string.
        # The React frontend needs to be adjusted to display this text directly.
        return jsonify({"draft": response.text})

    except Exception as e:
        print(f"Error during Gemini API call: {e}")
        # Print detailed error traceback for debugging
        traceback.print_exc()
        return jsonify({"error": f"Failed to generate presentation draft: {str(e)}"}), 500

# Run the Flask development server
if __name__ == '__main__':
    # host='0.0.0.0' makes the server accessible from other devices on the same network
    # debug=True enables auto-reloading and provides more detailed error messages during development
    app.run(debug=True, host='0.0.0.0', port=5000)
