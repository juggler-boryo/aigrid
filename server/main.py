import os
import logging
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


@app.route("/")
def hello():
    return "Hello, World!"


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    logger.info("server running on port: %d", port)
    app.run(host="0.0.0.0", port=port)
