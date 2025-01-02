import json
import requests
import uuid
import time
import base64
import hmac
import hashlib
from bluetooth.ble import GATTRequester
from contextlib import contextmanager

TOYU_DEVICE_ID = "F51B1AAEF0FE"
TOYU_MAC_ADDRESS = "F5:1B:1A:AE:F0:FE"


@contextmanager
def connect(device: str, bt_interface: str = None, timeout: float = 5.0):
    if bt_interface:
        req = GATTRequester(device, False, bt_interface)
    else:
        req = GATTRequester(device, False)

    req.connect(False, "random")
    connect_start_time = time.time()

    while not req.is_connected():
        if time.time() - connect_start_time >= timeout:
            raise ConnectionError(
                "Connection to {} timed out after {} seconds".format(device, timeout)
            )
        time.sleep(0.1)

    yield req

    if req.is_connected():
        req.disconnect()


def create_header():
    with open("credentials/aigrid/switch_bot.json", "r") as f:
        config = json.load(f)
    token = config["ACCESS_TOKEN"]
    secret = config["SECRET_TOKEN"]
    nonce = uuid.uuid4()
    timestamp = int(round(time.time() * 1000))
    string_to_sign = f"{token}{timestamp}{nonce}"

    signature = base64.b64encode(
        hmac.new(
            secret.encode(), msg=string_to_sign.encode(), digestmod=hashlib.sha256
        ).digest()
    ).decode()
    return {
        "Authorization": token,
        "Content-Type": "application/json",
        "charset": "utf8",
        "t": str(timestamp),
        "sign": signature,
        "nonce": str(nonce),
    }


def get_devices():
    url = "https://api.switch-bot.com/v1.1/devices"
    response = requests.get(url, headers=create_header())
    if response.status_code == 200:
        return response.json()
    else:
        return f"Error: {response.status_code}, {response.json()}"


def switch_toyu():
    """Switch toyu using BLE connection via bluetooth library"""
    try:
        with connect(TOYU_MAC_ADDRESS) as req:
            # Command to turn on (0x57 0x01 0x01)
            command = b"\x57\x01\x01"
            # Handle 0x16 is for press/on/off commands
            req.write_by_handle(0x16, command)
            return True

    except Exception as e:
        print(f"Failed to control SwitchBot: {str(e)}")
        return False
