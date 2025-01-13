from flask import Flask, jsonify, request
from flask_cors import CORS
from firebase_admin import credentials, db, initialize_app
import traceback

app = Flask(__name__)
CORS(app)

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
initialize_app(cred, {
    "databaseURL": "https://culturelens-4872c-default-rtdb.firebaseio.com/"
})

@app.route('/api/compare', methods=['POST'])
def compare():
    try:
        # Extract regions and topics from the request
        regions = request.json.get("regions", [])
        topics = request.json.get("topics", [])
        print("Regions received:", regions)
        print("Topics received:", topics)

        results = {}

        for topic in topics:
            print(f"\nProcessing topic: {topic}")
            values = {}

            for region in regions:
                try:
                    fb_path = f"/{region}C/Details"
                    region_data = db.reference(fb_path).get()
                    print(f"Raw data fetched for region '{region}' and topic '{topic}': {region_data}")

                    region_values = set()

                    if region_data:
                        items_list = region_data.values() if isinstance(region_data, dict) else region_data
                        for item in items_list:
                            # Ensure the item matches the topic
                            if item.get("topic") == topic:
                                print(f"Matched item for topic '{topic}' in region '{region}': {item}")
                                annotations = item.get("annotations", [])
                                for annot in annotations:
                                    en_values = annot.get("en_values", [])
                                    # Convert all values to lowercase to ignore case sensitivity
                                    en_values_lower = {value.lower() for value in en_values}
                                    print(f"Annotation: {annot}, Extracted en_values: {en_values_lower}")
                                    if en_values_lower:
                                        region_values.update(en_values_lower)
                                    else:
                                        print(f"No 'en_values' found in annotation: {annot}")
                            else:
                                print(f"Skipped item with topic '{item.get('topic')}' in region '{region}'")
                    else:
                        print(f"No data found for region '{region}' and topic '{topic}'")

                    values[region] = region_values
                    print(f"Values for region '{region}': {region_values}")

                except Exception as region_error:
                    print(f"Error processing region '{region}': {region_error}")
                    traceback.print_exc()
                    values[region] = set()

            # Skip similarity calculation if no valid data
            if all(len(v) == 0 for v in values.values()):
                print(f"No valid data for topic '{topic}' across all regions.")
                results[topic] = 0
                continue

            # Calculate Jaccard similarity
            similarities = []
            for i, region1 in enumerate(regions):
                for region2 in regions[i + 1:]:
                    set1 = values.get(region1, set())
                    set2 = values.get(region2, set())
                    print(f"Values for '{region1}': {set1}")
                    print(f"Values for '{region2}': {set2}")
                    intersection = len(set1 & set2)
                    union = len(set1 | set2)
                    print(f"Intersection ({region1}, {region2}): {intersection}")
                    print(f"Union ({region1}, {region2}): {union}")
                    similarity = (intersection / union) if union else 0
                    similarities.append(similarity)

            # Store the average similarity score
            if similarities:
                average_similarity = round(sum(similarities) / len(similarities) * 100, 2)
                print(f"Similarity score for topic '{topic}': {average_similarity}")
                results[topic] = average_similarity
            else:
                print(f"No similarities found for topic '{topic}'")
                results[topic] = 0

        # Return the calculated results
        return jsonify({"similarity_scores": results})

    except Exception as e:
        # Catch and log any unexpected error
        print("Error in compare route:")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
