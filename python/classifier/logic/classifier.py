from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/suggest', methods=['POST'])
def suggest():
    return jsonify({
        "198540da79baeaba": [
            {
                "action": "delete",
                "confidence_score": 0.95,
                "category": "promociones"
            }
        ],
        "19853cb78a30c6c5": [
            {
                "action": "archive",
                "confidence_score": 0.88,
                "category": "bancos"
            }
        ]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5055)

