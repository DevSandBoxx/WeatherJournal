from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
import requests
import openmeteo_requests
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

load_dotenv()

# Access the environment variables
firebase_config = {
    "type": "service_account",
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),  # Handle newlines in private key
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL"),
}


# Initialize the Firebase app with your credentials
cred = credentials.Certificate(firebase_config)
firebase_admin.initialize_app(cred)

openmeteo = openmeteo_requests.Client()

# Create a Firestore client
db = firestore.client()

# Collection reference for Firestore
journals_ref = db.collection("journals")

daily_weather_data = None

# Helper function to get weather data from an external API (e.g., OpenWeatherMap)
def get_weather(latitude, longitude, timezone):    
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "relative_humidity_2m",
        "daily": ["temperature_2m_max", "temperature_2m_min", "uv_index_max", "precipitation_sum", "sunrise", "sunset", "precipitation_probability_max", "wind_speed_10m_max"],
        "temperature_unit": "fahrenheit",
        "wind_speed_unit": "mph",
        "precipitation_unit": "inch",
        "timezone": str(timezone),
        "forecast_days": 1
    }
    responses = openmeteo.weather_api(url, params=params)
    weather_response = responses[0]
    daily_weather_data = {     
        "temperature_max": int(weather_response.Daily().Variables(0).Values(0)),  # Add index 0
        "temperature_min": int(weather_response.Daily().Variables(1).Values(0)),         
        "uv_index_max": weather_response.Daily().Variables(2).Values(0),
        "precipitation_sum": weather_response.Daily().Variables(3).Values(0),
        "sunrise": (datetime.fromtimestamp(weather_response.Daily().Variables(4).ValuesInt64(0))).strftime("%I:%M %p"),
        "sunset":(datetime.fromtimestamp(weather_response.Daily().Variables(5).ValuesInt64(0))).strftime("%I:%M %p"),
        "precipitation_probability_max": weather_response.Daily().Variables(6).Values(0),
        "wind_speed": weather_response.Daily().Variables(7).Values(0),
        "relative_humidity": weather_response.Current().Variables(0).Value(),
    }
    return daily_weather_data
    
@app.route("/getWeather", methods=["GET"])
def get_weather_route():
    latitude = request.args.get("latitude")
    longitude = request.args.get("longitude")
    timezone = request.args.get("timezone")
    
    if not latitude or not longitude:
        return jsonify({"error": "Latitude and longitude are required"}), 400

    weather_data = get_weather(latitude, longitude, timezone)

    if weather_data:
        return jsonify(weather_data), 200
    else:
        return jsonify({"error": "Failed to retrieve weather data"}), 500

@app.route("/createJournal", methods=["POST"])
def create_journal():
    data = request.get_json()
    date = data.get("date")
    daily_weather_data = data.get("weatherData")
    text = data.get("text")

    if not date or not daily_weather_data or not text:
        return jsonify({"error": "Date, weather data, and text are required"}), 400

    # Create the journal entry document
    journal_ref = journals_ref.document()
    journal_ref.set({
        "date": date,
        "weatherData": daily_weather_data,
        "text": text,
    })

    return jsonify({"message": "Journal created successfully"}), 201

@app.route("/deleteJournal", methods=["DELETE"])
def delete_journal():
    date = request.args.get("date")
    
    if not date:
        return jsonify({"error": "Date is required"}), 400

    journal_ref = journals_ref.document(date)
    journal_ref.delete()

    return jsonify({"message": "Journal deleted successfully"}), 200

# @app.route("/editJournal", methods=["PUT"])
# def edit_journal():
#     data = request.get_json()
#     date = data.get("date")
#     weather_data = data.get("weatherData")
#     text = data.get("text")

#     if not date or not weather_data or not text:
#         return jsonify({"error": "Date, weather data, and text are required"}), 400

#     # Get the journal document and update it
#     journal_ref = journals_ref.document(date)
#     journal_ref.update({
#         "weatherData": weather_data,
#         "text": text
#     })

#     return jsonify({"message": "Journal updated successfully"}), 200

@app.route("/getJournalByDate", methods=["GET"])
def get_journal_by_date():
    # Get the date from the query parameters
    date = request.args.get('date')

    if not date:
        return jsonify({"error": "Date parameter is required"}), 400

    journals = []
    for journal in journals_ref.stream():
        journal_data = journal.to_dict()
        if journal_data['date'] == date:
            journals.append(journal_data)

    if not journals:
        return jsonify({"error": "No journals found for the specified date"}), 404

    return jsonify(journals), 200

@app.route("/getAllJournals", methods=["GET"])
def get_all_journals():
    journals = []
    for journal in journals_ref.stream():
        journal_data = journal.to_dict()
        journals.append(journal_data)

    # Sort the journals by the 'date' field
    sorted_journals = sorted(journals, key=lambda x: x['date'])

    return jsonify(sorted_journals), 200

if __name__ == "__main__":
    app.run()
