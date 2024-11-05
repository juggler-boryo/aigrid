from typing import Tuple
from flask import request


def get_token_from_request() -> Tuple[str, bool]:
    """
    Get token from request headers
    """
    token = request.headers.get("Authorization", "")

    if token.startswith("Bearer "):
        token = token[len("Bearer ") :]
        return token, False

    return "", True


def token_required(f):
    """
    Decorator to check if user is authenticated
    """

    # TODO: implement
    pass