"""
RSA Encryption Utilities
"""
import base64
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
from Crypto.Hash import SHA256

class RSAEncryptor:
    """RSA encryption for key exchange"""
    
    @staticmethod
    def generate_key_pair(key_size=2048):
        """Generate RSA key pair"""
        key = RSA.generate(key_size)
        
        private_key = key.export_key()
        public_key = key.publickey().export_key()
        
        return {
            'private_key': private_key.decode(),
            'public_key': public_key.decode(),
            'key_size': key_size
        }
    
    @staticmethod
    def encrypt_with_public_key(data: str, public_key_pem: str) -> str:
        """Encrypt data using RSA public key"""
        try:
            # Import public key
            public_key = RSA.import_key(public_key_pem)
            cipher = PKCS1_OAEP.new(public_key, hashAlgo=SHA256)
            
            # Encrypt
            encrypted = cipher.encrypt(data.encode())
            
            return base64.b64encode(encrypted).decode()
        except Exception as e:
            raise Exception(f"RSA encryption failed: {str(e)}")
    
    @staticmethod
    def decrypt_with_private_key(encrypted_data: str, private_key_pem: str) -> str:
        """Decrypt data using RSA private key"""
        try:
            # Import private key
            private_key = RSA.import_key(private_key_pem)
            cipher = PKCS1_OAEP.new(private_key, hashAlgo=SHA256)
            
            # Decrypt
            decrypted = cipher.decrypt(base64.b64decode(encrypted_data))
            
            return decrypted.decode()
        except Exception as e:
            raise Exception(f"RSA decryption failed: {str(e)}")