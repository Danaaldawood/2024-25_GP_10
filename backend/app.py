from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from firebase_admin import credentials, db, initialize_app
import json
import os
import random
import requests
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()


# --- Flask Setup ---
app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": [
        "http://localhost:3000",
        "https://gp-frontend-om9b.onrender.com",
        "https://culturelens.info",
        "https://www.culturelens.info"
    ],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True
}})


# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Firebase Setup ---
try:
    if os.environ.get('FIREBASE_CREDENTIALS'):
        firebase_credentials = json.loads(os.environ.get('FIREBASE_CREDENTIALS'))
        cred = credentials.Certificate(firebase_credentials)
    else:
        cred = credentials.Certificate("serviceAccountKey.json")
    initialize_app(cred, {'databaseURL': 'https://culturelens-4872c-default-rtdb.firebaseio.com/'})
    logger.info("Firebase initialized successfully")
except Exception as e:
    logger.error(f"Error initializing Firebase: {str(e)}")

# --- Model API Setup ---
HF_TOKEN_BASELINE = os.getenv('HF_API_KEY')
HF_TOKEN_FINETUNE = os.getenv('HF_TOKEN_FINETUNE')
HF_TOKEN_LLAMA = os.getenv('HF_TOKEN_LLAMA')

if not HF_TOKEN_BASELINE:
    logger.warning("HF_API_KEY is not set")
if not HF_TOKEN_FINETUNE:
    logger.warning("HF_TOKEN_FINETUNE is not set")
if not HF_TOKEN_LLAMA:
    logger.warning("HF_TOKEN_LLAMA is not set")

# Model IDs
MISTRAL_MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.3"
LLAMA_MODEL_ID = "llama-2-7b-chat-hf-wbv"
MISTRAL_FINETUNED_ID = "GPCUL/mistral_finetunedAllAfter-zeq"
LLAMA_FINETUNED_ID = "GPCUL/llama-fine-tuned-uat"


# --- Load Regional Datasets ---
try:
    llama_datasets = {
        "Arab": pd.read_csv("./test_bank_arabic_chat_llama2.csv", encoding="utf-8"),
        "Western": pd.read_csv("./test_bank_western_chat_llama2.csv", encoding="utf-8"),
        "Chinese": pd.read_csv("./test_bank_chinese_chat_llama2.csv", encoding="utf-8"),
    }
    llama_hofstede_datasets = {
        "Arab": pd.read_csv("./hofsted_arab_baselineL.csv", encoding="utf-8"),
        "Western": pd.read_csv("./hofsted_west_baslineL.csv", encoding="utf-8"),
        "Chinese": pd.read_csv("./hofsted_chin_baselineL.csv", encoding="utf-8"),
    }
    llama_finetuned_hofstede_datasets = {
        "Arab": pd.read_csv("./hofsted_llama finetune_arab (1).csv", encoding="utf-8"),
        "Chinese": pd.read_csv("./hofsted_llama finetune_Chinese (1).csv", encoding="utf-8"),
        "Western": pd.read_csv("./hofsted_llama finetune_west (1).csv", encoding="utf-8"),
    }
    llama_finetuned_datasets = {
        "All Topics": pd.read_csv("./chatAllTopic_finetundllama.csv"),
        "Work life": pd.read_csv("./llama_chat_finetundtest_bank_worklife.csv"),
        "Sport": pd.read_csv("./llama_chat_finetundtest_bank_sport.csv"),
        "Holidays/Celebration/Leisure": pd.read_csv("./llama_chat_finetundtest_bank_holiday.csv"),
        "Food": pd.read_csv("./llama_chat_finetundtest_bank_food.csv"),
        "Family": pd.read_csv("./llama_chat_finetundtest_bank_family.csv"),
        "Education": pd.read_csv("./llama_chat_finetundtest_bank_education.csv"),
    }
    cohere_datasets = {
        "Chinese": pd.read_csv("./hofstede_mistral_chinese.csv", encoding="utf-8"),
        "Western": pd.read_csv("./hofstede_mistral_western.csv", encoding="utf-8"),
        "Arab": pd.read_csv("./hofstede_mistral_arab.csv", encoding="utf-8"),
    }
    cohere_baseline_datasets = {
        "Arab": pd.read_csv("./test_bank_arabic_chat_mistral.csv", encoding="utf-8"),
        "Western": pd.read_csv("./test_bank_western_chat_mistral.csv", encoding="utf-8"),
        "Chinese": pd.read_csv("./test_bank_chines_chat_mistral.csv", encoding="utf-8"),
    }
    cohere_finetuned_datasets = {
        "All Topics": pd.read_csv("./results_topic_AllTopics.csv"),
        "Work life": pd.read_csv("./results_topic_Work_life.csv"),
        "Sport": pd.read_csv("./results_topic_Sport.csv"),
        "Holidays/Celebration/Leisure": pd.read_csv("./results_topic_Holidays_Celebration_Leisure.csv"),
        "Food": pd.read_csv("./results_topic_Food.csv"),
        "Family": pd.read_csv("./results_topic_Family.csv"),
        "Education": pd.read_csv("./results_topic_Education.csv"),
    }
    cohere_hofstede_finetuned_datasets = {
        "Arab": pd.read_csv("./Hofsted_arab_MistralF.csv", encoding="utf-8"),
        "Chinese": pd.read_csv("./Hofsted_chin_MistralF.csv", encoding="utf-8"),
        "Western": pd.read_csv("./Hofsted_west_MistralF.csv", encoding="utf-8"),
    }
    logger.info("All datasets loaded successfully")
