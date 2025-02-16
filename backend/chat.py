

from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import cohere
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Initialize Cohere client with API key
cohere_api_key = os.getenv('COHERE_API_KEY')
co = cohere.Client(cohere_api_key)

def call_chat(message_text):
    try:
        # Use Cohere's chat method with the correct model name
        response = co.chat(
            model='c4ai-aya-expanse-8b',
            message=message_text,
            temperature=0.3,
            chat_history=[],
            prompt_truncation='AUTO'
        )
        return response.text
    except Exception as e:
        print(f"Error in call_chat: {str(e)}")
        return "Sorry, I couldn't generate a response."

def suggest_questions():
    questions = [
        "What are the well-known breakfasts in Western culture?",
        "What are the main holidays in Western culture?",
        "What are the main holidays in Arab culture?",
        "Tell me about artificial intelligence.",
        "What are some interesting facts about space exploration?"
    ]
    return random.sample(questions, 3)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        if not user_message:
            return jsonify({'status': 'error', 'message': 'No message provided'}), 400

        response = call_chat(user_message)
        return jsonify({'status': 'success', 'response': response})
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/suggestions', methods=['GET'])
def get_suggestions():
    try:
        return jsonify({'status': 'success', 'suggestions': suggest_questions()})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    print("Server starting on http://localhost:5000")
    app.run(debug=True, port=5000)