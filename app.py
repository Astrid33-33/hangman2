import random
import string

from flask import Flask, jsonify, render_template, request, session

from words import WORDS

app = Flask(__name__)
app.secret_key = "hangman-dev-secret"  # fine for local play, not for production

MAX_WRONG = 8


def new_game_state():
    secret_word = random.choice(WORDS).upper()
    return {
        "secret_word": secret_word,
        "guessed": [],
        "wrong_count": 0,
    }


def public_state(state):
    secret_word = state["secret_word"]
    guessed = state["guessed"]
    wrong_count = state["wrong_count"]

    won = all(letter in guessed for letter in secret_word)
    lost = wrong_count >= MAX_WRONG
    status = "won" if won else "lost" if lost else "playing"

    display = [letter if letter in guessed else "" for letter in secret_word]

    return {
        "display": display,
        "guessed": guessed,
        "wrong_count": wrong_count,
        "max_wrong": MAX_WRONG,
        "status": status,
        "secret_word": secret_word if status != "playing" else None,
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/new", methods=["POST"])
def api_new():
    session["state"] = new_game_state()
    return jsonify(public_state(session["state"]))


@app.route("/api/guess", methods=["POST"])
def api_guess():
    state = session.get("state")
    if state is None:
        state = new_game_state()
        session["state"] = state

    result = public_state(state)
    if result["status"] != "playing":
        return jsonify(result)

    letter = (request.json or {}).get("letter", "").upper()
    if len(letter) != 1 or letter not in string.ascii_uppercase:
        return jsonify(result), 400

    if letter not in state["guessed"]:
        state["guessed"].append(letter)
        if letter not in state["secret_word"]:
            state["wrong_count"] += 1
        session["state"] = state

    return jsonify(public_state(state))


if __name__ == "__main__":
    app.run(debug=True, port=5001)
