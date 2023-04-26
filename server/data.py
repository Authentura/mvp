"""
This file handles data collection about usage

It is responsible for both collecting data that we could mine for training/QA and 
for ensuring users don't step over certain limits that we may impose on their profiles
"""
import time
import sqlite3


def save_request(username: str, model: str, prompt: str, completion: str) -> None:
    """ Save a request for data mining """
    conn = sqlite3.connect("./database.db")
    conn.execute(
            "INSERT INTO diagnostics (username, model, prompt, completion, date) VALUES (?, ?, ?, ?, ?)",
            (username, model, prompt, completion, int(time.time()))
        )
    conn.commit()