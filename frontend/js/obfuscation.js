/**
 * INSECURE Obfuscation Functions
 * WARNING: These provide NO real security!
 * Only for educational demonstration.
 */

class InsecureObfuscation {
    static caesarCipher(text, shift) {
        return text.split('').map(char => {
            if (char.match(/[a-z]/i)) {
                const code = char.charCodeAt(0);
                let base = code >= 65 && code <= 90 ? 65 : 97;
                return String.fromCharCode(((code - base + shift) % 26) + base);
            }
            return char;
        }).join('');
    }

    static reverseText(text) {
        return text.split('').reverse().join('');
    }

    static base64Encode(text) {
        return btoa(text);
    }

    static base64Decode(text) {
        return atob(text);
    }

    static xorCipher(text, key) {
        return text.split('').map((char, index) => {
            return String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length));
        }).join('');
    }

    static scrambleText(text) {
        let chars = text.split('');
        for (let i = chars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [chars[i], chars[j]] = [chars[j], chars[i]];
        }
        return chars.join('');
    }

    static unscrambleText(scrambled, original) {
        // This demonstrates why scrambling is insecure
        // We can't actually unscramble without knowing the original
        // This shows it's a one-way "obfuscation"
        return "Cannot reliably unscramble! This shows the insecurity.";
    }
}

// Export for use in main.js
window.InsecureObfuscation = InsecureObfuscation;