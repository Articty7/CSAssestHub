# Flask app entrypoint
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__) #helps flask locate stuff
CORS(app)

assets = [
    { "id": 1, "name":"Robot Head", "type": "3D Model", "format": "obj"},
    { "id" :2, "name": "Desert Terrain", "type": "Texture", "format": "png"}

]

DB_PATH = "database.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/assets', methods=['GET', 'POST'])
def manage_assets():
    if request.method == 'GET':
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute ("SELECT * FROM assets")
        rows = cursor.fetchall()
        conn.close()

        assets = [dict(row) for row in rows]
        return jsonify(assets)

    if request.method =='POST':
        data = request.get_json()
        name = data.get("name")
        asset_type = data.get("type")
        file_format = data.get("format")

        if not name or not file_format:
            return jsonify ({"error": "Missing Required Fields"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO assets (name, type, file_format) VALUES (?, ?, ?)",
            (name, asset_type, file_format)
        )
        conn.commit()
        conn.close()

        return jsonify({"message": "Asset created successfully"}), 201



# run app directly

if __name__ =='__main__':
    app.run(debug=True)
