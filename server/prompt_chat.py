


system = "You are to assist an automatic vulnerability scanner with explanations of why code is vulnerable. "\
         "The user will provide you with a code snippet, along with the vulnerable line number and a vulnerability name. "\
         "Your job is to explain why it is vulnerable, and suggest alternative code to avoid the vulnerability. "\
         "Keep your answers as short as reasonable."



user1 = """
```
    1| @pp.route('/search', methods=['GET', 'POST'])
    2| def search():
    3|     if request.method == 'POST':
    4|         username = request.form.get('username')
    5|         conn = sqlite3.connect('users.db')
    6|         cursor = conn.cursor()
    7|         query = f"SELECT * FROM users WHERE username='{username}'"
    8|         cursor.execute(query)
    9|         results = cursor.fetchall()
   10|         return render_template_string('<ul>{% for result in results %}<li>{{ result }}</li>{% endfor %}</ul>', results=results)
   11|     else:
   12|         return render_template_string('''
   13|         <form method="POST">
   14|             <label for="username">Username:</label>
   15|             <input type="text" name="username">
   16|             <button type="submit">Search</button>
   17|         </form>
   18|         '''
   19|

```
Line 7, SQL injection
""".strip().strip("\n")
                                             
assistant1 = """
The code is vulnerable to SQL injection as the value of the `username` variable is directly concatenated into the SQL query string, which allows an attacker to manipulate the query and potentially perform malicious actions on the database.

To prevent SQL injection, it is recommended to use parameterized queries or prepared statements. This involves using placeholders in the query string and passing the user input as separate parameters to the execute function. Here's an example of how to modify the code to use parameterized queries:

```
query = "SELECT * FROM users WHERE username=?"
cursor.execute(query, (username,))
```

By using parameterized queries, the input value is properly escaped and treated as data rather than executable code, reducing the risk of SQL injection.
""".strip().strip("\n")
                                             

user2 = """
 ```
    1| package com.example.springxss;
    2|
    3| import org.springframework.http.HttpStatus;
    4| import org.springframework.http.MediaType;
    5| import org.springframework.http.ResponseEntity;
    6| import org.springframework.stereotype.Controller;
    7| import org.springframework.web.bind.annotation.GetMapping;
    8| import org.springframework.web.bind.annotation.RequestParam;
    9| import org.springframework.web.bind.annotation.RestController;
   10|
   11| @RestController
   12| public class XSSController {
   13|
   14|     @GetMapping("/hello")
   15|     ResponseEntity<String> hello(@RequestParam(value = "name", defaultValue = "World") String name) {
   16|         return new ResponseEntity<>("Hello World!" + name, HttpStatus.OK);
   17|     }
   18|
   19| }
   20|

```
Line 16, Potential cross site scripting (
""".strip().strip("\n")

assistant2 = """
The code is potentially vulnerable to cross-site scripting (XSS) attacks because the `name` parameter is directly concatenated into the response string without any sanitization or encoding.

To prevent XSS attacks, it's important to properly sanitize user input before including it in any output context. In this case, you can use HTML escaping to ensure that any special characters are converted to their HTML entities. You can do this by using the appropriate method provided by the framework.

Here's an example of how to modify the code to prevent XSS attacks:

```java
import org.springframework.web.util.HtmlUtils;

@RestController
public class XSSController {

   @GetMapping("/hello")
   ResponseEntity<String> hello(@RequestParam(value = "name", defaultValue = "World") String name) {
       String sanitizedInput = HtmlUtils.htmlEscape(name);
       return new ResponseEntity<>("Hello World!" + sanitizedInput, HttpStatus.OK);
   }

}
```

By using `HtmlUtils.htmlEscape()` to sanitize the `name` parameter, any potentially malicious HTML characters are properly encoded, mitigating the risk of XSS attacks.
""".strip().strip("\n")


def generate_prompt(code: str, line: int, title: str) -> list[dict]:
    user3 = f"```\n{code}\n```\n"\
            f"Line {line}, {title}"
    


    return  [
        {
            "role": "system",
            "content": system
        },
        {
            "role": "user",
            "content": user1
        },
        {
            "role": "assistant",
            "content": assistant1
        },
        {
            "role": "user",
            "content": user2
        },
        {
            "role": "assistant",
            "content": assistant2
        },
        {
            "role": "user",
            "content": user3
        }
    ]
    
