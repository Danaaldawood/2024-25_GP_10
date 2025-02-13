from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from firebase_admin import credentials, db, initialize_app
import numpy as np
import os
from pathlib import Path


# --- Flask Setup ---
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing






# --- Load Regional Datasets ---
datasets = {
    "Arab": pd.read_csv("./test_bank_arabic_chat_llama2.csv", encoding="utf-8"),
    "Western": pd.read_csv("./test_bank_western_chat_llama2.csv", encoding="utf-8"),
    "Chinese": pd.read_csv("./test_bank_chinese_chat_llama2.csv", encoding="utf-8"),
}

file_paths = {
     "chinese": "./test_bank_hofsted_chinese_chat_llama2.csv",
     "english": "./test_bank_hofsted_western_chat_llama2.csv"
 }




# --- Initialize Firebase ---
initialize_app(credentials.Certificate("serviceAccountKey.json"), {
    'databaseURL': 'https://culturelens-4872c-default-rtdb.firebaseio.com/'
})


pythonCopychinese_data = pd.read_csv("./test_bank_hofsted_chinese_chat_llama2.csv", encoding="utf-8-sig")
english_data = pd.read_csv("./test_bank_hofsted_western_chat_llama2.csv", encoding="utf-8-sig")
# Option mapping for responses
# option_mapping = {'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5}

# def calculate_variability(df: pd.DataFrame, region: str, answer_column: str) -> pd.DataFrame:
#     """Calculates the variability (mean and SD) for a given region."""
#     # Replace categorical answers with numerical values
#     df[answer_column] = df[answer_column].map(option_mapping)
#     df = df.dropna(subset=[answer_column])  # Drop rows with missing values
    
#     # Group by Q_ID and calculate mean and SD
#     grouped = df.groupby('Q_ID')[answer_column].agg([np.mean, np.std]).reset_index()
#     grouped.columns = ['Q_ID', 'Mean', 'Std']
#     grouped['Region'] = region
    
#     return grouped

# def calculate_for_topic(topic: str) -> pd.DataFrame:
#     """Calculates variability for a given topic (e.g., 'Work Life')."""
#     # Load the relevant dataset based on topic
#     if topic.lower() == "work life":
#         # Example: Adjust paths and topics accordingly
        
#         chinese_data = pd.read_csv("./test_bank_hofsted_chinese_chat_llama2.csv", encoding="utf-8-sig")
#         english_data = pd.read_csv("./test_bank_hofsted_western_chat_llama2.csv", encoding="utf-8-sig")
   
#         # Clean the column names
#         chinese_data.columns = chinese_data.columns.str.replace('ï»¿', '', regex=True).str.strip()
#         english_data.columns = english_data.columns.str.strip()

#         # Calculate variability for the specific topic (Work Life)
#         chinese_variability = calculate_variability(chinese_data, "Chinese", "Predicted")
#         english_variability = calculate_variability(english_data, "English", "Predicted")
        
#         # Combine results
#         variability_df = pd.concat([chinese_variability, english_variability], ignore_index=True)
        
#         return variability_df
#     else:
#         return pd.DataFrame()  # Return an empty DataFrame if topic is not "Work Life"
#############################


try:
    initialize_app(credentials.Certificate("serviceAccountKey.json"), {
        'databaseURL': 'https://culturelens-4872c-default-rtdb.firebaseio.com/'
    })
except Exception as e:
    print(f"Firebase initialization error: {e}")

