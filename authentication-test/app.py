from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import base64
import sqlite3
import hashlib
import hmac
import time
import json

app = Flask(__name__)

def makeUser(username: str, hash: str):
    try:
        conn = sqlite3.connect('database.db')
        cursor  = conn.cursor()
        cursor.execute('''
            INSERT OR IGNORE INTO users(username, hash, CURRENT) VALUES (?,?,1);
        ''', (username, hash))
        conn.commit()
        conn.close()
        if cursor.rowcount == 0:
            return False
        else:
            return True
    except sqlite3.Error as e:
        return False
    
def getUser(username: str):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    data = cursor.execute('''
        SELECT user_id, username, HASH, CURRENT
        FROM users
        WHERE username = (?);
    ''', (username,)).fetchone()
    user_id, uname, hash, current = data
    conn.close()
    return (user_id, uname, hash, current)

def logOutUser(username: str):
    try:
        conn = sqlite3.connect('database.db')
        cursor  = conn.cursor()
        cursor.execute('''
            UPDATE users
            SET CURRENT = -1
            WHERE username = (?);
        ''', (username,))
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        return False

def logInUser(username: str):
    try:
        conn = sqlite3.connect('database.db')
        cursor  = conn.cursor()
        cursor.execute('''
            UPDATE users
            SET CURRENT = 1
            WHERE username = (?);
        ''', (username,))
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        return False
    
def makeAWT(username: str):
    #Asher Web Token format payload.signature where payload = {user_id, username, iat, expires}
    load_dotenv('vars.env')
    SECRET_KEY=os.getenv("SECRET_KEY").encode()
    data  = getUser(username)
    if not data:
        return 
    user_id = data[0]
    uname = data[1]
    iat = int(time.time())
    exp = iat + 15
    payload = {
        'user_id':user_id,
        'username': uname,
        'iat': iat,
        'exp': exp
    }
    encoded_payload = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signature = hmac.new(SECRET_KEY, encoded_payload.encode(), hashlib.sha256).hexdigest()
    AWT = f"{encoded_payload}.{signature}"
    return AWT

def verifyAWT(AWT: str):
    load_dotenv('vars.env')
    SECRET_KEY=os.getenv("SECRET_KEY").encode()
    try:
        encoded_payload, signature = AWT.split('.')
    except:
        return False
    pad = ('=' * (4 - len(encoded_payload) % 4)).encode()
    encoded_payload1 = encoded_payload.encode()
    decoded_payload = base64.urlsafe_b64decode(encoded_payload1 + pad).decode()
    payload = json.loads(decoded_payload)
    if 'user_id' not in payload or 'username' not in payload or 'iat' not in payload or 'exp' not in payload:
        print("missing user fields")
        return False
    current_time = int(time.time())
    if getUser(payload['username'])[3] <= 0:
        return False
    if current_time > payload['exp']:
        print("token expired")
        return False
    computed_signature = hmac.new(SECRET_KEY, encoded_payload.encode(), hashlib.sha256).hexdigest()
    if computed_signature != signature:
        print("signature doesnt match")
        print(f"{computed_signature} :: computed")
        print(f"{signature} :: given")
        return False
    return payload#token is valid!!!

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    hashedPassword = data['hashedPassword']
    user_id, uname, hash, current = getUser(username)
    if hashedPassword == hash:
        if current <= 0:
            logInUser(username)
        return jsonify({'status': 'authenticated', 'token': makeAWT(username)}), 200
    else:
        return jsonify({'status': 'not-authenticated', 'error': 'password not found'}), 404

@app.route('/token', methods=['POST'])
def token():
    data = request.get_json()
    token = data['token']
    if verifyAWT(token):
        return jsonify({'status': 'good',}), 200
    else: 
        return jsonify({'status': 'bad',}), 404

@app.route('/logout', methods=['POST'])
def logout():
    data = request.get_json()
    token = data['token']
    usr = verifyAWT(token)
    if verifyAWT(token):
        if usr['CURRENT'] == 1:
            logOutUser(usr['username'])
if __name__ == '__main__':
    load_dotenv('vars.env')
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            HASH TEXT,
            CURRENT INTEGER
            );
    ''')
    conn.commit()
    conn.close()
    distinct1 = makeUser('asher',  hashlib.sha256('password'.encode()).hexdigest())
    distinct2= makeUser('Teddy', hashlib.sha256('TeddyPassword'.encode()).hexdigest())
    if distinct1 and distinct2:
        print(f"distinct users created!")
    awt = makeAWT('asher')
    print(f"awt: {awt}, status: {verifyAWT(awt)}")
    app.run(debug=True)
