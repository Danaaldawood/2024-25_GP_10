from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, db

app = Flask(__name__)
CORS(app)

if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://culturelens-4872c-default-rtdb.firebaseio.com'
    })

def calculate_similarity(value1, value2):
    """Calculate Jaccard similarity between two comma-separated string values."""
    if not value1 or not value2:
        return 0.0
        
    def process_value(val):
        if isinstance(val, list):
            items = [str(v).lower().strip() for v in val]
        else:
            items = str(val).lower().strip().split(',')
        return {item.strip() for item in items if item.strip()}
    
    set1 = process_value(value1)
    set2 = process_value(value2)
    
    if not set1 or not set2:
        return 0.0
        
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    return float(intersection) / union if union > 0 else 0.0

@app.route('/api/compare', methods=['GET', 'POST'])
def compare_cultures():
    if request.method == 'GET':
        return jsonify({'message': 'API is running'})

    try:
        data = request.get_json()
        regions = data.get('regions', [])
        topics = data.get('topics', [])
        
        if not regions or not topics:
            return jsonify({'error': 'Missing parameters'}), 400

        # Fetch Firebase data
        firebase_data = db.reference('/').get()
        if not firebase_data:
            return jsonify({'error': 'No data available'}), 404

        region_values = {region: {} for region in regions}

        for region_key, region_data in firebase_data.items():
            if isinstance(region_data, dict) and 'Details' in region_data:
                details = region_data['Details']
                items = details if isinstance(details, list) else details.values()
                
                for item in items:
                    if item.get('topic') in topics and item.get('region_name') in regions:
                        region_name = item.get('region_name')
                        topic = item.get('topic')
                        if item.get('annotations') and item['annotations'][0].get('en_values'):
                            values = item['annotations'][0]['en_values']
                            if values:
                                if topic not in region_values[region_name]:
                                    region_values[region_name][topic] = {}
                                region_values[region_name][topic][item['en_question']] = values

        similarities = {topic: [] for topic in topics}
        for topic in topics:
            for i, region1 in enumerate(regions):
                for region2 in regions[i+1:]:
                    scores = []
                    common_questions = set(region_values[region1].get(topic, {}).keys()) & set(region_values[region2].get(topic, {}).keys())
                    
                    for question in common_questions:
                        val1 = region_values[region1][topic].get(question, [])
                        val2 = region_values[region2][topic].get(question, [])
                        if val1 and val2:
                            score = calculate_similarity(val1, val2)
                            scores.append(score)

                    avg_similarity = sum(scores) / len(scores) * 100 if scores else 0
                    similarities[topic].append({
                        'name': f"{region1} vs {region2}",
                        'value': avg_similarity,
                        'color': f"hsl({avg_similarity * 1.2}, 70%, 50%)"
                    })

        return jsonify({'similarities': similarities})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
