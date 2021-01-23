import os
from typing import List

from flask import send_file

ALLOWED_EXTENSIONS = ['png', "gif", "jpg", "jpeg "]


def find_file(path: str, filename: str, allowed_extensions: List[str]) -> str:
    for root, dirs, files in os.walk(path):
        for _file in files:
            if _file.startswith(filename) and _file.split('.')[-1] in allowed_extensions:
                return _file


def get_image(path: str, image_name: str):
    filename = find_file(path, image_name, ALLOWED_EXTENSIONS)
    if filename:
        ext = filename.split('.')[-1]
        return send_file(path+filename, mimetype='image/' + ext)
    else:
        raise ValueError(f"No file with given name: {path}{image_name}")
