/**
 * Main Application Logic
 */

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show active tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });

    // ========== INSECURE OBFUSCATION TAB ==========
    
    // Caesar shift slider
    const caesarShift = document.getElementById('caesar-shift');
    const shiftValue = document.getElementById('shift-value');
    
    if (caesarShift) {
        caesarShift.addEventListener('input', function() {
            shiftValue.textContent = this.value;
        });
    }

    // Method selection show/hide options
    const methodSelect = document.getElementById('obfuscation-method');
    if (methodSelect) {
        methodSelect.addEventListener('change', function() {
            const caesarContainer = document.getElementById('caesar-shift-container');
            const xorContainer = document.getElementById('xor-key-container');
            
            if (this.value === 'caesar') {
                caesarContainer.style.display = 'block';
                xorContainer.style.display = 'none';
            } else if (this.value === 'xor') {
                caesarContainer.style.display = 'none';
                xorContainer.style.display = 'block';
            } else {
                caesarContainer.style.display = 'none';
                xorContainer.style.display = 'none';
            }
        });
    }

    // Obfuscate button
    const obfuscateBtn = document.getElementById('obfuscate-btn');
    if (obfuscateBtn) {
        obfuscateBtn.addEventListener('click', function() {
            const method = document.getElementById('obfuscation-method').value;
            const inputText = document.getElementById('obfuscate-input').value;
            let output = '';
            
            // Update network demo view
            document.getElementById('attack-view-text').textContent = inputText.substring(0, 50);
            
            switch(method) {
                case 'caesar':
                    const shift = parseInt(document.getElementById('caesar-shift').value);
                    output = InsecureObfuscation.caesarCipher(inputText, shift);
                    break;
                case 'reverse':
                    output = InsecureObfuscation.reverseText(inputText);
                    break;
                case 'base64':
                    output = InsecureObfuscation.base64Encode(inputText);
                    break;
                case 'xor':
                    const key = document.getElementById('xor-key').value || 'K';
                    output = InsecureObfuscation.xorCipher(inputText, key);
                    break;
                case 'scramble':
                    output = InsecureObfuscation.scrambleText(inputText);
                    break;
            }
            
            document.getElementById('obfuscate-output').value = output;
            UIHelper.showToast('Text obfuscated (NOT encrypted!)', 'warning');
        });
    }

    // Reverse obfuscation
    const reverseBtn = document.getElementById('reverse-obfuscation');
    if (reverseBtn) {
        reverseBtn.addEventListener('click', function() {
            const method = document.getElementById('obfuscation-method').value;
            const inputText = document.getElementById('obfuscate-output').value;
            let output = '';
            
            switch(method) {
                case 'caesar':
                    const shift = parseInt(document.getElementById('caesar-shift').value);
                    output = InsecureObfuscation.caesarCipher(inputText, 26 - shift);
                    break;
                case 'reverse':
                    output = InsecureObfuscation.reverseText(inputText);
                    break;
                case 'base64':
                    try {
                        output = InsecureObfuscation.base64Decode(inputText);
                    } catch {
                        output = 'Invalid Base64!';
                    }
                    break;
                case 'xor':
                    const key = document.getElementById('xor-key').value || 'K';
                    output = InsecureObfuscation.xorCipher(inputText, key); // XOR is reversible
                    break;
                case 'scramble':
                    output = InsecureObfuscation.unscrambleText(inputText, '');
                    break;
            }
            
            document.getElementById('obfuscate-input').value = output;
            UIHelper.showToast('Obfuscation reversed - See how easy it is?', 'error');
        });
    }

    // Copy obfuscated text
    const copyBtn = document.getElementById('copy-obfuscated');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const text = document.getElementById('obfuscate-output').value;
            if (text) {
                UIHelper.copyToClipboard(text);
            }
        });
    }

    // ========== AES ENCRYPTION TAB ==========
    
    // Encrypt with AES
    const encryptAesBtn = document.getElementById('encrypt-aes-btn');
    if (encryptAesBtn) {
        encryptAesBtn.addEventListener('click', async function() {
            const text = document.getElementById('aes-input').value;
            const password = document.getElementById('aes-password').value;
            
            if (!text || !password) {
                UIHelper.showToast('Please enter text and password', 'error');
                return;
            }
            
            UIHelper.showLoading('encrypt-aes-btn');
            
            try {
                const result = await SecureFlowAPI.encryptText(text, password);
                
                // Display results
                document.getElementById('aes-encrypted-output').value = result.encrypted;
                document.getElementById('aes-salt').value = result.salt;
                
                // Fill decryption fields for convenience
                document.getElementById('aes-decrypt-input').value = result.encrypted;
                document.getElementById('decrypt-salt').value = result.salt;
                
                // Update network demo view
                document.getElementById('secure-attack-view').textContent = 
                    result.encrypted.substring(0, 30) + '...';
                
                UIHelper.showElement('aes-results');
                UIHelper.showToast('Text encrypted securely with Fernet!', 'success');
                
            } catch (error) {
                UIHelper.showToast('Encryption failed: ' + error.message, 'error');
            } finally {
                UIHelper.hideLoading('encrypt-aes-btn');
            }
        });
    }

    // Decrypt with AES
    const decryptAesBtn = document.getElementById('decrypt-aes-btn');
    if (decryptAesBtn) {
        decryptAesBtn.addEventListener('click', async function() {
            const encryptedText = document.getElementById('aes-decrypt-input').value;
            const salt = document.getElementById('decrypt-salt').value;
            const password = document.getElementById('decrypt-password').value;
            
            if (!encryptedText || !password || !salt) {
                UIHelper.showToast('Please fill all fields', 'error');
                return;
            }
            
            UIHelper.showLoading('decrypt-aes-btn');
            
            try {
                const result = await SecureFlowAPI.decryptText(encryptedText, password, salt);
                
                document.getElementById('aes-decrypted-output').value = result.decrypted_text;
                UIHelper.showElement('decryption-results');
                UIHelper.showToast('Text decrypted successfully!', 'success');
                
            } catch (error) {
                UIHelper.showToast('Decryption failed: ' + error.message, 'error');
            } finally {
                UIHelper.hideLoading('decrypt-aes-btn');
            }
        });
    }

    // ========== RSA ENCRYPTION TAB ==========
    
    // Generate RSA keys
    const generateRsaBtn = document.getElementById('generate-rsa-keys');
    if (generateRsaBtn) {
        generateRsaBtn.addEventListener('click', async function() {
            UIHelper.showLoading('generate-rsa-keys');
            
            try {
                const keys = await SecureFlowAPI.generateRSAKeys();
                
                document.getElementById('public-key').value = keys.public_key;
                document.getElementById('private-key').value = keys.private_key;
                
                // Fill demo fields
                document.getElementById('rsa-public-key-input').value = keys.public_key;
                document.getElementById('rsa-private-key-input').value = keys.private_key;
                
                UIHelper.showElement('rsa-keys');
                UIHelper.showToast('RSA key pair generated!', 'success');
                
            } catch (error) {
                UIHelper.showToast('Failed to generate keys: ' + error.message, 'error');
            } finally {
                UIHelper.hideLoading('generate-rsa-keys');
            }
        });
    }

    // Encrypt with RSA
    const encryptRsaBtn = document.getElementById('encrypt-rsa-btn');
    if (encryptRsaBtn) {
        encryptRsaBtn.addEventListener('click', async function() {
            const text = document.getElementById('rsa-encrypt-input').value;
            const publicKey = document.getElementById('rsa-public-key-input').value;
            
            if (!text || !publicKey) {
                UIHelper.showToast('Please enter text and public key', 'error');
                return;
            }
            
            UIHelper.showLoading('encrypt-rsa-btn');
            
            try {
                const result = await SecureFlowAPI.rsaEncrypt(text, publicKey);
                
                document.getElementById('rsa-encrypted-output').value = result.encrypted;
                document.getElementById('rsa-decrypt-input').value = result.encrypted;
                
                UIHelper.showElement('rsa-encryption-results');
                UIHelper.showToast('Text encrypted with RSA!', 'success');
                
            } catch (error) {
                UIHelper.showToast('RSA encryption failed: ' + error.message, 'error');
            } finally {
                UIHelper.hideLoading('encrypt-rsa-btn');
            }
        });
    }

    // Decrypt with RSA
    const decryptRsaBtn = document.getElementById('decrypt-rsa-btn');
    if (decryptRsaBtn) {
        decryptRsaBtn.addEventListener('click', async function() {
            const encryptedText = document.getElementById('rsa-decrypt-input').value;
            const privateKey = document.getElementById('rsa-private-key-input').value;
            
            if (!encryptedText || !privateKey) {
                UIHelper.showToast('Please enter encrypted text and private key', 'error');
                return;
            }
            
            UIHelper.showLoading('decrypt-rsa-btn');
            
            try {
                const result = await SecureFlowAPI.rsaDecrypt(encryptedText, privateKey);
                
                document.getElementById('rsa-decrypted-output').value = result.decrypted_text;
                UIHelper.showElement('rsa-decryption-results');
                UIHelper.showToast('RSA decryption successful!', 'success');
                
            } catch (error) {
                UIHelper.showToast('RSA decryption failed: ' + error.message, 'error');
            } finally {
                UIHelper.hideLoading('decrypt-rsa-btn');
            }
        });
    }

    // ========== FILE ENCRYPTION TAB ==========
    
    // File selection for encryption
    const browseFileBtn = document.getElementById('browse-file');
    const fileInputEncrypt = document.getElementById('file-to-encrypt');
    let selectedFile = null;
    
    if (browseFileBtn) {
        browseFileBtn.addEventListener('click', () => fileInputEncrypt.click());
    }
    
    if (fileInputEncrypt) {
        fileInputEncrypt.addEventListener('change', function() {
            if (this.files.length > 0) {
                selectedFile = this.files[0];
                document.getElementById('filename').textContent = selectedFile.name;
                UIHelper.showElement('selected-file');
                document.getElementById('encrypt-file-btn').disabled = false;
            }
        });
    }

    // File selection for decryption
    const browseEncryptedBtn = document.getElementById('browse-encrypted');
    const fileInputDecrypt = document.getElementById('file-to-decrypt');
    let selectedEncryptedFile = null;
    
    if (browseEncryptedBtn) {
        browseEncryptedBtn.addEventListener('click', () => fileInputDecrypt.click());
    }
    
    if (fileInputDecrypt) {
        fileInputDecrypt.addEventListener('change', function() {
            if (this.files.length > 0) {
                selectedEncryptedFile = this.files[0];
                document.getElementById('encrypted-filename-display').textContent = selectedEncryptedFile.name;
                UIHelper.showElement('selected-encrypted');
                document.getElementById('decrypt-file-btn').disabled = false;
            }
        });
    }

    // Encrypt file
    const encryptFileBtn = document.getElementById('encrypt-file-btn');
    if (encryptFileBtn) {
        encryptFileBtn.addEventListener('click', async function() {
            if (!selectedFile) {
                UIHelper.showToast('Please select a file first', 'error');
                return;
            }
            
            const password = document.getElementById('file-password').value;
            if (!password) {
                UIHelper.showToast('Please enter encryption password', 'error');
                return;
            }
            
            UIHelper.showLoading('encrypt-file-btn');
            
            try {
                const result = await SecureFlowAPI.encryptFile(selectedFile, password);
                
                document.getElementById('encrypted-filename').textContent = result.encrypted_filename;
                document.getElementById('file-salt').value = result.metadata.salt;
                
                // Setup download button
                document.getElementById('download-encrypted').onclick = () => {
                    SecureFlowAPI.downloadEncryptedFile(result.encrypted_filename);
                };
                
                UIHelper.showElement('file-encryption-results');
                UIHelper.showToast('File encrypted successfully!', 'success');
                
            } catch (error) {
                UIHelper.showToast('File encryption failed: ' + error.message, 'error');
            } finally {
                UIHelper.hideLoading('encrypt-file-btn');
            }
        });
    }

    // Decrypt file
    const decryptFileBtn = document.getElementById('decrypt-file-btn');
    if (decryptFileBtn) {
        decryptFileBtn.addEventListener('click', async function() {
            if (!selectedEncryptedFile) {
                UIHelper.showToast('Please select an encrypted file', 'error');
                return;
            }
            
            const password = document.getElementById('decrypt-file-password').value;
            if (!password) {
                UIHelper.showToast('Please enter decryption password', 'error');
                return;
            }
            
            UIHelper.showLoading('decrypt-file-btn');
            
            try {
                const result = await SecureFlowAPI.decryptFile(selectedEncryptedFile, password);
                
                document.getElementById('original-filename').textContent = result.original_filename;
                
                // Setup download button
                document.getElementById('download-decrypted').onclick = () => {
                    SecureFlowAPI.downloadDecryptedFile(result.original_filename);
                };
                
                UIHelper.showElement('file-decryption-results');
                UIHelper.showToast('File decrypted successfully!', 'success');
                
            } catch (error) {
                UIHelper.showToast('File decryption failed: ' + error.message, 'error');
            } finally {
                UIHelper.hideLoading('decrypt-file-btn');
            }
        });
    }

    // ========== NETWORK VIEW TAB ==========
    
    // Network demo buttons
    const showInsecureBtn = document.getElementById('show-insecure');
    if (showInsecureBtn) {
        showInsecureBtn.addEventListener('click', function() {
            const demoText = document.getElementById('network-demo-input').value;
            document.getElementById('attack-view-text').textContent = demoText.substring(0, 50);
            UIHelper.showToast('Showing insecure transmission - Data is visible!', 'error');
        });
    }

    const showSecureBtn = document.getElementById('show-secure');
    if (showSecureBtn) {
        showSecureBtn.addEventListener('click', async function() {
            const demoText = document.getElementById('network-demo-input').value;
            
            // Generate a random encrypted string for demo
            const randomEncrypted = btoa(demoText).substring(0, 30) + '...';
            document.getElementById('secure-attack-view').textContent = randomEncrypted;
            
            UIHelper.showToast('Showing secure transmission - Data is encrypted!', 'success');
        });
    }

    // ========== IMAGE ENCRYPTION TAB ==========
    
    // Variables to hold selected files
    let selectedImage = null;
    let selectedEncryptedImage = null;
    
    // Image selection for encryption
    const browseImageBtn = document.getElementById('browse-image');
    const imageInputEncrypt = document.getElementById('image-to-encrypt');
    
    if (browseImageBtn) {
        browseImageBtn.addEventListener('click', () => imageInputEncrypt.click());
    }
    
    if (imageInputEncrypt) {
        imageInputEncrypt.addEventListener('change', function() {
            if (this.files.length > 0) {
                selectedImage = this.files[0];
                
                // Validate file type
                const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
                if (!validTypes.includes(selectedImage.type)) {
                    UIHelper.showToast('Please select a PNG or JPG image', 'error');
                    this.value = '';
                    return;
                }
                
                // Validate file size (10MB)
                if (selectedImage.size > 10 * 1024 * 1024) {
                    UIHelper.showToast('Image too large. Max 10MB', 'error');
                    this.value = '';
                    return;
                }
                
                // Update UI
                document.getElementById('image-filename').textContent = selectedImage.name;
                UIHelper.showElement('selected-image-info');
                document.getElementById('encrypt-image-btn').disabled = false;
                
                // Show preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewImg = document.getElementById('original-image-preview');
                    previewImg.src = e.target.result;
                    UIHelper.showElement('original-image-preview-container');
                    
                    // Update image info
                    document.getElementById('image-info').textContent = 
                        `${selectedImage.name} (${Math.round(selectedImage.size / 1024)} KB)`;
                };
                reader.readAsDataURL(selectedImage);
                
                UIHelper.showToast('Image selected. Ready for encryption.', 'success');
            }
        });
    }
    
    // Encrypted image selection for decryption
    const browseEncryptedImageBtn = document.getElementById('browse-encrypted-image');
    const encryptedImageInput = document.getElementById('encrypted-image-to-decrypt');
    
    if (browseEncryptedImageBtn) {
        browseEncryptedImageBtn.addEventListener('click', () => encryptedImageInput.click());
    }
    
    if (encryptedImageInput) {
        encryptedImageInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                selectedEncryptedImage = this.files[0];
                
                // Validate it's a .enc file
                if (!selectedEncryptedImage.name.endsWith('.enc')) {
                    UIHelper.showToast('Please select a .enc file', 'error');
                    this.value = '';
                    return;
                }
                
                // Update UI
                document.getElementById('encrypted-image-filename-display').textContent = selectedEncryptedImage.name;
                UIHelper.showElement('selected-encrypted-image-info');
                document.getElementById('decrypt-image-btn').disabled = false;
                
                UIHelper.showToast('Encrypted file selected. Ready for decryption.', 'info');
            }
        });
    }
    
    // Encrypt Image Button
    const encryptImageBtn = document.getElementById('encrypt-image-btn');
    if (encryptImageBtn) {
        encryptImageBtn.addEventListener('click', async function() {
            if (!selectedImage) {
                UIHelper.showToast('Please select an image first', 'error');
                return;
            }
            
            const password = document.getElementById('image-password').value;
            if (!password) {
                UIHelper.showToast('Please enter encryption password', 'error');
                return;
            }
            
            UIHelper.showLoading('encrypt-image-btn');
            
            try {
                const formData = new FormData();
                formData.append('file', selectedImage);
                formData.append('password', password);
                
                const response = await fetch(`${API_BASE_URL}/encrypt-image`, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || 'Encryption failed');
                }
                
                // Update UI with results
                document.getElementById('encrypted-image-filename').textContent = result.encrypted_filename;
                document.getElementById('original-format').textContent = result.original_format;
                document.getElementById('original-size').textContent = `${Math.round(result.original_size / 1024)} KB`;
                document.getElementById('encrypted-size').textContent = `${Math.round(result.encrypted_size / 1024)} KB`;
                
                // Setup download button
                document.getElementById('download-encrypted-image').onclick = () => {
                    SecureFlowAPI.downloadEncryptedFile(result.encrypted_filename);
                };
                
                UIHelper.showElement('image-encryption-results');
                UIHelper.showToast('Image encrypted successfully!', 'success');
                
            } catch (error) {
                UIHelper.showToast('Image encryption failed: ' + error.message, 'error');
            } finally {
                UIHelper.hideLoading('encrypt-image-btn');
            }
        });
    }
    
    // Decrypt Image Button
    const decryptImageBtn = document.getElementById('decrypt-image-btn');
    if (decryptImageBtn) {
        decryptImageBtn.addEventListener('click', async function() {
            if (!selectedEncryptedImage) {
                UIHelper.showToast('Please select an encrypted file', 'error');
                return;
            }
            
            const password = document.getElementById('decrypt-image-password').value;
            if (!password) {
                UIHelper.showToast('Please enter decryption password', 'error');
                return;
            }
            
            UIHelper.showLoading('decrypt-image-btn');
            UIHelper.hideElement('image-decryption-error');
            
            try {
                const formData = new FormData();
                formData.append('file', selectedEncryptedImage);
                formData.append('password', password);
                
                const response = await fetch(`${API_BASE_URL}/decrypt-image`, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || 'Decryption failed');
                }
                
                if (!result.is_image) {
                    // File decrypted but not an image
                    UIHelper.showToast('File decrypted but not an image', 'warning');
                    
                    // Still show download option
                    document.getElementById('restored-image-filename').textContent = result.original_filename;
                    document.getElementById('download-decrypted-image').onclick = () => {
                        SecureFlowAPI.downloadDecryptedFile(result.original_filename);
                    };
                    UIHelper.showElement('image-decryption-results');
                    
                    // Hide preview
                    document.getElementById('decrypted-image-preview').style.display = 'none';
                    document.getElementById('decrypted-image-info').textContent = 
                        'Decrypted file is not an image format';
                    
                } else {
                    // Successfully decrypted image
                    // Show preview
                    const previewImg = document.getElementById('decrypted-image-preview');
                    previewImg.src = result.preview_data;
                    previewImg.style.display = 'block';
                    
                    // Update info
                    document.getElementById('decrypted-image-info').textContent = 
                        `${result.original_filename} (${Math.round(result.image_size / 1024)} KB)`;
                    
                    document.getElementById('restored-image-filename').textContent = result.original_filename;
                    
                    // Setup download button
                    document.getElementById('download-decrypted-image').onclick = () => {
                        SecureFlowAPI.downloadDecryptedFile(result.original_filename);
                    };
                    
                    UIHelper.showElement('image-decryption-results');
                    UIHelper.showToast('Image decrypted successfully!', 'success');
                }
                
            } catch (error) {
                // Show error message
                document.getElementById('decryption-error-message').textContent = error.message;
                UIHelper.showElement('image-decryption-error');
                UIHelper.showToast('Decryption failed: ' + error.message, 'error');
            } finally {
                UIHelper.hideLoading('decrypt-image-btn');
            }
        });
    }

    // Initialize some demo data
    initializeDemoData();
});

function initializeDemoData() {
    // Pre-fill some fields with demo data
    const demoRSAKeys = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzJjy7c7cNpL6Yh9K1Qx4
dN3eG5XqK8vL9mWjHnQlZbJvM8pLwYkRq4sTtUvXyD7nWzZqP9Km8sT3
-----END PUBLIC KEY-----`;
    
    // Set initial RSA public key for demo
    const rsaPublicInput = document.getElementById('rsa-public-key-input');
    if (rsaPublicInput && !rsaPublicInput.value) {
        rsaPublicInput.value = demoRSAKeys;
    }
}