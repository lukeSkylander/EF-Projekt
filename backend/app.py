from flask import Flask, jsonify

app = Flask(__name__)

# Example data
products = [
    {"id": 1, "name": "T-shirt", "price": 20},
    {"id": 2, "name": "Cap", "price": 15}
]

@app.route('/')
def home():
    return "Webshop backend is running 🚀"

@app.route('/api/products')
def get_products():
    return jsonify(products)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

