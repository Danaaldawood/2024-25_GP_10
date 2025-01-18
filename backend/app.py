from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from firebase_admin import credentials, db, initialize_app

# --- Flask Setup ---
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# --- Load Regional Datasets ---
datasets = {
    "Arab": pd.read_csv("./test_bank_arabic_chat_llama2.csv", encoding="utf-8"),
    "Western": pd.read_csv("./test_bank_western_chat_llama2.csv", encoding="utf-8"),
    "Chinese": pd.read_csv("./test_bank_chinese_chat_llama2.csv", encoding="utf-8"),
}

# --- Initialize Firebase ---
initialize_app(credentials.Certificate("serviceAccountKey.json"), {
    'databaseURL': 'https://culturelens-4872c-default-rtdb.firebaseio.com/'
})

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
