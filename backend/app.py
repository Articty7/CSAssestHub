# Flask app entrypoint
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__) #helps flask locate stuff
CORS(app)

assets = [
    { "id": 1, "name":"Robot Head", "type": "3D Model", "format": "obj"},
    { "id" :2, "name": "Desert Terrain", "type": "Texture", "format": "png"}

]

@app.route('/api/assets', methods=['GET', 'POST'])
def manage_assets():
    if request.method == 'GET':
        return jsonify(assets)

    if request.method =='POST':
        data = request.json
        new_asset = {
            "id": len(assets) +1,
            "name": data.get("name"),
            "type": data.get("type"),
            "format": data.get("format")
        }
        assets.append(new_asset)
        return jsonify(new_asset), 201

# run app directly

if __name__ =='__main__':
    app.run(debug=True)
