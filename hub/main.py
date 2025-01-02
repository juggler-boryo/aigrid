import firebase_admin
from firebase_admin import credentials, db
import requests
import logging
from typing import Dict
import switch_bot

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

print(switch_bot.get_devices())


class DeviceManager:
    def __init__(self):
        self._cached_values: Dict[str, any] = {}
        self._initialized_devices: Dict[str, bool] = {}

    def trigger_device(self, device_name: str) -> bool:
        triggers = {"toyu": self._trigger_toyu}
        trigger_func = triggers.get(device_name)
        if not trigger_func:
            logger.error(f"Unknown device: {device_name}")
            return False
        return trigger_func()

    def _trigger_toyu(self) -> bool:
        logger.info("Triggering toyu")
        try:
            success = switch_bot.switch_toyu()
            if not success:
                logger.error(f"Failed to switch toyu")
                return False
            logger.info(f"Toyu switched")
            return True
        except Exception as e:
            logger.error(f"Error switching toyu: {e}")
            return False

    def handle_device_update(self, device_name: str, event) -> None:
        """Handle updates to device states"""
        logger.info(f"{device_name} update received: {event.data}")

        # 初期化チェック
        if not self._initialized_devices.get(device_name):
            self._initialized_devices[device_name] = True
            self._cached_values[device_name] = event.data
            return

        # 値が変更されたかチェック
        if self._cached_values.get(device_name) == event.data:
            logger.info(f"Skipping {device_name} trigger - value unchanged")
            return

        # 値を更新してトリガー
        self._cached_values[device_name] = event.data
        if event.data:
            self.trigger_device(device_name)


def initialize_firebase():
    cred = credentials.Certificate("credentials/aigrid/sa.json")
    firebase_admin.initialize_app(
        cred,
        {
            "databaseURL": "https://aigrid-23256-default-rtdb.asia-southeast1.firebasedatabase.app"
        },
    )


def main():
    try:
        initialize_firebase()
        device_manager = DeviceManager()

        # デバイスの監視設定
        devices = {
            "toyu": "home/toyu",
            # 新しいデバイスはここに追加
            # "new_device": "home/new_device",
        }

        refs = {}
        for device_name, path in devices.items():
            ref = db.reference(path)
            refs[device_name] = ref
            ref.listen(
                lambda event, d=device_name: device_manager.handle_device_update(
                    d, event
                )
            )

        logger.info("Listening for Firebase updates...")
        while True:
            pass

    except Exception as e:
        logger.error(f"Error in main: {e}")
        for ref in refs.values():
            ref.unlisten()
        raise


if __name__ == "__main__":
    main()
