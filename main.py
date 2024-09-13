from flask import Flask, render_template, jsonify, request
import requests
import logging
from collections import Counter

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_landmarks')
def get_landmarks():
    bbox = request.args.get('bbox')
    if not bbox:
        return jsonify({'error': 'Missing bbox parameter'}), 400

    west, south, east, north = map(float, bbox.split(','))
    center_lat = (north + south) / 2
    center_lon = (east + west) / 2

    api_url = 'https://en.wikipedia.org/w/api.php'
    params = {
        'action': 'query',
        'list': 'geosearch',
        'gscoord': f'{center_lat}|{center_lon}',
        'gsradius': '10000',  # 10km radius
        'gslimit': '50',
        'format': 'json'
    }

    response = requests.get(api_url, params=params)
    data = response.json()

    landmarks = []
    type_counter = Counter()
    for place in data['query']['geosearch']:
        landmark_type = determine_landmark_type(place['title'])
        landmarks.append({
            'pageid': place['pageid'],
            'title': place['title'],
            'lat': place['lat'],
            'lon': place['lon'],
            'type': landmark_type
        })
        type_counter[landmark_type] += 1

    type_counter['all'] = len(landmarks)

    return jsonify({
        'landmarks': landmarks,
        'counts': dict(type_counter)
    })

@app.route('/get_landmark_info/<int:pageid>')
def get_landmark_info(pageid):
    api_url = 'https://en.wikipedia.org/w/api.php'
    params = {
        'action': 'query',
        'pageids': pageid,
        'prop': 'extracts',
        'exintro': True,
        'explaintext': True,
        'format': 'json'
    }

    response = requests.get(api_url, params=params)
    data = response.json()

    page = data['query']['pages'][str(pageid)]
    extract = page.get('extract', 'No information available.')

    return jsonify({
        'title': page['title'],
        'extract': extract[:200] + '...' if len(extract) > 200 else extract
    })

def determine_landmark_type(title):
    historical_keywords = ['castle', 'palace', 'monument', 'memorial', 'museum', 'ruins', 'archaeological']
    natural_keywords = ['park', 'mountain', 'lake', 'river', 'forest', 'beach', 'island']
    cultural_keywords = ['theater', 'theatre', 'gallery', 'stadium', 'opera', 'library']

    title_lower = title.lower()
    
    if any(keyword in title_lower for keyword in historical_keywords):
        return 'historical'
    elif any(keyword in title_lower for keyword in natural_keywords):
        return 'natural'
    elif any(keyword in title_lower for keyword in cultural_keywords):
        return 'cultural'
    else:
        return 'other'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
