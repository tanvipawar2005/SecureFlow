"""
Main Flask Application
"""
import os
import json
import base64
import time
from datetime import datetime
from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS
from werkzeug.utils import secure_filename
from flask import send_from_directory
from crypto_utils import AES256Encryptor
from rsa_utils import RSAEncryptor
from file_crypto import FileEncryptor

app = Flask(__name__)
CORS(app, origins=["http://localhost:5500", "http://127.0.0.1:5500"])

# Configuration
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')
app.config['ENCRYPTED_FOLDER'] = os.path.join(app.root_path, 'encrypted')
app.config['DECRYPTED_FOLDER'] = os.path.join(app.root_path, 'decrypted')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create directories
for folder in [app.config['UPLOAD_FOLDER'], 
               app.config['ENCRYPTED_FOLDER'], 
               app.config['DECRYPTED_FOLDER']]:
    os.makedirs(folder, exist_ok=True)

@app.route('/')
def index():
    return jsonify({
        'message': 'SecureFlow API Server',
        'endpoints': {
            '/encrypt-text': 'POST - Encrypt text with AES',
            '/decrypt-text': 'POST - Decrypt text with AES',
            '/encrypt-file': 'POST - Encrypt uploaded file',
            '/decrypt-file': 'POST - Decrypt uploaded .enc file',
            '/generate-rsa-keys': 'GET - Generate RSA key pair',
            '/rsa-encrypt': 'POST - Encrypt with RSA public key',
            '/rsa-decrypt': 'POST - Decrypt with RSA private key'
        }
    })

