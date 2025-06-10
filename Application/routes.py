from flask import Blueprint, render_template, jsonify, request, redirect, url_for, flash, Flask, session

import os
import requests
from datetime import datetime
import pandas as pd
import json
from dotenv import load_dotenv

strava = Blueprint('strava', __name__)

load_dotenv()
CLIENT_ID = os.getenv("STRAVA_CLIENT_ID")
CLIENT_SECRET = os.getenv("STRAVA_CLIENT_SECRET")
REDIRECT_URI = "http://127.0.0.1:5000/authorize"

def save_to_file(filename, data):
    print(f"Saving data to {filename}...")
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)
    print("Save successful!")


def load_from_file(filename):
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            return json.load(f)
    return None

@strava.route('/')
def home():
    return f'''
        <h2>Connect Your Strava Account</h2>
        <a href="https://www.strava.com/oauth/authorize?client_id={CLIENT_ID}&response_type=code&redirect_uri={REDIRECT_URI}&approval_prompt=force&scope=read,activity:read">
            Connect with Strava
        </a>
    '''

# 30 Day Cache Activites 
@strava.route('/authorize')
def authorize():
    code = request.args.get('code')
    if not code:
        return "Authorization failed."

    response = requests.post("https://www.strava.com/oauth/token", data={
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'code': code,
        'grant_type': 'authorization_code'
    })

    data = response.json()
    access_token = data.get("access_token")
    session['access_token'] = access_token

    return f"✅ Connected! Your access token is:<br><code>{access_token}</code>"

@strava.route('/activities')
def activities():
    access_token = session.get('access_token')
    if not access_token:
        return "You need to connect with Strava first."

    cache_file = 'activities_cache.json'

    # First check if we have cached data
    cached = load_from_file(cache_file)
    if cached:
        print("Loaded activities from cache.")
        activities = cached
    else:
        print("No cache found, fetching from API...")
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get('https://www.strava.com/api/v3/athlete/activities', headers=headers)

        if response.status_code != 200:
            return f"Failed to get activities: {response.text}"

        activities = response.json()
        save_to_file(cache_file, activities)
        print("Fetched and saved to cache.")

    # Return something short and readable for now
    return f"<h2>Found {len(activities)} activities</h2>"

from flask import request

# Access runs since specified date
@strava.route('/runs')
def get_runs_since_date():
    access_token = session.get('access_token')
    if not access_token:
        return "You need to connect with Strava first."

    # 📅 Get start date from query params
    start_date = request.args.get('start')
    if not start_date:
        return "Please provide a start date in the format YYYY-MM-DD (e.g., /runs?start=2025-02-16)"

    try:
        start_timestamp = int(datetime.strptime(start_date, "%Y-%m-%d").timestamp())
    except ValueError:
        return "Invalid date format. Use YYYY-MM-DD."

    headers = {'Authorization': f'Bearer {access_token}'}
    runs = []
    page = 1

    while True:
        print(f"Fetching page {page}...")
        params = {
            'per_page': 100,
            'page': page,
            'after': start_timestamp
        }

        response = requests.get('https://www.strava.com/api/v3/athlete/activities', headers=headers, params=params)
        if response.status_code != 200:
            return f"API error on page {page}: {response.text}"

        activities = response.json()
        if not activities:
            break

        runs_on_page = [a for a in activities if a['type'] == 'Run']
        runs.extend(runs_on_page)
        page += 1

    filename = f"runs_since_{start_date}.json"
    save_to_file(filename, runs)

    return f"Fetched and saved {len(runs)} runs since {start_date} into {filename}"

@strava.route('/splits')
def get_splits():
    access_token = session.get('access_token')
    if not access_token:
        return "You need to connect with Strava first."

    # 🔍 Load the previously saved runs file
    filename = "runs_since_2025-05-25.json"
    runs = load_from_file(filename)
    if not runs:
        return f"No runs found in {filename}. Fetch them first using /runs."

    headers = {'Authorization': f'Bearer {access_token}'}
    all_splits = {}

    for i, run in enumerate(runs):
        activity_id = run['id']
        print(f"Fetching splits for activity {activity_id} ({i + 1}/{len(runs)})...")

        response = requests.get(f'https://www.strava.com/api/v3/activities/{activity_id}', headers=headers)
        if response.status_code != 200:
            print(f"Failed to fetch activity {activity_id}: {response.text}")
            continue

        activity_details = response.json()
        splits = activity_details.get('splits_standard')  
        if splits:
            all_splits[str(activity_id)] = splits

    # 💾 Save the splits to file
    save_to_file("splits_since_2025-05-25.json", all_splits)
    return f"Saved splits for {len(all_splits)} runs."

@strava.route('/fetch_runs', methods=['GET'])
def get_runs():
    columns_to_keep = [
        'name',             # Run name
        'start_date_local', # Local date/time string
        'distance',         # Distance in meters
        'moving_time',      # Moving time in seconds
        'elapsed_time',     # Elapsed time in seconds
        'total_elevation_gain', # Elevation gain in meters
        'average_speed',    # m/s
        'max_speed',        # m/s
        'average_heartrate',# bpm
        'max_heartrate',    # bpm
        'average_cadence',  # cadence (steps per minute)
        'kilojoules',       # energy
        'start_lat',        # GPS start lat
        'start_lng',        # GPS start lng
        'end_lat',          # GPS end lat
        'end_lng',          # GPS end lng
        'map.id',             # For reference or building links
        'map.summary_polyline'  # 🗺️ Encoded route
    ]

    # Load CSV
    df = pd.read_csv('Data Processing/runs_filtered.csv')

    # Filter columns
    df_filtered = df[columns_to_keep]

    # Convert to JSON (records = list of dicts)
    runs_json = df_filtered.to_dict(orient='records')

    return jsonify(runs_json)

@strava.route("/splits_by_run/<run_id>", methods=["GET"])
def get_splits_by_run(run_id):
    # Define relevant columns
    split_columns = [
        'distance',
        'elapsed_time',
        'elevation_difference',
        'moving_time',
        'split',
        'average_speed',
        'average_grade_adjusted_speed',
        'pace_zone',
        'run_id',
        'average_heartrate'
    ]

    try:
        # Load the CSV with all splits
        splits_df = pd.read_csv("Data Processing/splits_processed.csv")

        # Filter the splits for the given run_id
        filtered = splits_df[splits_df['run_id'].astype(str) == str(run_id)]

        # Only keep the desired columns
        result = filtered[split_columns].to_dict(orient="records")

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500