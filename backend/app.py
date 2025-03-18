from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from flask_migrate import Migrate
from datetime import datetime, timedelta
import uuid
import re
import bleach
import secrets
import os
from flask import send_from_directory

app = Flask(__name__)
app.config.update({
    'SQLALCHEMY_DATABASE_URI': 'sqlite:///messenger.db',
    'SECRET_KEY': secrets.token_hex(32),
    'JWT_SECRET_KEY': secrets.token_hex(32),
    'JWT_TOKEN_LOCATION': ['headers', 'cookies'],
    'JWT_ACCESS_TOKEN_EXPIRES': timedelta(hours=1),
    'JWT_REFRESH_TOKEN_EXPIRES': timedelta(days=30),
    'JWT_BLACKLIST_ENABLED': True,
    'JWT_BLACKLIST_TOKEN_CHECKS': ['access', 'refresh'],
})

# Настройка CORS для всех источников
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Настройка SocketIO для всех источников
socketio = SocketIO(app, cors_allowed_origins="*", engineio_logger=True, logger=True, async_mode='threading')

db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Модель для отозванных токенов
class RevokedToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(120), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Модель пользователя
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(20), default='offline')
    profile_photo = db.Column(db.String(255), nullable=True)

# Модель чата
class Chat(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(80), nullable=False)
    is_group = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.now())

# Модель участника чата
class ChatMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    chat_id = db.Column(db.String(36), db.ForeignKey('chat.id'), nullable=False)

