from flask import Flask, jsonify, request
from flask_cors import CORS  # Import for Cross-Origin Resource Sharing
import json
import os
from uuid import uuid4

app = Flask(__name__)
# Configure CORS to allow requests from your React frontend
CORS(app, resources={r"/api/*": {"origins": "*"}})

POSTS_FILE = 'posts.json'

def load_posts():
    if os.path.exists(POSTS_FILE):
        with open(POSTS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_posts(posts):
    with open(POSTS_FILE, 'w') as f:
        json.dump(posts, f, indent=2)

@app.route('/api/posts', methods=['GET'])
def get_posts():
    return jsonify(load_posts())

@app.route('/api/posts/<post_id>', methods=['GET'])
def get_post(post_id):
    posts = load_posts()
    for post in posts:
        if post['id'] == post_id:
            return jsonify(post)
    return jsonify({'error': 'Post not found'}), 404

@app.route('/api/posts', methods=['POST'])
def create_post():
    # Debug line to see what's coming in
    print("Received POST request to /api/posts")
    
    # Check if we're getting JSON data
    if not request.is_json:
        print("Request is not JSON")
        return jsonify({'error': 'Request must be JSON'}), 400
    
    data = request.get_json()
    print("Received data:", data)
    
    if not all(k in data for k in ('title', 'summary', 'content')):
        return jsonify({'error': 'Missing required fields (title, summary, content)'}), 400
        
    posts = load_posts()
    new_post = {
        'id': str(uuid4()),
        'title': data['title'],
        'summary': data['summary'],
        'content': data['content']
    }
    posts.append(new_post)
    save_posts(posts)
    
    # Debug line to confirm successful post creation
    print(f"Created new post with ID: {new_post['id']}")
    
    return jsonify(new_post), 201

@app.route('/api/posts/<post_id>', methods=['DELETE'])
def delete_post(post_id):
    posts = load_posts()
    updated = [p for p in posts if p['id'] != post_id]
    if len(posts) == len(updated):
        return jsonify({'error': 'Post not found'}), 404
    save_posts(updated)
    return jsonify({'success': True})

@app.route('/api/posts/<post_id>', methods=['PUT'])
def update_post(post_id):
    data = request.get_json()
    posts = load_posts()
    for post in posts:
        if post['id'] == post_id:
            post.update({k: data[k] for k in ('title', 'summary', 'content') if k in data})
            save_posts(posts)
            return jsonify(post)
    return jsonify({'error': 'Post not found'}), 404

if __name__ == '__main__':
    # Make sure app.py and posts.json are in the same directory
    if not os.path.exists(POSTS_FILE):
        with open(POSTS_FILE, 'w') as f:
            json.dump([], f)
    
    # Print the server address for easier debugging
    print("Starting server at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)