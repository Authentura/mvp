import os
import time
import uuid
import string
import bcrypt
import sqlite3
import database




def authenticate(username: str, password: str) -> tuple:#[str, bool]: 
    """ Check the login and return a token """

    conn = sqlite3.connect("./database.db")
    cursor = conn.execute(
        "SELECT password FROM auth WHERE username=?", (username,))

    data = cursor.fetchall()

    if len(data) < 1:
        return "No such user", 403

    stored_pass: str = data[0][0]

    if not bcrypt.checkpw(password.encode("utf-8"), stored_pass.encode("utf-8")):
        return "Invalid username or password", 403

    token: str = str(uuid.uuid4())
    expires: int = int(time.time()) + 60*60*24*30  # about one month

    conn.execute("INSERT INTO cookies (username, cookie, expires) VALUES (?, ?, ?)",
                 (username, token, expires))
    conn.commit()

    return token, 200


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
    

def validate_register_token(token: str) -> bool:
    """ Check if a register token is valid """
    conn = sqlite3.connect("./database.db")
    cursor = conn.execute(
        "SELECT * FROM tokens where token=?",
        (token,)
    )
    data = cursor.fetchall()

    if len(data) < 1:
        return False

    return True


def register_and_use_token(token: str, username: str, password: str) -> tuple:
    """ Delete register token and add the user """
    conn = sqlite3.connect("./database.db")
    
    if not isinstance(username, str) or len(username) < 1:
        return "no, or invalid username supplied", 400
        
    for character in username:
        if character not in string.ascii_letters + string.digits:
            return "Username can only contain letters and numbers", 400
    
    if not isinstance(password, str) or len(password) < 9:
        return "Password must be at least 10 characters", 400

    password = bcrypt.hashpw(password.encode(
        "utf-8"), bcrypt.gensalt()).decode("utf-8")

    # Checked here to avoid race conditions while hashing the password
    if not validate_register_token(token):
        return "This token is not valid or has alredy been used", 400
    
    conn.execute(
        "DELETE FROM tokens where token=?",
        (token,)
    )
    
    cursor = conn.execute("SELECT * FROM auth WHERE username=?", (username,))
    if len(cursor.fetchall()) > 0:
        return "A user by this username already exists", 400
    

    conn.execute(
        "INSERT INTO auth (username, password) VALUES (?, ?)",
        (username, password)
    )
    
    # only commit the changes if it worked without errors
    conn.commit()
    return "", 200




if __name__ == "__main__":
    database.setup()

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