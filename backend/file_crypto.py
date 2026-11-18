"""
File Encryption Utilities
"""
import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

class FileEncryptor:
    """Encrypt and decrypt files using Fernet"""
    
    @staticmethod
    def encrypt_file(file_path: str, password: str, output_dir: str = "encrypted"):
        """Encrypt a file and save with .enc extension"""
        try:
            # Read file
            with open(file_path, 'rb') as f:
                file_data = f.read()
            
            # Generate key
            salt = os.urandom(16)
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
            
            # Encrypt
            cipher = Fernet(key)
            encrypted_data = cipher.encrypt(file_data)
            
            # Prepare metadata
            metadata = {
                'salt': base64.urlsafe_b64encode(salt).decode(),
                'original_filename': os.path.basename(file_path),
                'encrypted_size': len(encrypted_data)
            }
            
            # Create output filename
            original_name = os.path.basename(file_path)
            encrypted_filename = f"{original_name}.enc"
            encrypted_path = os.path.join(output_dir, encrypted_filename)
            
            # Write encrypted file
            os.makedirs(output_dir, exist_ok=True)
            with open(encrypted_path, 'wb') as f:
                # Write salt first (16 bytes), then encrypted data
                f.write(salt)
                f.write(encrypted_data)
            
            return {
                'encrypted_path': encrypted_path,
                'encrypted_filename': encrypted_filename,
                'metadata': metadata,
                'success': True
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'success': False
            }
    
    @staticmethod
    def decrypt_file(encrypted_path: str, password: str, output_dir: str = "decrypted"):
        """Decrypt a .enc file"""
        try:
            # Read encrypted file
            with open(encrypted_path, 'rb') as f:
                # First 16 bytes are salt
                salt = f.read(16)
                encrypted_data = f.read()
            
            # Regenerate key
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
            
            # Decrypt
            cipher = Fernet(key)
            decrypted_data = cipher.decrypt(encrypted_data)
            
            # Extract original filename from .enc filename
            original_filename = os.path.basename(encrypted_path).replace('.enc', '')
            decrypted_path = os.path.join(output_dir, original_filename)
            
            # Write decrypted file
            os.makedirs(output_dir, exist_ok=True)
            with open(decrypted_path, 'wb') as f:
                f.write(decrypted_data)
            
            return {
                'decrypted_path': decrypted_path,
                'original_filename': original_filename,
                'success': True
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'success': False
            }