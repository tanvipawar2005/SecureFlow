/**
 * API Communication with Flask Backend
 */

const API_BASE_URL = 'http://localhost:5000';

class SecureFlowAPI {
    // Text Encryption
    static async encryptText(text, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/encrypt-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    password: password
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Encryption error:', error);
            throw error;
        }
    }

    static async decryptText(encryptedText, password, salt) {
        try {
            const response = await fetch(`${API_BASE_URL}/decrypt-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    encrypted_text: encryptedText,
                    password: password,
                    salt: salt
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Decryption error:', error);
            throw error;
        }
    }

    // File Encryption
    static async encryptFile(file, password) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('password', password);

            const response = await fetch(`${API_BASE_URL}/encrypt-file`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('File encryption error:', error);
            throw error;
        }
    }

    static async decryptFile(file, password) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('password', password);

            const response = await fetch(`${API_BASE_URL}/decrypt-file`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('File decryption error:', error);
            throw error;
        }
    }

    // RSA Operations
    static async generateRSAKeys() {
        try {
            const response = await fetch(`${API_BASE_URL}/generate-rsa-keys`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('RSA key generation error:', error);
            throw error;
        }
    }

    static async rsaEncrypt(text, publicKey) {
        try {
            const response = await fetch(`${API_BASE_URL}/rsa-encrypt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    public_key: publicKey
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('RSA encryption error:', error);
            throw error;
        }
    }

    static async rsaDecrypt(encryptedText, privateKey) {
        try {
            const response = await fetch(`${API_BASE_URL}/rsa-decrypt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    encrypted_text: encryptedText,
                    private_key: privateKey
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('RSA decryption error:', error);
            throw error;
        }
    }

    // Download endpoints
    static downloadEncryptedFile(filename) {
        window.open(`${API_BASE_URL}/download/${filename}`, '_blank');
    }

    static downloadDecryptedFile(filename) {
        window.open(`${API_BASE_URL}/download-decrypted/${filename}`, '_blank');
    }
}

// Export for use in main.js
window.SecureFlowAPI = SecureFlowAPI;