import json
import requests
import uuid
import time
from bluepy import btle
import base64
import hmac
import hashlib

TOYU_DEVICE_ID = "F51B1AAEF0FE"
TOYU_MAC_ADDRESS = "F5:1B:1A:AE:F0:FE"


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


# def switch_toyu():
#     url = f"https://api.switch-bot.com/v1.1/devices/{TOYU_DEVICE_ID}/commands"
#     response = requests.post(url, headers=create_header(), json={"command": "turnOn"})
#     return response


def switch_toyu():
    """Switch toyu using BLE connection via bluepy"""

    try:
        # Connect to the SwitchBot device
        peripheral = btle.Peripheral(TOYU_MAC_ADDRESS, addrType=btle.ADDR_TYPE_RANDOM)

        # These UUIDs are standard SwitchBot BLE service/characteristic IDs
        # Service UUID: cba20d00-224d-11e6-9fb8-0002a5d5c51b (SwitchBot service)
        # Characteristic UUID: cba20002-224d-11e6-9fb8-0002a5d5c51b (Write commands)
        # These values are fixed and documented in SwitchBot's BLE protocol spec
        service = peripheral.getServiceByUUID("cba20d00-224d-11e6-9fb8-0002a5d5c51b")
        characteristic = service.getCharacteristics(
            "cba20002-224d-11e6-9fb8-0002a5d5c51b"
        )[0]

        # Command to turn on (0x57 0x01 0x01)
        command = bytes([0x57, 0x01, 0x01])
        characteristic.write(command)

        peripheral.disconnect()
        return True

    except Exception as e:
        print(f"Failed to control SwitchBot: {str(e)}")
        return False