except Exception as e:
    logger.error(f"Error loading datasets: {str(e)}")

# --- Chat Functions ---
def call_model_a(message_text):
    try:
        prompt = f"<s>[INST] {message_text} [/INST]"
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 200,
                "temperature": 0.3,
                "top_p": 0.9,
                "do_sample": True,
                "return_full_text": False
            }
        }
        headers = {"Authorization": f"Bearer {HF_TOKEN_BASELINE}"}
        logger.info(f"Calling baseline Mistral model: {MISTRAL_MODEL_ID}")
        response = requests.post(
            f"https://api-inference.huggingface.co/models/{MISTRAL_MODEL_ID}",
            headers=headers,
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        result = response.json()
        return result[0]["generated_text"].strip()

        
    except Exception as e:
        logger.error(f"Error in call_model_a: {e}")
        return f"Error from baseline Mistral: {str(e)}"

def call_model_b(message_text):
    try:
        
        system_message = "You are a helpful assistant. Respond directly to the user's message without adding tags or special formatting."
        formatted_prompt = f"[INST] <<SYS>>{system_message}<</SYS>> {message_text} [/INST]"

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

        headers = {
            "Authorization": f"Bearer {HF_TOKEN_LLAMA}",
            "Content-Type": "application/json"
        }

        api_url = "https://wi05j8oxq5tj8lm2.us-east-1.aws.endpoints.huggingface.cloud"

        logger.info(f"Calling LLaMA model bound to endpoint: {LLAMA_MODEL_ID}")
        response = requests.post(api_url, headers=headers, json=payload, timeout=60)
        logger.info(f"Response status: {response.status_code}")
        response.raise_for_status()

        result = response.json()

        if isinstance(result, list) and len(result) > 0 and "generated_text" in result[0]:
            return result[0]["generated_text"].strip()
        elif isinstance(result, dict) and "generated_text" in result:
            return result["generated_text"].strip()
        else:
            logger.error(f"Unexpected response structure: {result}")
            return "Error: Unexpected response format from LLaMA model API"

    except requests.exceptions.RequestException as e:
        error_msg = f"Request error: {str(e)}"
        if hasattr(e, 'response') and e.response is not None:
            error_msg += f" | Status: {e.response.status_code}"
            try:
                error_data = e.response.json()
                error_msg += f" | Error: {error_data}"
            except:
                error_msg += f" | Body: {e.response.text[:200]}"
        logger.error(error_msg)
        return f"Error connecting to LLaMA model API: {error_msg}"

    except Exception as e:
        logger.error(f"Unexpected error in call_model_b: {str(e)}")
        return f"Unexpected error: {str(e)}"

def call_fine_tuned_mistral(message_text):
    try:
        api_url = "https://uphvkd82jwgsup9d.us-east-1.aws.endpoints.huggingface.cloud"
        prompt = f"<s>[INST] {message_text} [/INST]"
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 400,
                "temperature": 0.3,
                "top_p": 0.9,
                "do_sample": True,
                "return_full_text": False
            }
        }
        headers = {
            "Authorization": f"Bearer {HF_TOKEN_FINETUNE}",
            "Content-Type": "application/json"
        }

        if not HF_TOKEN_FINETUNE:
            logger.error("HF_TOKEN_FINETUNE environment variable is not set or empty")
            return "Error: API token for fine-tuned Mistral model is missing"
        logger.info(f"Calling fine-tuned Mistral model at: {api_url} with request size: {len(str(payload))} bytes")
        response = requests.post(api_url, headers=headers, json=payload, timeout=160)
        
        response.raise_for_status()
        result = response.json()

        if isinstance(result, list) and len(result) > 0 and "generated_text" in result[0]:
            generated_text = result[0]["generated_text"]

            # Clean special tokens
            cleaned_text = generated_text.replace("<s>", "").replace("</s>", "").replace("[INST]", "").replace("[/INST]", "").strip()

            return cleaned_text

        else:
            logger.error(f"Unexpected response structure: {result}")
            return "Error: Unexpected response format from model API"

    except requests.exceptions.RequestException as e:
        error_msg = f"Request error: {str(e)}"
        if hasattr(e, 'response') and e.response is not None:
            error_msg += f" | Status: {e.response.status_code}"
            try:
                error_data = e.response.json()
                error_msg += f" | Error: {error_data}"
            except:
                error_msg += f" | Body: {e.response.text[:200]}"
        logger.error(error_msg)
        return f"Error connecting to model API: {error_msg}"

    except Exception as e:
        logger.error(f"Unexpected error in call_fine_tuned_mistral: {str(e)}")
        return f"Unexpected error: {str(e)}"

    
