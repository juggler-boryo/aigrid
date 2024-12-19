import firebase_admin
from firebase_admin import credentials, db
import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

is_initialized_dict = {}


def initialize_firebase():
    cred = credentials.Certificate("credentials/aigrid/sa.json")
    firebase_admin.initialize_app(
        cred,
        {
            "databaseURL": "https://aigrid-23256-default-rtdb.asia-southeast1.firebasedatabase.app"
        },
    )


# TODO: refac
def trigger_toyu():
    print("triggering toyu")
    try:
        response = requests.get("http://192.168.2.127:28001/")
        print(response.text)
        if response.status_code != 200:
            logger.error(f"Unexpected status code: {response.status_code}")
            return False
        return True
    except requests.RequestException as e:
        logger.error(f"Error making HTTP request: {e}")
        return False


# TODO: refac
def handle_toyu_update(event):
    """Handle updates to the /home/toyu path"""
    logger.info(f"Toyu update received: {event.data}")
    if event.data:
        if not is_initialized_dict.get("toyu"):
            is_initialized_dict["toyu"] = True
            return
        trigger_toyu()


def main():
    try:
        initialize_firebase()

        # toyu
        toyu_ref = db.reference("home/toyu")
        toyu_ref.listen(handle_toyu_update)

        # start listening
        logger.info("Listening for Firebase updates...")
        while True:
            pass

    except Exception as e:
        logger.error(f"Error in main: {e}")
        toyu_ref.unlisten()
        raise


if __name__ == "__main__":
    main()
