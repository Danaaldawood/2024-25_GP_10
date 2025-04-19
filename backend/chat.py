from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import requests
from dotenv import load_dotenv
import os
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
# CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

CORS(app, resources={r"/api/*": {"origins": [
    "https://gp-frontend-om9b.onrender.com", 
    "http://localhost:3000"
]}})
# Initialize Hugging Face API key
hf_api_key = os.getenv('HF_API_KEY')
hf_headers = {"Authorization": f"Bearer {hf_api_key}"}

# Model IDs for Mistral and Llama
MISTRAL_MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.3"
LLAMA_MODEL_ID = "meta-llama/Llama-2-7b-chat-hf"

def call_model_a(message_text):
    try:
        # Format input as Mistral expects
        formatted_prompt = f"<s>[INST] {message_text} [/INST]"
        
        # Call the Mistral model
        payload = {
            "inputs": formatted_prompt,
            "parameters": {
                "max_new_tokens": 200,
                "temperature": 0.3,
                "top_p": 0.9,
                "do_sample": True,
                "return_full_text": False
            }
        }
        
        print(f"Calling Mistral model")
        
        response = requests.post(
            f"https://api-inference.huggingface.co/models/{MISTRAL_MODEL_ID}",
            headers=hf_headers,
            json=payload,
            timeout=90
        )
        
        if response.status_code != 200:
            print(f"Error from Model A (Mistral): {response.status_code}, {response.text}")
            return f"Sorry, I couldn't generate a response from Mistral model."
        
        result = response.json()
        
        # Handle different response formats
        text_response = ""
        if isinstance(result, list) and len(result) > 0:
            if isinstance(result[0], dict) and "generated_text" in result[0]:
                text_response = result[0]["generated_text"]
            else:
                text_response = str(result[0])
        else:
            text_response = str(result)
        
        # Clean up the response by removing instruction tokens if they appear in the output
        clean_response = text_response
        if "[INST]" in clean_response and "[/INST]" in clean_response:
            try:
                clean_response = clean_response.split("[/INST]", 1)[1].strip()
            except:
                pass
        
        return clean_response
    except Exception as e:
        print(f"Error in call_model_a: {str(e)}")
        return f"Sorry, I couldn't generate a response from Mistral model."

def call_model_b(message_text):
    try:
        # Format input as Llama-2 expects
        formatted_prompt = f"<s>[INST] {message_text} [/INST]"
        
        payload = {
            "inputs": formatted_prompt,
            "parameters": {
                "max_new_tokens": 200,
                "temperature": 0.3,
                "top_p": 0.9,
                "do_sample": True
            }
        }
        
        print(f"Calling Llama model")
        
        response = requests.post(
            f"https://api-inference.huggingface.co/models/{LLAMA_MODEL_ID}",
            headers=hf_headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code != 200:
            print(f"Error from Model B: {response.status_code}, {response.text}")
            return f"Sorry, I couldn't generate a response from Llama model."
        
        result = response.json()
        
        # Handle different response formats
        text_response = ""
        if isinstance(result, list) and len(result) > 0:
            if isinstance(result[0], dict) and "generated_text" in result[0]:
                text_response = result[0]["generated_text"]
            else:
                text_response = str(result[0])
        else:
            text_response = str(result)
        
        # Clean up the response by removing instruction tokens if they appear in the output
        clean_response = text_response
        if "[INST]" in clean_response and "[/INST]" in clean_response:
            try:
                clean_response = clean_response.split("[/INST]", 1)[1].strip()
            except:
                pass
        
        return clean_response
    except Exception as e:
        print(f"Error in call_model_b: {str(e)}")
        return f"Sorry, I couldn't generate a response from Llama model."

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
        model_type = data.get('model_type', 'A')  # Default to Model A if not specified
        
        if not user_message:
            return jsonify({'status': 'error', 'message': 'No message provided'}), 400
        
        if model_type == 'A':
            response = call_model_a(user_message)
        else:  # Model B
            response = call_model_b(user_message)
            
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
    port = int(os.environ.get("PORT", 5001))
    print("Server starting on http://localhost:5001")
    # app.run(debug=True, port=5001)
    app.run(debug=True, host='0.0.0.0', port=port)