def call_fine_tuned_llama(message_text):
    try:
        # Use your custom endpoint URL from AWS
        api_url = "https://muc8o2qk8qhncicd.us-east-1.aws.endpoints.huggingface.cloud"
        
        prompt = f"<s>[INST] {message_text} [/INST]"
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 200,
                "temperature": 0.3,
                "top_p": 0.9,
                "do_sample": True,
                "return_full_text": False
            }
        }
        headers = {
            "Authorization": f"Bearer {HF_TOKEN_FINETUNE}",
            "Content-Type": "application/json"
        }
        
        if not HF_TOKEN_FINETUNE:
            logger.error("HF_TOKEN_FINETUNE environment variable is not set or empty")
            return "Error: API token for fine-tuned LLaMA model is missing"
            
        logger.info(f"Calling fine-tuned LLaMA model at: {api_url}")
        response = requests.post(api_url, headers=headers, json=payload, timeout=60)
        logger.info(f"Response status: {response.status_code}")
        response.raise_for_status()
        
        result = response.json()
        if isinstance(result, list) and len(result) > 0 and "generated_text" in result[0]:
            generated_text = result[0]["generated_text"]
            if "[/INST]" in generated_text:
                return generated_text.split("[/INST]")[-1].strip()
            return generated_text.strip()
        else:
            logger.error(f"Unexpected response structure: {result}")
            return "Error: Unexpected response format from model API"
            
    except requests.exceptions.RequestException as e:
        error_msg = f"Request error: {str(e)}"
        if hasattr(e, 'response') and e.response is not None:
            error_msg += f" | Status: {e.response.status_code}"
            try:
                error_data = e.response.json()
                error_msg += f" | Error: {error_data}"
            except:
                error_msg += f" | Body: {e.response.text[:200]}"
        logger.error(error_msg)
        return f"Error connecting to model API: {error_msg}"
        
    except Exception as e:
        logger.error(f"Unexpected error in call_fine_tuned_llama: {str(e)}")
        return f"Unexpected error: {str(e)}"

def suggest_questions():
    questions = [
        "What are the well-known breakfasts in Western culture?",
        "What are the main holidays in Western culture?",
        "What are the main holidays in Arab culture?",
        "Tell me about artificial intelligence.",
        "What are some interesting facts about space exploration?"
    ]
    return random.sample(questions, 3)

# --- Coverage Calculation Functions ---
def calculate_coverage(data, topic=None):
    if topic and topic not in ["All Topics", "LLAMA2 Baseline", "Hofstede Questions-LLAMA2 Model"]:
        data = data[data['topic'].str.lower() == topic.lower()].copy()
    data['is_correct'] = data['Predicted'] == data['correct']
    total_questions = len(data)
    correct_answers = len(data[data['is_correct'] == True])
    coverage_score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    return {
        "coverage_score": coverage_score,
        "total_questions": total_questions,
        "correct_answers": correct_answers,
    }

def calculate_for_all_regions_llama(topic=None):
    results = {}
    for region, data in llama_datasets.items():
        results[region] = calculate_coverage(data, topic)
    return results

