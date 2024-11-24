import firebase_admin
from firebase_admin import credentials, db
from flask import Flask, jsonify, request
from flask_cors import CORS
import os

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["POST", "OPTIONS", "GET"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize Firebase Admin
# Make sure to place your serviceAccountKey.json in the same directory
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://culturelens-4872c-default-rtdb.firebaseio.com/'
    })

def jaccard_similarity(list1, list2):
    """Calculate Jaccard similarity between two lists"""
    s1 = set(list1)
    s2 = set(list2)
    if not s1 and not s2:
        return 0.0
    return float(len(s1.intersection(s2)) / len(s1.union(s2)))

@app.route('/api/compare', methods=['GET', 'POST'])
def compare():
    if request.method == 'GET':
        return jsonify({
            "message": "Cultural Lens API is running",
            "usage": {
                "method": "POST",
                "endpoint": "/api/compare",
                "body": {
                    "regions": ["Arab", "Western", "Chinese"],
                    "topics": ["your_topic_here"]
                }
            }
        })

    try:
        # Parse request data
        data = request.json
        if not data:
            return jsonify({"error": "Invalid request payload"}), 400

        selected_regions = data.get("regions", [])
        selected_topics = data.get("topics", [])
        
        if not selected_regions or not selected_topics:
            return jsonify({"error": "Regions and topics are required"}), 400

        # Map frontend region names to database keys
        region_map = {
            "Arab": "ArabC",
            "Western": "WesternC",
            "Chinese": "ChineseC"
        }

        # Country mappings for each region
        region_countries = {
            "Arab": ["Algeria", "Egypt", "Saudi Arabia", "Morocco", "Jordan", "Iraq", "Syria", "Tunisia", "Libya", "Sudan"],
            "Western": ["United States", "France", "Germany", "Canada", "United Kingdom", "Italy", "Spain", "Australia"],
            "Chinese": ["China", "Hong Kong", "Taiwan", "Singapore", "Mongolia"]
        }

        # Validate and map regions
        mapped_regions = []
        for region in selected_regions:
            if region in region_map:
                mapped_regions.append(region_map[region])
            else:
                return jsonify({"error": f"Invalid region: {region}"}), 400

        similarity_scores = {}
        overall_scores = []
        debug_data = {}

        # Calculate similarities for each topic
        for topic in selected_topics:
            topic_scores = []
            region_data = {}
            
            # Fetch data for each region
            for region_key in mapped_regions:
                try:
                    ref = db.reference(f'/{region_key}/Details')
                    details = ref.get()
                    if details:
                        values = []
                        for detail in details:
                            if detail.get("topic") == topic:
                                for annotation in detail.get("annotations", []):
                                    values.extend(annotation.get("en_values", []))
                        region_data[region_key] = values
                        debug_data[f"{region_key}_{topic}"] = values
                    else:
                        region_data[region_key] = []
                except Exception as e:
                    return jsonify({"error": f"Database error for {region_key}: {str(e)}"}), 500

            # Calculate pairwise similarities
            region_keys = list(region_data.keys())
            for i in range(len(region_keys)):
                for j in range(i + 1, len(region_keys)):
                    region1 = region_keys[i]
                    region2 = region_keys[j]
                    similarity = jaccard_similarity(region_data[region1], region_data[region2])
                    topic_scores.append(similarity)

            # Calculate average similarity for the topic
            avg_score = sum(topic_scores) / len(topic_scores) if topic_scores else 0
            similarity_scores[topic] = round(avg_score * 100)
            overall_scores.append(avg_score)

        # Calculate overall consensus
        overall_consensus = round((sum(overall_scores) / len(overall_scores) if overall_scores else 0) * 100)

        return jsonify({
            "similarity_scores": similarity_scores,
            "overall_score": overall_consensus,
            "region_countries": region_countries,
            "debug_data": debug_data
        })

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({
        "error": "Method not allowed",
        "message": "This endpoint only supports GET and POST requests",
        "allowed_methods": ["GET", "POST"]
    }), 405

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port)