@app.route('/encrypt-text', methods=['POST'])
def encrypt_text():
    """Encrypt text using Fernet"""
    try:
        data = request.json
        plaintext = data.get('text')
        password = data.get('password')
        
        if not plaintext or not password:
            return jsonify({'error': 'Text and password are required'}), 400
        
        result = AES256Encryptor.encrypt_text(plaintext, password)
        
        # Simulate network traffic for demonstration
        network_view = {
            'plaintext_request': {'text': plaintext[:50] + '...' if len(plaintext) > 50 else plaintext},
            'encrypted_request': {'encrypted': result['encrypted'], 'salt': result['salt']},
            'algorithm': result['algorithm']
        }
        
        result['network_view'] = network_view
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/decrypt-text', methods=['POST'])
def decrypt_text():
    """Decrypt text using Fernet"""
    try:
        data = request.json
        encrypted_text = data.get('encrypted_text')
        password = data.get('password')
        salt = data.get('salt')
        
        if not encrypted_text or not password or not salt:
            return jsonify({'error': 'Encrypted text, password and salt are required'}), 400
        
        decrypted = AES256Encryptor.decrypt_text(encrypted_text, password, salt)
        
        return jsonify({
            'decrypted_text': decrypted,
            'message': 'Successfully decrypted'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/encrypt-file', methods=['POST'])
def encrypt_file():
    """Encrypt uploaded file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        file.filename = secure_filename(file.filename or '')
        if not file.filename:
            return jsonify({'error': 'Invalid filename'}), 400
        password = request.form.get('password')
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        # Save uploaded file
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(upload_path)
        
        # Encrypt file
        result = FileEncryptor.encrypt_file(
            upload_path, 
            password, 
            app.config['ENCRYPTED_FOLDER']
        )
        
        if not result['success']:
            return jsonify({'error': result['error']}), 500
        
        return jsonify({
            'message': 'File encrypted successfully',
            'encrypted_filename': result['encrypted_filename'],
            'metadata': result['metadata'],
            'download_url': f"/download/{result['encrypted_filename']}"
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/decrypt-file', methods=['POST'])
def decrypt_file():
    """Decrypt uploaded .enc file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        file.filename = secure_filename(file.filename or '')
        if not file.filename:
            return jsonify({'error': 'Invalid filename'}), 400
        password = request.form.get('password')
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        # Save uploaded encrypted file
        encrypted_path = os.path.join(app.config['ENCRYPTED_FOLDER'], file.filename)
        file.save(encrypted_path)
        
        # Decrypt file
        result = FileEncryptor.decrypt_file(
            encrypted_path,
            password,
            app.config['DECRYPTED_FOLDER']
        )
        
        if not result['success']:
            return jsonify({'error': result['error']}), 500
        
        return jsonify({
            'message': 'File decrypted successfully',
            'original_filename': result['original_filename'],
            'download_url': f"/download-decrypted/{result['original_filename']}"
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download/<filename>')
def download_encrypted(filename):
    """Download encrypted file"""
    try:
        path = os.path.join(app.config['ENCRYPTED_FOLDER'], filename)
        return send_from_directory(os.path.dirname(path), os.path.basename(path), as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@app.route('/download-decrypted/<filename>')
def download_decrypted(filename):
    """Download decrypted file"""
    try:
        path = os.path.join(app.config['DECRYPTED_FOLDER'], filename)
        return send_from_directory(os.path.dirname(path), os.path.basename(path), as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@app.route('/generate-rsa-keys', methods=['GET'])
def generate_rsa_keys():
    """Generate RSA key pair"""
    try:
        keys = RSAEncryptor.generate_key_pair()
        return jsonify(keys)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/rsa-encrypt', methods=['POST'])
def rsa_encrypt():
    """Encrypt with RSA public key"""
    try:
        data = request.json
        plaintext = data.get('text')
        public_key = data.get('public_key')
        
        if not plaintext or not public_key:
            return jsonify({'error': 'Text and public key are required'}), 400
        
        encrypted = RSAEncryptor.encrypt_with_public_key(plaintext, public_key)
        
        return jsonify({
            'encrypted': encrypted,
            'algorithm': 'RSA-OAEP-SHA256',
            'key_size': 2048
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/rsa-decrypt', methods=['POST'])
def rsa_decrypt():
    """Decrypt with RSA private key"""
    try:
        data = request.json
        encrypted_text = data.get('encrypted_text')
        private_key = data.get('private_key')
        
        if not encrypted_text or not private_key:
            return jsonify({'error': 'Encrypted text and private key are required'}), 400
        
        decrypted = RSAEncryptor.decrypt_with_private_key(encrypted_text, private_key)
        
        return jsonify({
            'decrypted_text': decrypted,
            'message': 'Successfully decrypted with RSA'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# ========== IMAGE ENCRYPTION ROUTES ==========

@app.route('/encrypt-image', methods=['POST'])
def encrypt_image():
    """Encrypt uploaded image using Fernet"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400
        
        file = request.files['file']
        file.filename = secure_filename(file.filename or '')
        if not file.filename:
            return jsonify({'error': 'Invalid filename'}), 400
        password = request.form.get('password')
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        # Validate image format
        allowed_extensions = {'.png', '.jpg', '.jpeg', '.jfif'}
        filename = file.filename.lower()
        if not any(filename.endswith(ext) for ext in allowed_extensions):
            return jsonify({'error': 'Only PNG and JPG images are supported'}), 400
        
        # Save uploaded image temporarily
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(upload_path)
        
        # Encrypt image using existing FileEncryptor
        result = FileEncryptor.encrypt_file(
            upload_path, 
            password, 
            app.config['ENCRYPTED_FOLDER']
        )
        
        if not result['success']:
            return jsonify({'error': result['error']}), 500
        
        # Get original image info for frontend
        original_size = os.path.getsize(upload_path)
        encrypted_size = os.path.getsize(result['encrypted_path'])
        
        return jsonify({
            'message': 'Image encrypted successfully',
            'encrypted_filename': result['encrypted_filename'],
            'metadata': result['metadata'],
            'download_url': f"/download/{result['encrypted_filename']}",
            'original_size': original_size,
            'encrypted_size': encrypted_size,
            'original_format': os.path.splitext(filename)[1]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/decrypt-image', methods=['POST'])
def decrypt_image():
    """Decrypt uploaded .enc image file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No encrypted file uploaded'}), 400
        
        file = request.files['file']
        file.filename = secure_filename(file.filename or '')
        if not file.filename:
            return jsonify({'error': 'Invalid filename'}), 400
        password = request.form.get('password')
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        # Validate it's an .enc file
        if not file.filename.endswith('.enc'):
            return jsonify({'error': 'Only .enc files are supported for decryption'}), 400
        
        # Save uploaded encrypted file
        encrypted_path = os.path.join(app.config['ENCRYPTED_FOLDER'], file.filename)
        file.save(encrypted_path)
        
        # Decrypt image using existing FileEncryptor
        result = FileEncryptor.decrypt_file(
            encrypted_path,
            password,
            app.config['DECRYPTED_FOLDER']
        )
        
        if not result['success']:
            return jsonify({'error': result['error']}), 500
        
        # Check if decrypted file is an image
        decrypted_path = result['decrypted_path']
        decrypted_filename = result['original_filename']
        
        # Validate it's an image file
        allowed_extensions = {'.png', '.jpg', '.jpeg', '.jfif'}
        if not any(decrypted_filename.lower().endswith(ext) for ext in allowed_extensions):
            # If not an image, still return success but with warning
            return jsonify({
                'message': 'File decrypted but not a valid image format',
                'original_filename': decrypted_filename,
                'download_url': f"/download-decrypted/{decrypted_filename}",
                'is_image': False
            })
        
        # Get image size
        image_size = os.path.getsize(decrypted_path)
        
        # Create preview URL (base64 encoded for immediate display)
        with open(decrypted_path, 'rb') as img_file:
            img_data = img_file.read()
            img_base64 = base64.b64encode(img_data).decode('utf-8')
        
        return jsonify({
            'message': 'Image decrypted successfully',
            'original_filename': decrypted_filename,
            'download_url': f"/download-decrypted/{decrypted_filename}",
            'preview_data': f"data:image/{decrypted_filename.split('.')[-1]};base64,{img_base64}",
            'image_size': image_size,
            'is_image': True
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get-image-preview/<filename>')
def get_image_preview(filename):
    """Get preview of original image"""
    try:
        path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        if not os.path.exists(path):
            return jsonify({'error': 'File not found'}), 404
        
        with open(path, 'rb') as img_file:
            img_data = img_file.read()
            img_base64 = base64.b64encode(img_data).decode('utf-8')
        
        return jsonify({
            'preview': f"data:image/{filename.split('.')[-1]};base64,{img_base64}"
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=False, host='127.0.0.1', port=5000)