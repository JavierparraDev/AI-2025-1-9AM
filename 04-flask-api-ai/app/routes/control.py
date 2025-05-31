from flask import Blueprint, jsonify

control = Blueprint('control', __name__)

@control.route('/status', methods=['GET'])
def get_status():
    return jsonify({"status": "running"})