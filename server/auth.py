import os
import time
import uuid
import bcrypt
import sqlite3


def setup():
    """ Make sure the database exists """
    # make sure there is a database
    if not os.path.exists("./database.db"):
        open("./database.db", "w").close()
        conn = sqlite3.connect("./database.db")
        conn.execute(
            "CREATE TABLE auth (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)"
        )

        conn.execute(
            "CREATE TABLE cookies\
                (\
                    id INTEGER PRIMARY KEY AUTOINCREMENT,\
                    username TEXT,\
                    cookie TEXT,\
                    expires INTEGER\
                )"
        )
        conn.commit()

    print("Database already exists!")


def authenticate(username: str, password: str) -> tuple[str, bool]:
    """ Check the login and return a token """

    conn = sqlite3.connect("./database.db")
    cursor = conn.execute(
        "SELECT password FROM auth WHERE username=?", (username,))

    data = cursor.fetchall()

    if len(data) < 1:
        return "No such user", False

    stored_pass: str = data[0][0]

    if not bcrypt.checkpw(password.encode("utf-8"), stored_pass.encode("utf-8")):
        return "Invalid username or password", False

    token: str = str(uuid.uuid4())
    expires: int = int(time.time()) + 60*60*24*30  # about one month

    conn.execute("INSERT INTO cookies (username, cookie, expires) VALUES (?, ?, ?)",
                 (username, token, expires))
    conn.commit()

    return token, True


def check_cookie(username: str, token: str) -> bool:
    """ Check if a cookie exists and hasn't expired """

    conn = sqlite3.connect("./database.db")
    cursor = conn.execute(
        "SELECT * FROM cookies WHERE username=? AND cookie=? AND expires>?",
        (username, token, int(time.time()))
    )
    data = cursor.fetchall()

    if len(data) < 1:
        return False

    return True


if __name__ == "__main__":
    setup()

    print("Adding new user to the database!")
    username = input("username: ")
    password = input("password: ")

    password = bcrypt.hashpw(password.encode(
        "utf-8"), bcrypt.gensalt()).decode("utf-8")

    conn = sqlite3.connect("./database.db")
    conn.execute(
        "INSERT INTO auth (username, password) VALUES (?, ?)", (username, password))
    conn.commit()

    print("User has been added!")