def calculate_standard_deviation_llama(topic=None):
    results = {}
    for region, data in llama_hofstede_datasets.items():
        if 'Predicted' not in data.columns or not pd.api.types.is_numeric_dtype(data['Predicted']):
            results[region] = {
                "standard_deviation": 0.0,
                "total_questions": len(data),
                "responses": data.get('Predicted', []).tolist()
            }
        else:
            std_dev = np.std(data['Predicted'], ddof=1)
            results[region] = {
                "standard_deviation": std_dev,
                "total_questions": len(data),
                "responses": data['Predicted'].tolist()
            }
    return results

def calculate_for_all_regions_llama_finetuned(topic):
    results = {}
    topic_df = llama_finetuned_datasets.get(topic, pd.DataFrame())
    if topic_df.empty:
        return {r: {"coverage_score": 0, "total_questions": 0, "correct_answers": 0} for r in ["Arab", "Chinese", "Western"]}
    topic_df["region"] = topic_df["region"].replace({"China": "Chinese"})
    for region in ["Arab", "Chinese", "Western"]:
        region_df = topic_df[topic_df["region"] == region]
        if not region_df.empty:
            correct = (region_df["correct"] == region_df["Predicted"]).sum()
            total = len(region_df)
            score = (correct / total) * 100 if total > 0 else 0
        else:
            correct, total, score = 0, 0, 0
        results[region] = {
            "coverage_score": score,
            "total_questions": total,
            "correct_answers": correct,
        }
    return results

def calculate_standard_deviation_llama_finetuned():
    results = {}
    for region, data in llama_finetuned_hofstede_datasets.items():
        if 'Predicted' not in data.columns or not pd.api.types.is_numeric_dtype(data['Predicted']):
            results[region] = {
                "standard_deviation": 0.0,
                "total_questions": len(data),
                "responses": data.get('Predicted', []).tolist()
            }
        else:
            std_dev = np.std(data['Predicted'], ddof=1)
            results[region] = {
                "standard_deviation": std_dev,
                "total_questions": len(data),
                "responses": data['Predicted'].tolist()
            }
    return results

def calculate_standard_deviation_cohere():
    results = {}
    for region, data in cohere_datasets.items():
        std_dev = np.std(data['Predicted'], ddof=1)
        results[region] = {
            "standard_deviation": std_dev,
            "total_questions": len(data),
            "responses": data['Predicted'].tolist()
        }
    return results

def calculate_standard_deviation_cohere_finetuned():
    results = {}
    for region, data in cohere_hofstede_finetuned_datasets.items():
        if 'Predicted' not in data.columns or not pd.api.types.is_numeric_dtype(data['Predicted']):
            results[region] = {
                "standard_deviation": 0.0,
                "total_questions": len(data),
                "responses": data.get('Predicted', []).tolist()
            }
        else:
            std_dev = np.std(data['Predicted'], ddof=1)
            results[region] = {
                "standard_deviation": std_dev,
                "total_questions": len(data),
                "responses": data['Predicted'].tolist()
            }
    return results

def calculate_for_all_regions_cohere_baseline(topic=None):
    results = {}
    for region, data in cohere_baseline_datasets.items():
        results[region] = calculate_coverage(data, topic)
    return results

def calculate_for_all_regions_cohere_finetuned(topic):
    results = {}
    topic_df = cohere_finetuned_datasets.get(topic, pd.DataFrame())
    if topic_df.empty:
        return {r: {"coverage_score": 0, "total_questions": 0, "correct_answers": 0} for r in ["Arab", "Chinese", "Western"]}
    topic_df["region"] = topic_df["region"].replace({"China": "Chinese"})
    for region in ["Arab", "Chinese", "Western"]:
        region_df = topic_df[topic_df["region"] == region]
        if not region_df.empty:
            correct = (region_df["correct"] == region_df["Predicted"]).sum()
            total = len(region_df)
            score = (correct / total) * 100 if total > 0 else 0
        else:
            correct, total, score = 0, 0, 0
        results[region] = {
            "coverage_score": score,
            "total_questions": total,
            "correct_answers": correct,
        }
    return results

def to_serializable(val):
    if isinstance(val, (np.integer, np.floating)):
        return val.item()
    return val

