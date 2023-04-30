import os
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

        conn.execute(
            "CREATE TABLE diagnostics\
                (\
                    id INTEGER PRIMARY KEY AUTOINCREMENT,\
                    username TEXT,\
                    model TEXT,\
                    prompt TEXT,\
                    completion TEXT,\
                    date INTEGER\
                )"
        )

        conn.execute(
            "CREATE TABLE tokens\
            (\
                    id INTEGER PRIMARY KEY AUTOINCREMENT,\
                    token TEXT\
            )"
        )
        conn.commit()

    print("Database already exists!")