# Option mapping for responses
option_mapping = {'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5}

def load_csv_data(filepath: str) -> pd.DataFrame:
    """Safely load and clean CSV data."""
    try:
        df = pd.read_csv(filepath, encoding="utf-8-sig")
        df.columns = df.columns.str.replace('ï»¿', '', regex=True).str.strip()
        return df
    except Exception as e:
        print(f"Error loading CSV {filepath}: {e}")
        return pd.DataFrame()

def calculate_variability(df: pd.DataFrame, region: str, answer_column: str) -> pd.DataFrame:
    """Calculates the variability (mean and SD) for a given region."""
    if df.empty:
        return pd.DataFrame()
        
    try:
        # Replace categorical answers with numerical values
        df[answer_column] = df[answer_column].map(option_mapping)
        df = df.dropna(subset=[answer_column])
        
        # Group by Q_ID and calculate mean and SD
        grouped = df.groupby('Q_ID')[answer_column].agg([np.mean, np.std]).reset_index()
        grouped.columns = ['Q_ID', 'Mean', 'Std']
        grouped['Region'] = region
        
        return grouped
    except Exception as e:
        print(f"Error calculating variability: {e}")
        return pd.DataFrame()

def calculate_for_topic(topic: str) -> pd.DataFrame:
    """Calculates variability for a given topic."""
    if topic.lower() != "work life":
        return pd.DataFrame()
        
    try:
        data_dir = Path(".")
        chinese_data = load_csv_data(data_dir / "test_bank_hofsted_chinese_chat_llama2.csv")
        english_data = load_csv_data(data_dir / "test_bank_hofsted_western_chat_llama2.csv")
        arab_data = load_csv_data(data_dir / "hofsted_test_bank_arab_chat_llama2.csv")
        if chinese_data.empty or english_data.empty:
            raise ValueError("Failed to load required data files")
            
        chinese_variability = calculate_variability(chinese_data, "Chinese", "Predicted")
        english_variability = calculate_variability(english_data, "English", "Predicted")
        arab_variability = calculate_variability(arab_data, "Arabic", "Predicted")
        
        return pd.concat([chinese_variability, english_variability,arab_variability], ignore_index=True)
    except Exception as e:
        print(f"Error in calculate_for_topic: {e}")
        return pd.DataFrame()
# Route to get variability data based on model and topic selection
@app.route('/get_variability', methods=['POST'])
def get_variability():
    try:
        request_data = request.json
        if not request_data:
            return jsonify({"error": "No request data provided"}), 400
            
        model = request_data.get("model", "")
        topic = request_data.get("topic", "")
        
        if not all([model, topic]):
            return jsonify({"error": "Missing required parameters"}), 400
        
        if model == "Hofstede - Zero Shot" and topic.lower() == "work life":
            variability_df = calculate_for_topic(topic)
            
            if variability_df.empty:
                return jsonify({"error": "No data available"}), 404
            variability_df = variability_df.fillna(0)
                
            return jsonify(variability_df.to_dict(orient='records'))
        else:
            return jsonify({"error": "Invalid model or topic selection"}), 400
            
    except Exception as e:
        print(f"Error in get_variability endpoint: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == 'main':
    app.run(debug=True)






# --- Coverage Calculation Functions ---
def calculate_coverage(data, topic=None):
    """
    Calculate the coverage score for a specific topic or all topics.
    """
    if topic and topic != "All Topics":
        data = data[data['topic'].str.lower() == topic.lower()].copy()  # Filter by topic

    data['is_correct'] = data['Predicted'] == data['correct']  # Compare values
    total_questions = len(data)
    correct_answers = len(data[data['is_correct'] == True])

    coverage_score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

    return {
        "coverage_score": coverage_score,
        "total_questions": total_questions,
        "correct_answers": correct_answers,
    }

def calculate_for_all_regions(topic=None):
    """
    Calculate coverage scores for all regions for a specific topic or all topics.
    """
    results = {}
    for region, data in datasets.items():
        results[region] = calculate_coverage(data, topic)

    # Combine data for all regions
    combined_data = pd.concat([data for data in datasets.values()], ignore_index=True)
    results["All Regions"] = calculate_coverage(combined_data, topic)

    return results

# --- Flask Endpoints ---
@app.route('/evaluate', methods=['POST'])
def evaluate():
    """
    Endpoint to calculate coverage scores for topics.
    Expects a JSON payload with 'topic' and 'model' keys.
    """
    try:
        request_data = request.json
        topic = request_data.get("topic", "All Topics")

        # Debug log
        print(f"Received topic: {topic}")

        # Calculate coverage scores
        results = calculate_for_all_regions(topic)

        return jsonify(results)
    except Exception as e:
        print(f"Error during evaluation: {e}")
        return jsonify({"error": str(e)}), 500





# --- Compare Endpoint ---
@app.route('/api/compare', methods=['POST'])
def compare():
    """
    Endpoint to calculate similarity scores between regions for selected topics.
    """
    try:
        # Get regions and topics from the request
        regions = request.json.get("regions", [])
        topics = request.json.get("topics", [])
        
        if not regions or not topics:
            return jsonify({"error": "Regions and topics are required"}), 400

        results = {}
        for topic in topics:
            # Get values for each region
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

            # Calculate similarity
            similarities = []
            for i, region1 in enumerate(regions):
                for region2 in regions[i+1:]:
                    # Jaccard similarity
                    intersection = len(values[region1] & values[region2])
                    union = len(values[region1] | values[region2])
                    similarity = (intersection / union) if union > 0 else 0
                    similarities.append(similarity)

            # Average similarity for this topic
            results[topic] = (sum(similarities) / len(similarities) * 100) if similarities else 0

        return jsonify({"similarity_scores": results})

    except Exception as e:
        print(f"Error during comparison: {e}")
        return jsonify({"error": str(e)}), 500

# --- Test Endpoint ---
@app.route('/test', methods=['GET'])
def test():
    """
    Simple test endpoint to ensure the server is running.
    """
    return jsonify({"message": "Server is running"})

# --- Main Application Entry ---
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
