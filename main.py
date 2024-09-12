from flask import Flask, render_template, jsonify, request
import requests

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_landmarks')
def get_landmarks():
    bbox = request.args.get('bbox')
    if not bbox:
        return jsonify({'error': 'Missing bbox parameter'}), 400

    # Wikipedia API endpoint for geosearch
    api_url = 'https://en.wikipedia.org/w/api.php'
    params = {
        'action': 'query',
        'list': 'geosearch',
        'gscoord': f'{bbox.split(",")[1]}|{bbox.split(",")[0]}',  # Center of the bbox
        'gsradius': '10000',  # 10km radius
        'gslimit': '50',
        'format': 'json'
    }

    response = requests.get(api_url, params=params)
    data = response.json()

    landmarks = []
    for place in data['query']['geosearch']:
        landmarks.append({
            'pageid': place['pageid'],
            'title': place['title'],
            'lat': place['lat'],
            'lon': place['lon']
        })

    return jsonify(landmarks)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
