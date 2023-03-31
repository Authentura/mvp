from flask import Flask, request, render_template_string
import sqlite3

app = Flask(__name__)

@app.route('/search', methods=['GET', 'POST'])
def search():
    if request.method == 'POST':
        username = request.form.get('username')
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        query = f"SELECT * FROM users WHERE username='{username}'"
        cursor.execute(query)
        results = cursor.fetchall()
        return render_template_string('<ul>{% for result in results %}<li>{{ result }}</li>{% endfor %}</ul>', results=results)
    else:
        return render_template_string('''
        <form method="POST">
            <label for="username">Username:</label>
            <input type="text" name="username">
            <button type="submit">Search</button>
        </form>
        ''')

if __name__ == '__main__':
    app.run()
