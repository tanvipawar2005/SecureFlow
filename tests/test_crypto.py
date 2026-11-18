import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from crypto_utils import AES256Encryptor
from file_crypto import FileEncryptor

class FernetTests(unittest.TestCase):
    def test_text_round_trip(self):
        result = AES256Encryptor.encrypt_text("Sample message", "demo-password")
        self.assertEqual(AES256Encryptor.decrypt_text(result["encrypted"], "demo-password", result["salt"]), "Sample message")
        with self.assertRaises(Exception):
            AES256Encryptor.decrypt_text(result["encrypted"], "wrong", result["salt"])
    def test_file_round_trip(self):
        with TemporaryDirectory() as root:
            p = Path(root) / "sample.bin"
            p.write_bytes(bytes(range(256)))
            result = FileEncryptor.encrypt_file(str(p), "demo-password", str(Path(root)/"enc"))
            self.assertTrue(result["success"])
            restored = FileEncryptor.decrypt_file(result["encrypted_path"], "demo-password", str(Path(root)/"dec"))
            self.assertTrue(restored["success"])
            self.assertEqual(Path(restored["decrypted_path"]).read_bytes(), p.read_bytes())

class RSATests(unittest.TestCase):
    def test_round_trip(self):
        from rsa_utils import RSAEncryptor
        keys = RSAEncryptor.generate_key_pair()
        encrypted = RSAEncryptor.encrypt_with_public_key("sample", keys["public_key"])
        self.assertEqual(RSAEncryptor.decrypt_with_private_key(encrypted, keys["private_key"]), "sample")
