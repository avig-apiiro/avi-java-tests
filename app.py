from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/user")
def get_user():
    return jsonify({"name": "test"})


if __name__ == "__main__":
    app.run()
