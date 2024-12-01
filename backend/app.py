# --- Imports ---
from flask import Flask, jsonify, request
from flask_cors import CORS
from firebase_admin import credentials, db, initialize_app
import logging

# --- App Configuration ---
app = Flask(__name__)
CORS(app)

# Simple logging setup
logging.basicConfig(level=logging.INFO)

# --- Firebase Initialization ---
initialize_app(credentials.Certificate("serviceAccountKey.json"), {
    'databaseURL': 'https://culturelens-4872c-default-rtdb.firebaseio.com/'
})

# --- API Endpoints ---
@app.route('/api/compare', methods=['POST'])
def compare():
    try:
        # Get regions and topics from request
        regions = request.json.get("regions", [])
        topics = request.json.get("topics", [])
        
        if not regions or not topics:
            return jsonify({"error": "Missing regions or topics"}), 400

        results = {}
        for topic in topics:
            # Get values for each region
            values = {}
            for region in regions:
                # Get values from Firebase with error checking
                region_ref = db.reference(f'/{region}C/Details')
                region_data = region_ref.get()
                region_values = set()
                
                if region_data:
                    for item in region_data:
                        if isinstance(item, dict) and item.get("topic") == topic:
                            annotations = item.get("annotations", [])
                            for annot in annotations:
                                if isinstance(annot, dict):
                                    en_values = annot.get("en_values", [])
                                    if isinstance(en_values, list):
                                        region_values.update(en_values)
                
                values[region] = region_values

            # Calculate similarity between regions using Jaccard similarity
            similarities = []
            for i, region1 in enumerate(regions):
                for region2 in regions[i+1:]:
                    set1 = values[region1]
                    set2 = values[region2]
                    union = len(set1 | set2)
                    
                    if union > 0:
                        intersection = len(set1 & set2)
                        similarity = (intersection / union) * 100
                        similarities.append(similarity)
                    else:
                        similarities.append(0)

            # Calculate average similarity score for the topic
            results[topic] = (sum(similarities) / len(similarities)) if similarities else 0

        return jsonify({
            "similarity_scores": results
        })

    except Exception as e:
        logging.error(f"Error in compare endpoint: {str(e)}")
        return jsonify({"error": "An error occurred processing your request"}), 500

# --- Main Entry Point ---
if name == "main":
    app.run(debug=True, port=5000)