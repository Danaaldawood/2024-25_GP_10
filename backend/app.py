from flask import Flask, jsonify, request
from flask_cors import CORS
from firebase_admin import credentials, db, initialize_app

app = Flask(__name__)
CORS(app)

# Initialize Firebase
initialize_app(credentials.Certificate("serviceAccountKey.json"), {
    'databaseURL': 'https://culturelens-4872c-default-rtdb.firebaseio.com/'
})

@app.route('/api/compare', methods=['POST'])
def compare():
    try:
        # Get regions and topics from request
        regions = request.json.get("regions", [])
        topics = request.json.get("topics", [])
        
        results = {}
        for topic in topics:
            # Get values for each region
            values = {}
            for region in regions:
                # Get values from Firebase
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
            results[topic] = round(sum(similarities) / len(similarities) * 100) if similarities else 0

        return jsonify({
            "similarity_scores": results
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "main":
    app.run(debug=True, port=5000)
