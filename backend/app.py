from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from firebase_admin import credentials, db, initialize_app

# --- Flask Setup ---
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# --- Load Regional Datasets ---
# Datasets for LLAMA2 Baseline (Coverage Scores)
llama_datasets = {
    "Arab": pd.read_csv("./test_bank_arabic_chat_llama2.csv", encoding="utf-8"),
    "Western": pd.read_csv("./test_bank_western_chat_llama2.csv", encoding="utf-8"),
    "Chinese": pd.read_csv("./test_bank_chinese_chat_llama2.csv", encoding="utf-8"),
}

# Datasets for Hofstede Questions-LLAMA2 Model (Coverage Scores, set to 0)
llama_hofstede_datasets = {
    "Arab": pd.read_csv("./test_bank_arabic_chat_llama2.csv", encoding="utf-8"),
    "Western": pd.read_csv("./test_bank_western_chat_llama2.csv", encoding="utf-8"),
    "Chinese": pd.read_csv("./test_bank_chinese_chat_llama2.csv", encoding="utf-8"),
}

# Datasets for Hofstede Questions-Cohere Model (Standard Deviation)
cohere_datasets = {
    "Chinese": pd.read_csv("./hofstede_cohere_chinese.csv", encoding="utf-8"),
    "Western": pd.read_csv("./hofstede_cohere_western.csv", encoding="utf-8"),
    "Arab": pd.read_csv("./hofstede_cohere_arab.csv", encoding="utf-8"),
}

# --- Initialize Firebase ---
initialize_app(credentials.Certificate("serviceAccountKey.json"), {
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

# --- Coverage Calculation for Hofstede Questions-LLAMA2 Model (Return 0) ---
def calculate_for_all_regions_hofstede(topic=None):
    """
    Calculate 0 coverage scores for all regions for Hofstede Questions-LLAMA2 Model.
    """
    results = {}
    for region, data in llama_hofstede_datasets.items():
        results[region] = {
            "coverage_score": 0.00,
            "total_questions": len(data),
            "correct_answers": 0,
        }
    return results

# --- Standard Deviation Calculation (For Hofstede Questions-Cohere Model) ---
def calculate_standard_deviation():
    """
    Calculate standard deviation within each region across all Hofstede questions.
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

# --- Flask Endpoints ---

@app.route('/evaluate', methods=['POST'])
def evaluate():
    """
    Endpoint to calculate evaluation metrics based on model and evaluation type.
    Expects JSON payload with 'topic', 'model', and 'evalType' keys.
    """
    try:
        request_data = request.json
        topic = request_data.get("topic", "All Topics")  # Default to All Topics for LLAMA2 Baseline
        model = request_data.get("model", "")
        eval_type = request_data.get("evalType", "")

        print(f"Received topic: {topic}, model: {model}, evalType: {eval_type}")

        if model == "Fine-Tuned":
            return jsonify({"message": "Fine-Tuned model not implemented yet"}), 200

        elif model == "Baseline":
            if eval_type == "Hofstede Questions-Cohere Model":
                # Calculate standard deviation for Hofstede Questions-Cohere Model
                results = calculate_standard_deviation()
            elif eval_type == "LLAMA2 Baseline":
                # Calculate coverage scores for LLAMA2 Baseline
                results = calculate_for_all_regions_llama(topic)
            elif eval_type == "Hofstede Questions-LLAMA2 Model":
                # Return 0 coverage scores for Hofstede Questions-LLAMA2 Model
                results = calculate_for_all_regions_hofstede(topic)
            else:
                return jsonify({"error": "Invalid evaluation type for Baseline"}), 400

            return jsonify(results)
        
        else:
            return jsonify({"error": "Invalid model selection"}), 400

    except Exception as e:
        print(f"Error during evaluation: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/compare', methods=['POST'])
def compare():
    """
    Endpoint to calculate similarity scores between regions for selected topics.
    Uses Firebase data.
    """
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
    app.run(host='0.0.0.0', port=5000, debug=True)