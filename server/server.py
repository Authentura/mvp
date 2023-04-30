import api
import data
import auth
import database

from flask import Flask
from flask import request
from flask import make_response
from flask import render_template
from flask_restful import Api, Resource

from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
restful = Api(app)


class GPTClassify(Resource):
    """ Using the GPT model to find and classify vulnerabilities """
    @staticmethod
    def post(model):
        """ Send code to get checked by GPT """

        cookie: str = request.cookies.get("token")
        username: str = request.get_json().get("username")

        if not auth.check_cookie(username, cookie):
            return "This method is only available to authenticated users", 403

        # NOTE: To simplify things down, only the simplified models are allowed here
        #       and not the ones that actually explain code
        if model not in [
                'curie:ft-personal-2023-04-08-19-01-16',
                'curie:ft-personal-2023-04-12-13-08-55', # current
            ]:
            return "Invalid model", 400

        code: str = request.get_json().get("code")
        if code is None:
            return "No code supplied", 400

        response, status = api.make_request_classify(model, code, username)
        # return json if the response is correct
        if status == 200:
            res = make_response(response)
            res.content_type = "Application/json"
            return res

        # if there is an error then just return straight this
        return response, status


class GPTExplain(Resource):
    """ USE GPT to explain vulnerabilities we found """
    @staticmethod
    def post(model):
        """ Get an explanation """
        # auth
        cookie: str = request.cookies.get("token")
        username: str = request.get_json().get("username")
        if not auth.check_cookie(username, cookie):
            return "This method is only available to authenticated users", 403

        if model not in [
            "curie",
            "text-davinci-003"
            ]:
            return "Invalid model", 400

        code: str = request.get_json().get("code")
        line: int = request.get_json().get("line")
        title: str = request.get_json().get("title")

        if None in [code, line, title]:
            return "No code (`code` str), vulnerability title (`title` str),"\
                   " or line number (`line` int) provided.", 400

        response, status = api.make_request_explain(model, code, line, title, username)


    


class Auth(Resource):
    """ Some methods relating to authentication """
    @staticmethod
    def post():
        """ login """

        username: str = request.get_json().get("username")
        password: str = request.get_json().get("password")

        if username is None or password is None:
            return "No username or password supplied", 400

        token, success = auth.authenticate(username, password)
        if success != 200:
            return "Invalid username or password", 403

        res = make_response("OK")
        res.status_code = 200
        res.set_cookie("token", token)

        return res



class Register(Resource):
    """ Provided a link with a one-time use token, this allows users to register """
    @staticmethod
    def get(token: str):
        """ A simple web page allowing the user to register to the app """
        
        if token is None or len(token) == 0:
            return "You can only register with an invite link", 400
        
        if not auth.validate_register_token(token):
            return "This token is not valid or has alredy been used", 400
        
        res = make_response(render_template("register.html"))
        res.status_code = 200
        res.content_type = "Text/HTML"
        return res
    

    @staticmethod
    def post(token: str):
        """ Allow the user to register if they have a valid token """
        
        if token is None or len(token) == 0:
            return "You can only register with an invite link", 400
        
        username: str = request.form.get("username")
        password: str = request.form.get("password")

        if username is None or password is None:
            return "No username or password supplied", 400
        
        res, status = auth.register_and_use_token(token, username, password)
        if status != 200:
            return res, status
        
        return auth.authenticate(username, password)
        
        
        



restful.add_resource(Auth, "/login")
restful.add_resource(Register, "/register/<token>")
restful.add_resource(GPTExplain, "/explain/<model>")
restful.add_resource(GPTClassify, "/classify/<model>")

api.setup()
database.setup()

if __name__ == "__main__":
    app.run(debug=True, port=3000, host="0.0.0.0")