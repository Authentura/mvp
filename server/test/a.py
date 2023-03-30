import sys
import requests


s = requests.session()


res = s.post("http://localhost:3000/login",
             json={"username": "admin", "password": "admin"})


print(res.text)


with open(sys.argv[1], "r")as infile:
    code = infile.read()

data = {
    "username": "admin",
    "code": code
}


res = s.post("http://localhost:3000/check/3", json=data)

print(res.text.replace("\\n", "\n").strip().strip('"'))
