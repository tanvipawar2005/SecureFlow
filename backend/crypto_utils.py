"""
AES Encryption Utilities
"""
import base64
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

class AES256Encryptor:
    """Fernet encryption with PBKDF2 key derivation"""
    
    @staticmethod
    def generate_key(password: str, salt: bytes = None) -> tuple:
        """
        Generate AES key from password using PBKDF2
        Returns: (key, salt) as base64 strings
        """
        if salt is None:
            salt = os.urandom(16)
        
        # Derive key using PBKDF2
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return key, base64.urlsafe_b64encode(salt).decode()
    
    @staticmethod
    def encrypt_text(plaintext: str, password: str) -> dict:
        """Encrypt text using Fernet"""
        try:
            # Generate key and salt
            key, salt = AES256Encryptor.generate_key(password)
            
            # Create Fernet cipher
            cipher = Fernet(key)
            
            # Encrypt the plaintext
            encrypted_data = cipher.encrypt(plaintext.encode())
            
            return {
                'encrypted': base64.urlsafe_b64encode(encrypted_data).decode(),
                'salt': salt,
                'algorithm': 'Fernet (AES-128-CBC + HMAC-SHA256)',
                'key_derivation': 'PBKDF2-HMAC-SHA256'
            }
        except Exception as e:
            raise Exception(f"Encryption failed: {str(e)}")
    
    @staticmethod
    def decrypt_text(encrypted_text: str, password: str, salt: str) -> str:
        """Decrypt text using Fernet"""
        try:
            # Decode salt
            salt_bytes = base64.urlsafe_b64decode(salt.encode())
            
            # Regenerate key
            key, _ = AES256Encryptor.generate_key(password, salt_bytes)
            
            # Create Fernet cipher
            cipher = Fernet(key)
            
            # Decrypt
            decrypted_data = cipher.decrypt(base64.urlsafe_b64decode(encrypted_text.encode()))
            
            return decrypted_data.decode()
        except Exception as e:
            raise Exception(f"Decryption failed: {str(e)}")