# --- Flask Endpoints ---
@app.route('/evaluate', methods=['POST', 'OPTIONS'])
def evaluate():
    if request.method == 'OPTIONS':
        logger.info("Handling OPTIONS for /evaluate")
        return '', 200
    try:
        request_data = request.json
        topic = request_data.get("topic", "All Topics")
        model = request_data.get("model", "")
        eval_type = request_data.get("evalType", "")
        logger.info(f"Processing evaluate: topic={topic}, model={model}, evalType={eval_type}")
        if model == "Fine-Tuned":
            if eval_type == "Mistral Fine-tuned Model":
                results = calculate_for_all_regions_cohere_finetuned(topic)
            elif eval_type == "Hofstede Questions-Mistral Fine-tuned Model":
                results = calculate_standard_deviation_cohere_finetuned()
            elif eval_type == "Llama2 Fine-tuned Model":
                results = calculate_for_all_regions_llama_finetuned(topic)
            elif eval_type == "Hofstede Questions-Llama2 Fine-tuned Model":
                results = calculate_standard_deviation_llama_finetuned()
            else:
                return jsonify({"error": "Invalid evaluation type for Fine-Tuned"}), 400
        elif model == "Baseline":
            if eval_type == "Hofstede Questions-Mistral Model":
                results = calculate_standard_deviation_cohere()
            elif eval_type == "LLAMA2 Baseline":
                results = calculate_for_all_regions_llama(topic)
            elif eval_type == "Hofstede Questions-LLAMA2 Model":
                results = calculate_standard_deviation_llama(topic)
            elif eval_type == "Mistral Baseline":
                results = calculate_for_all_regions_cohere_baseline(topic)
            else:
                return jsonify({"error": "Invalid evaluation type for Baseline"}), 400
        else:
            return jsonify({"error": "Invalid model selection"}), 400
        serializable_results = {
            region: {k: to_serializable(v) for k, v in region_data.items()}
            for region, region_data in results.items()
        }
        return jsonify(serializable_results)
    except Exception as e:
        logger.error(f"Error during evaluation: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/compare', methods=['POST', 'OPTIONS'])
def compare():
    """
    Endpoint to calculate similarity scores between regions for selected topics.
    Uses Firebase data.
    """
    if request.method == 'OPTIONS':
        print("Handling OPTIONS for /api/compare")
        return '', 200

    try:
        print(f"Received request for /api/compare: {request.json}")
        data = request.get_json()
        regions = request.json.get("regions", [])
        topics = request.json.get("topics", [])
        print(f"Processing compare: regions={regions}, topics={topics}")
        
        if not regions or not topics:
            return jsonify({"error": "Regions and topics are required"}), 400

        results = {}
        for topic in topics:
            values = {}
            for region in regions:
                print(f"Fetching Firebase data for region: {region}")
                region_data = db.reference(f'/{region}C/Details').get()
                print(f"Region data for {region}: {region_data}")

                region_values = set()
                if region_data:
                    for item in region_data:
                        if item.get("topic") == topic:
                            for annot in item.get("annotations", []):
                                region_values.update(annot.get("en_values", []))
                values[region] = region_values

            similarities = []
            for i, region1 in enumerate(regions):
                for region2 in regions[i+1:]:
                    intersection = len(values[region1] & values[region2])
                    union = len(values[region1] | values[region2])
                    similarity = (intersection / union) if union > 0 else 0
                    similarities.append(similarity)

            results[topic] = (sum(similarities) / len(similarities) * 100) if similarities else 0

        return jsonify({"similarity_scores": results})

    except Exception as e:
        print(f"Error during comparison: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        logger.info("Handling OPTIONS for /api/chat")
        return '', 200
    try:
        data = request.json
        message = data.get("message", "").strip()
        model_type = data.get("model_type")
        logger.info(f"Processing chat: message={message}, model_type={model_type}")
        if not message:
            return jsonify({"status": "error", "message": "No message provided"}), 400
        if model_type == "A":
            result = call_model_a(message)
        elif model_type == "B":
            result = call_model_b(message)
        elif model_type == "FA":
            result = call_fine_tuned_mistral(message)
        elif model_type == "FB":
            result = call_fine_tuned_llama(message)
        else:
            return jsonify({"status": "error", "message": "Invalid model type"}), 400
        return jsonify({"status": "success", "response": result})
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/suggestions', methods=['GET', 'OPTIONS'])
def get_suggestions():
    if request.method == 'OPTIONS':
        logger.info("Handling OPTIONS for /api/suggestions")
        return '', 200
    try:
        logger.info("Processing suggestions request")
        return jsonify({'status': 'success', 'suggestions': suggest_questions()})
    except Exception as e:
        logger.error(f"Error in suggestions endpoint: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/healthcheck', methods=['GET'])
def healthcheck():
    return jsonify({"status": "ok", "message": "Server is running"}), 200

@app.route('/test', methods=['GET'])
def test():
    logger.info("Processing test request")
    return jsonify({"message": "Server is running"})

@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"Global error: {str(error)}")
    response = jsonify({"error": "Internal server error"})
    response.status_code = 500
    return response

# --- Main Application Entry ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)