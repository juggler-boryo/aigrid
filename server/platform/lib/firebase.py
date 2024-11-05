from typing import Optional
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("credentials/aigrid/sa.json")
firebase_admin.initialize_app(cred)

db = firestore.client()


def create_user(uid: str) -> None:
    db.collection("users").document(uid).set({})

def get_user(uid: str) -> Optional[dict]:
    user = db.collection("users").document(uid).get()
    if user.exists:
        return user.to_dict()
    return None
