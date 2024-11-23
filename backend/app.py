import firebase_admin
from firebase_admin import credentials, db
from flask import Flask, jsonify, request
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing (CORS)

# Initialize Firebase Admin with Realtime Database URL
cred = credentials.Certificate("serviceAccountKey.json")  # Replace with your Firebase Admin key path
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://culturelens-4872c-default-rtdb.firebaseio.com/'  # Your Realtime Database URL
})

# Function to calculate Jaccard Similarity
def jaccard_similarity(list1, list2):
    s1 = set(list1)
    s2 = set(list2)
    if not s1 and not s2:  # Handle empty sets
        return 0.0
    return float(len(s1.intersection(s2)) / len(s1.union(s2)))

# Main route to calculate similarity
@app.route('/api/compare', methods=['POST'])
def compare():
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
                return jsonify({"error": f"Region {region} not found"}), 404

        similarity_scores = {}
        overall_scores = []
        debug_data = {}

        for topic in selected_topics:
            topic_scores = []
            region_data = {}
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
                        debug_data[region_key] = values
                    else:
                        region_data[region_key] = []
                except Exception as e:
                    return jsonify({"error": f"Failed to retrieve data for region {region_key}: {e}"}), 500

            region_keys = list(region_data.keys())
            for i in range(len(region_keys)):
                for j in range(i + 1, len(region_keys)):
                    region1 = region_keys[i]
                    region2 = region_keys[j]
                    similarity = jaccard_similarity(region_data[region1], region_data[region2])
                    topic_scores.append(similarity)

            avg_score = sum(topic_scores) / len(topic_scores) if topic_scores else 0
            similarity_scores[topic] = round(avg_score * 100)  # Convert to percentage and round
            overall_scores.append(avg_score)


        overall_consensus = sum(overall_scores) / len(overall_scores) if overall_scores else 0

        return jsonify({
            "similarity_scores": similarity_scores,
            "overall_score": overall_consensus,
            "region_countries": region_countries,
            "debug_data": debug_data
        })
    except Exception as e:
        return jsonify({"error": f"Unexpected error occurred: {e}"}), 500

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True, port=5000)