# Модель сообщения
class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500), nullable=True)
    image_urls = db.Column(db.JSON, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    chat_id = db.Column(db.String(36), db.ForeignKey('chat.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    is_read = db.Column(db.Boolean, default=False)
    reply_to_id = db.Column(db.Integer, db.ForeignKey('message.id'), nullable=True)

    user = db.relationship('User', lazy=True)
    reply_to = db.relationship('Message', remote_side=[id], lazy=True)

# Модель видео
class Video(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    tags = db.Column(db.String(255), nullable=True)
    url = db.Column(db.String(255), nullable=False)  # URL видео
    thumbnail = db.Column(db.String(255), nullable=True)  # URL миниатюры
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    views = db.Column(db.Integer, default=0)
    likes = db.Column(db.Integer, default=0)
    dislikes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=db.func.now())

# Модель комментария
class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    video_id = db.Column(db.Integer, db.ForeignKey('video.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())

# Вспомогательные функции
def validate_username(username):
    if not username or not isinstance(username, str):
        return False
    return bool(re.match(r'^[a-zA-Z0-9_.-]{3,80}$', username))

def validate_password(password):
    if not password or not isinstance(password, str) or len(password) < 8:
        return False
    return bool(re.search(r'[a-z]', password) and 
                re.search(r'[A-Z]', password) and 
                re.search(r'[0-9]', password))

def sanitize_html(text):
    if text is None:
        return None
    return bleach.clean(text, tags=[], strip=True)

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    token = RevokedToken.query.filter_by(jti=jti).first()
    return token is not None

# Маршруты для мессенджера
@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    if not validate_username(data['username']):
        return jsonify({'error': 'Invalid username format'}), 400
    
    if not validate_password(data['password']):
        return jsonify({'error': 'Password must be at least 8 characters with uppercase, lowercase, and numbers'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400

    profile_photo = data.get('profile_photo')
    if profile_photo and (not isinstance(profile_photo, str) or not profile_photo.startswith(('http://', 'https://'))):
        return jsonify({'error': 'Invalid profile photo URL'}), 400

    user = User(
        username=data['username'],
        password_hash=generate_password_hash(data['password']),
        profile_photo=profile_photo
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'id': user.id, 'username': user.username, 'profile_photo': user.profile_photo}), 201

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    user = User.query.filter_by(username=data['username']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    user.status = 'online'
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({
        'token': token,
        'user_id': user.id,
        'username': user.username,
        'profile_photo': user.profile_photo
    }), 200

@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    revoked_token = RevokedToken(jti=jti)
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user:
        user.status = 'offline'
    
    db.session.add(revoked_token)
    db.session.commit()
    return jsonify({'message': 'Successfully logged out'}), 200

@app.route('/api/chats', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def chats():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    if request.method == 'POST':
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({'error': 'Chat name is required'}), 400
        
        chat_name = sanitize_html(data['name'])
        if not chat_name or len(chat_name) > 80:
            return jsonify({'error': 'Invalid chat name'}), 400
        
        user_id = int(get_jwt_identity())
        chat = Chat(name=chat_name, is_group=data.get('is_group', False))
        db.session.add(chat)
        db.session.flush()
        db.session.add(ChatMember(user_id=user_id, chat_id=chat.id))
        db.session.commit()
        return jsonify({'id': chat.id, 'name': chat.name, 'is_group': chat.is_group}), 201

    user_id = int(get_jwt_identity())
    chats = db.session.query(Chat).join(ChatMember).filter(ChatMember.user_id == user_id).all()
    return jsonify([{'id': c.id, 'name': c.name, 'is_group': c.is_group} for c in chats]), 200

@app.route('/api/chats/<string:chat_id>/messages', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_messages(chat_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    user_id = int(get_jwt_identity())
    member = ChatMember.query.filter_by(chat_id=chat_id, user_id=user_id).first()
    if not member:
        return jsonify({'error': 'Access denied'}), 403
    
    messages = Message.query.filter_by(chat_id=chat_id).order_by(Message.created_at.asc()).all()
    output = []
    for m in messages:
        user = User.query.get(m.user_id)
        reply_data = None
        if m.reply_to_id:
            replied = Message.query.get(m.reply_to_id)
            if replied:
                reply_data = {
                    'id': replied.id,
                    'content': replied.content,
                    'image_urls': replied.image_urls,
                    'username': User.query.get(replied.user_id).username if User.query.get(replied.user_id) else 'Unknown'
                }
        output.append({
            'id': m.id,
            'content': m.content,
            'image_urls': m.image_urls or [],
            'user_id': m.user_id,
            'username': user.username if user else 'Unknown',
            'user_profile': user.profile_photo if user else None,
            'created_at': m.created_at.isoformat(),
            'reply_to': reply_data
        })
    return jsonify({'messages': output}), 200

@app.route('/api/profile', methods=['GET', 'OPTIONS'])
@jwt_required()
def profile():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'id': user.id,
        'username': user.username,
        'status': user.status,
        'profile_photo': user.profile_photo
    }), 200

@app.route('/api/profile/update_photo', methods=['POST', 'OPTIONS'])
@jwt_required()
def update_profile_photo():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data or 'profile_photo' not in data:
        return jsonify({'error': 'Profile photo URL is required'}), 400
    
    profile_photo = data.get('profile_photo')
    if not isinstance(profile_photo, str) or not profile_photo.startswith(('http://', 'https://')):
        return jsonify({'error': 'Invalid profile photo URL'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.profile_photo = profile_photo
    db.session.commit()
    return jsonify({'message': 'Profile photo updated', 'profile_photo': user.profile_photo}), 200

@app.route('/api/chats/<string:chat_id>/add_member', methods=['POST', 'OPTIONS'])
@jwt_required()
def add_member(chat_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    user_id = int(get_jwt_identity())
    member = ChatMember.query.filter_by(chat_id=chat_id, user_id=user_id).first()
    if not member:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    target_username = data.get('username')
    if not target_username or not validate_username(target_username):
        return jsonify({'error': 'Valid username is required'}), 400
    
    user_to_add = User.query.filter_by(username=target_username).first()
    if not user_to_add:
        return jsonify({'error': 'User not found'}), 404
    
    if ChatMember.query.filter_by(chat_id=chat_id, user_id=user_to_add.id).first():
        return jsonify({'error': 'User already in chat'}), 400
    
    new_member = ChatMember(user_id=user_to_add.id, chat_id=chat_id)
    db.session.add(new_member)
    db.session.commit()
    return jsonify({'message': f'User {target_username} added to chat'}), 200

@app.route('/api/chats/<string:chat_id>/join', methods=['POST', 'OPTIONS'])
@jwt_required()
def join_chat(chat_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    user_id = int(get_jwt_identity())
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404
    
    if ChatMember.query.filter_by(chat_id=chat_id, user_id=user_id).first():
        return jsonify({'message': 'Already in chat'}), 200
    
    new_member = ChatMember(user_id=user_id, chat_id=chat_id)
    db.session.add(new_member)
    db.session.commit()
    return jsonify({'message': f'Joined chat {chat.name}', 'id': chat.id, 'name': chat.name}), 200

# Маршруты для YouTube
@app.route('/api/videos/upload', methods=['POST'])
@jwt_required()
def upload_video():
    user_id = int(get_jwt_identity())
    data = request.form
    if 'title' not in data or 'video' not in request.files:
        return jsonify({'error': 'Title and video file are required'}), 400

    title = sanitize_html(data['title'])
    description = sanitize_html(data.get('description', ''))
    tags = sanitize_html(data.get('tags', ''))

    video_file = request.files['video']
    video_filename = f"{uuid.uuid4()}.mp4"
    video_path = os.path.join('static', 'videos', video_filename)
    os.makedirs(os.path.dirname(video_path), exist_ok=True)
    video_file.save(video_path)

    thumbnail = "https://via.placeholder.com/200x120"
    video = Video(
        title=title,
        description=description,
        tags=tags,
        url=f"/static/videos/{video_filename}",
        thumbnail=thumbnail,
        user_id=user_id
    )
    db.session.add(video)
    db.session.commit()
    return jsonify({'message': 'Video uploaded successfully', 'id': video.id}), 201
    
@app.route('/api/videos/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    videos = Video.query.order_by(Video.created_at.desc()).limit(10).all()
    return jsonify([{
        'id': v.id,
        'title': v.title,
        'thumbnail': v.thumbnail,
        'channel': User.query.get(v.user_id).username
    } for v in videos]), 200

@app.route('/api/videos/subscriptions', methods=['GET'])
@jwt_required()
def get_subscriptions():
    # Заглушка для видео от подписок (нужна модель подписок)
    return jsonify([]), 200

@app.route('/api/videos/beginners', methods=['GET'])
@jwt_required()
def get_beginners():
    beginners = User.query.filter(User.id.in_(
        db.session.query(Video.user_id).group_by(Video.user_id).having(db.func.count(Video.id) < 3)
    )).all()
    videos = Video.query.filter(Video.user_id.in_([u.id for u in beginners])).all()
    return jsonify([{
        'id': v.id,
        'title': v.title,
        'thumbnail': v.thumbnail,
        'channel': User.query.get(v.user_id).username
    } for v in videos]), 200

@app.route('/api/videos/<int:video_id>', methods=['GET'])
@jwt_required()
def get_video(video_id):
    video = Video.query.get(video_id)
    if not video:
        return jsonify({'error': 'Video not found'}), 404
    comments = Comment.query.filter_by(video_id=video_id).all()
    return jsonify({
        'id': video.id,
        'title': video.title,
        'description': video.description,
        'url': video.url,
        'channel': User.query.get(video.user_id).username,
        'views': video.views,
        'likes': video.likes,
        'dislikes': video.dislikes,
        'comments': [{'text': c.text, 'author': User.query.get(c.user_id).username} for c in comments]
    }), 200

@app.route('/static/videos/<path:filename>')
def serve_video(filename):
    file_path = os.path.join('static', 'videos', filename)
    print(f"Запрошен файл: {file_path}")
    if not os.path.exists(file_path):
        print(f"Файл не найден: {file_path}")
        return "File not found", 404
    return send_from_directory('static/videos', filename, mimetype='video/mp4')

@app.route('/api/videos/<int:video_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(video_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Comment text is required'}), 400
    text = sanitize_html(data['text'])
    comment = Comment(text=text, user_id=user_id, video_id=video_id)
    db.session.add(comment)
    db.session.commit()
    return jsonify({'id': comment.id, 'text': comment.text, 'author': User.query.get(user_id).username}), 201

@app.route('/api/videos/my_videos', methods=['GET'])
@jwt_required()
def get_my_videos():
    user_id = int(get_jwt_identity())
    videos = Video.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': v.id,
        'title': v.title,
        'views': v.views,
        'likes': v.likes,
        'dislikes': v.dislikes
    } for v in videos]), 200
    
# SocketIO для мессенджера
@socketio.on('connect')
def handle_connect():
    user_id = request.args.get('user_id')
    if user_id and user_id.isdigit():
        user = db.session.get(User, int(user_id))
        if user:
            user.status = 'online'
            db.session.commit()
    print(f"Client connected with user_id: {user_id}")

@socketio.on('join_chat')
def on_join(data):
    if not data or 'chat_id' not in data or 'user_id' not in data:
        emit('error', {'message': 'Missing required fields'})
        return
    
    room = str(data['chat_id'])
    user_id = data['user_id']
    member = ChatMember.query.filter_by(chat_id=room, user_id=int(user_id)).first()
    if member:
        join_room(room)
        emit('joined_chat', {'chat_id': room})
        print(f"User {user_id} joined chat {room}")

@socketio.on('send_message')
def handle_message(data):
    if not data or 'user_id' not in data or 'chat_id' not in data:
        emit('error', {'message': 'Missing required fields'})
        return
    
    user_id = int(data['user_id'])
    chat_id = data['chat_id']
    member = ChatMember.query.filter_by(chat_id=chat_id, user_id=user_id).first()
    if not member:
        emit('error', {'message': 'Access denied'})
        return
    
    message_content = sanitize_html(data.get('content'))
    image_urls = data.get('image_urls', [])
    if image_urls and isinstance(image_urls, list):
        safe_image_urls = [url for url in image_urls if isinstance(url, str) and url.startswith(('http://', 'https://'))]
    else:
        image_urls = []
    
    reply_to_id = data.get('reply_to_id')
    if reply_to_id and not Message.query.get(reply_to_id):
        reply_to_id = None
    
    message = Message(
        content=message_content,
        image_urls=image_urls if image_urls else None,
        user_id=user_id,
        chat_id=chat_id,
        reply_to_id=reply_to_id
    )
    db.session.add(message)
    db.session.commit()
    
    user = db.session.get(User, message.user_id)
    reply_data = None
    if message.reply_to_id:
        replied = db.session.get(Message, message.reply_to_id)
        if replied:
            reply_data = {
                'id': replied.id,
                'content': replied.content,
                'image_urls': replied.image_urls,
                'username': db.session.get(User, replied.user_id).username if db.session.get(User, replied.user_id) else 'Unknown'
            }
    
    message_data = {
        'id': message.id,
        'content': message.content,
        'image_urls': message.image_urls or [],
        'user_id': message.user_id,
        'username': user.username if user else 'Unknown',
        'user_profile': user.profile_photo if user else None,
        'created_at': message.created_at.isoformat(),
        'reply_to': reply_data
    }
    
    emit('new_message', message_data, room=str(chat_id), broadcast=True)
    print(f"Message sent to chat {chat_id}: {message_content}")

@socketio.on('disconnect')
def handle_disconnect():
    user_id = request.args.get('user_id')
    if user_id and user_id.isdigit():
        user = db.session.get(User, int(user_id))
        if user:
            user.status = 'offline'
            db.session.commit()
    print(f"Client disconnected with user_id: {user_id}")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
