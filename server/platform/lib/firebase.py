import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("credentials/aigrid/sa.json")
firebase_admin.initialize_app(cred)

db = firestore.client()
