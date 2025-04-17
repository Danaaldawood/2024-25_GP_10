from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from firebase_admin import credentials, db, initialize_app
import json
import os

# --- Flask Setup ---
app = Flask(__name__)
# Replace the simple CORS configuration with a more detailed one
# CORS(app)  # Enable Cross-Origin Resource Sharing

# Configure CORS with explicit settings
CORS(app, 
     resources={r"/*": {"origins": "*"}},  # Allow all origins
     supports_credentials=True,
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"])

# Make sure CORS headers are applied to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# --- Load Regional Datasets ---
# Datasets for LLAMA2 Baseline (Coverage Scores)
llama_datasets = {
    "Arab": pd.read_csv("./test_bank_arabic_chat_llama2.csv", encoding="utf-8"),
    "Western": pd.read_csv("./test_bank_western_chat_llama2.csv", encoding="utf-8"),
    "Chinese": pd.read_csv("./test_bank_chinese_chat_llama2.csv", encoding="utf-8"),
}

# Datasets for Hofstede Questions-LLAMA2 Model (Standard Deviation)
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
# Datasets for Hofstede Questions-Cohere Model (Standard Deviation)
cohere_datasets = {
    "Chinese": pd.read_csv("./hofstede_mistral_chinese.csv", encoding="utf-8"),
    "Western": pd.read_csv("./hofstede_mistral_western.csv", encoding="utf-8"),
    "Arab": pd.read_csv("./hofstede_mistral_arab.csv", encoding="utf-8"),
}

# Datasets for Cohere Baseline (Coverage Scores)
cohere_baseline_datasets = {
    "Arab": pd.read_csv("./test_bank_arabic_chat_mistral.csv", encoding="utf-8"),
    "Western": pd.read_csv("./test_bank_western_chat_mistral.csv", encoding="utf-8"), 
    "Chinese": pd.read_csv("./test_bank_chines_chat_mistral.csv", encoding="utf-8"),
}

# Datasets for Cohere Fine-Tuned (Coverage Scores)
cohere_finetuned_datasets = {
    "All Topics": pd.read_csv("./results_topic_AllTopics.csv"),
    "Work life": pd.read_csv("./results_topic_Work_life.csv"),
    "Sport": pd.read_csv("./results_topic_Sport.csv"),
    "Holidays/Celebration/Leisure": pd.read_csv("./results_topic_Holidays_Celebration_Leisure.csv"),
    "Food": pd.read_csv("./results_topic_Food.csv"),
    "Family": pd.read_csv("./results_topic_Family.csv"),
    "Education": pd.read_csv("./results_topic_Education.csv"),
}

# Datasets for Hofstede Questions-Cohere Fine-tuned Model (Standard Deviation)
cohere_hofstede_finetuned_datasets = {
    "Arab": pd.read_csv("./Hofsted_arab_MistralF.csv", encoding="utf-8"),
    "Chinese": pd.read_csv("./Hofsted_chin_MistralF.csv", encoding="utf-8"),
    "Western": pd.read_csv("./Hofsted_west_MistralF.csv", encoding="utf-8"),
}

# # --- Initialize Firebase ---
# initialize_app(credentials.Certificate("serviceAccountKey.json"), {
#     'databaseURL': 'https://culturelens-4872c-default-rtdb.firebaseio.com/'
# })



# --- Initialize Firebase ---
# Replace the existing initialization code


# Check if running on Render or locally
if os.environ.get('FIREBASE_CREDENTIALS'):
    # On Render: Use environment variable
    firebase_credentials = json.loads(os.environ.get('FIREBASE_CREDENTIALS'))
    cred = credentials.Certificate(firebase_credentials)
else:
    # Locally: Use file
    cred = credentials.Certificate("serviceAccountKey.json")

initialize_app(cred, {
    'databaseURL': 'https://culturelens-4872c-default-rtdb.firebaseio.com/'
})
# --- Coverage Calculation Functions (For LLAMA2 Baseline) ---
def calculate_coverage(data, topic=None):
    """
    Calculate the coverage score for a specific topic or all topics for LLAMA2 Baseline.
    Expects columns: 'topic', 'Predicted', 'correct'.
    """
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
    """
    Calculate coverage scores for all regions for LLAMA2 Baseline.
    """
    results = {}
    for region, data in llama_datasets.items():
        results[region] = calculate_coverage(data, topic)
    return results

# --- Standard Deviation Calculation (For Hofstede Questions-LLAMA2 Model) ---
def calculate_standard_deviation_llama(topic=None):
    """
    Calculate standard deviation within each region across all Hofstede questions for LLAMA2 Model.
    Expects column: 'Predicted'.
    """
    results = {}
    for region, data in llama_hofstede_datasets.items():
        # Ensure 'Predicted' column exists and contains numeric data
        if 'Predicted' not in data.columns or not pd.api.types.is_numeric_dtype(data['Predicted']):
            results[region] = {
                "standard_deviation": 0.0,
                "total_questions": len(data),
                "responses": data.get('Predicted', []).tolist()  # Fallback to empty list if no 'Predicted'
            }
        else:
            std_dev = np.std(data['Predicted'], ddof=1)  # Sample standard deviation
            results[region] = {
                "standard_deviation": std_dev,
                "total_questions": len(data),
                "responses": data['Predicted'].tolist()
            }
    return results
#-----Calculate Coverge score for (Llama2 finetuned)-----
def calculate_for_all_regions_llama_finetuned(topic):
    """
    Calculate coverage scores for all regions for the Llam2 Fine-tuned model.
    """
    results = {}
    topic_df = llama_finetuned_datasets.get(topic, pd.DataFrame())

    if topic_df.empty:
        return {r: {"coverage_score": 0, "total_questions": 0, "correct_answers": 0} for r in ["Arab", "Chinese", "Western"]}

    # Normalize region names (e.g., 'China' -> 'Chinese')
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



#-- standred divation  for llama2 finteuned on Hofstede Questions
def calculate_standard_deviation_llama_finetuned():
    """
    Calculate standard deviation within each region across all Hofstede questions for Llama2 Fine-tuned Model.
    Expects column: 'Predicted'.
    """
    results = {}
    for region, data in llama_finetuned_hofstede_datasets.items():
        if 'Predicted' not in data.columns or not pd.api.types.is_numeric_dtype(data['Predicted']):
            results[region] = {
                "standard_deviation": 0.0,
                "total_questions": len(data),
                "responses": data.get('Predicted', []).tolist()
            }
        else:
            std_dev = np.std(data['Predicted'], ddof=1)  # Sample standard deviation
            results[region] = {
                "standard_deviation": std_dev,
                "total_questions": len(data),
                "responses": data['Predicted'].tolist()
            }
    return results




# --- Standard Deviation Calculation (For Hofstede Questions-Cohere Model) ---
def calculate_standard_deviation_cohere():
    """
    Calculate standard deviation within each region across all Hofstede questions for Cohere Model.
    Expects column: 'Predicted'.
    """
    results = {}
    for region, data in cohere_datasets.items():
        std_dev = np.std(data['Predicted'], ddof=1)  # Sample standard deviation
        results[region] = {
            "standard_deviation": std_dev,
            "total_questions": len(data),
            "responses": data['Predicted'].tolist()
        }
    return results



# --- Standard Deviation Calculation (For Hofstede Questions-Cohere Fine-tuned Model) ---
def calculate_standard_deviation_cohere_finetuned():
    """
    Calculate standard deviation within each region across all Hofstede questions for Cohere Fine-tuned Model.
    Expects column: 'Predicted'.
    """
    results = {}
    for region, data in cohere_hofstede_finetuned_datasets.items():
        if 'Predicted' not in data.columns or not pd.api.types.is_numeric_dtype(data['Predicted']):
            results[region] = {
                "standard_deviation": 0.0,
                "total_questions": len(data),
                "responses": data.get('Predicted', []).tolist()
            }
        else:
            std_dev = np.std(data['Predicted'], ddof=1)  # Sample standard deviation
            results[region] = {
                "standard_deviation": std_dev,
                "total_questions": len(data),
                "responses": data['Predicted'].tolist()
            }
    return results

def calculate_for_all_regions_cohere_baseline(topic=None):
    """
    Calculate coverage scores for all regions for Cohere Baseline.
    """
    results = {}
    for region, data in cohere_baseline_datasets.items():
        results[region] = calculate_coverage(data, topic)
    return results

def calculate_for_all_regions_cohere_finetuned(topic):
    """
    Calculate coverage scores for all regions for the Cohere Fine-tuned model.
    """
    results = {}
    topic_df = cohere_finetuned_datasets.get(topic, pd.DataFrame())

    if topic_df.empty:
        return {r: {"coverage_score": 0, "total_questions": 0, "correct_answers": 0} for r in ["Arab", "Chinese", "Western"]}

    # Normalize region names (e.g., 'China' -> 'Chinese')
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
@app.route('/evaluate', methods=['POST'])
def evaluate():
    """
    Endpoint to calculate evaluation metrics based on model and evaluation type.
    Expects JSON payload with 'topic', 'model', and 'evalType' keys.
    """
    try:
        request_data = request.json
        topic = request_data.get("topic", "All Topics")
        model = request_data.get("model", "")
        eval_type = request_data.get("evalType", "")

        print(f"Received topic: {topic}, model: {model}, evalType: {eval_type}")

        # Fine-Tuned Model Handling
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
            serializable_results = {
                region: {k: to_serializable(v) for k, v in region_data.items()}
                for region, region_data in results.items()
            }
            return jsonify(serializable_results)

        # Baseline Model Handling
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

            serializable_results = {
                region: {k: to_serializable(v) for k, v in region_data.items()}
                for region, region_data in results.items()
            }
            return jsonify(serializable_results)

        else:
            return jsonify({"error": "Invalid model selection"}), 400

    except Exception as e:
        print(f"Error during evaluation: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/compare', methods=['POST', 'OPTIONS'])
def compare():
    """
    Endpoint to calculate similarity scores between regions for selected topics.
    Uses Firebase data.
    """
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
        
    try:
        regions = request.json.get("regions", [])
        topics = request.json.get("topics", [])
        
        if not regions or not topics:
            return jsonify({"error": "Regions and topics are required"}), 400

        results = {}
        for topic in topics:
            values = {}
            for region in regions:
                region_data = db.reference(f'/{region}C/Details').get()
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

@app.route('/test', methods=['GET'])
def test():
    """
    Simple test endpoint to ensure the server is running.
    """
    return jsonify({"message": "Server is running"})

# --- Main Application Entry ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000)) 
    app.run(host='0.0.0.0', port=port, debug=True)