from flask import Flask, jsonify
from pymongo import MongoClient

app = Flask(__name__)

# MongoDB connection details
mongo_url = 'mongodb://localhost:27017'
db_name = 'school_database'


# Function to connect to MongoDB
def connect_to_mongodb():
    try:
        client = MongoClient(mongo_url)
        db = client[db_name]
        return db
    except Exception as e:
        print("Error connecting to MongoDB:", e)
        return None


# Route to display connection success message
@app.route('/') 
def index():
    db = connect_to_mongodb()
    if db is not None:
        return "Successfully connected to MongoDB!"
    else:
        return "Failed to connect to MongoDB."

if __name__ == '__main__':
    app.run(debug=True)
