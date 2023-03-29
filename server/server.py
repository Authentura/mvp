import api
import auth
from flask import Flask, request, make_response
from flask_restful import Api, Resource


app = Flask(__name__)
restful = Api(app)


class CheckCode(Resource):
    """ Methods relating to checking code """
    @staticmethod
    def post(model):
        """ Send code to get checked by GPT """

        cookie: str = request.cookies.get("token")
        username: str = request.get_json().get("username")

        if not auth.check_cookie(username, cookie):
            return "This method is only available to authenticated users", 403

        if model not in ['2', '3', '4']:
            return "Invalid model", 400

        code: str = request.get_json().get("code")
        if code is None:
            return "No code supplied", 400

        return api.make_request(model, code)


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
        if not success:
            return "Invalid username or password", 403

        res = make_response("OK")
        res.status_code = 200
        res.set_cookie("token", token)

        return res


restful.add_resource(Auth, "/login")
restful.add_resource(CheckCode, "/check/<model>")


if __name__ == "__main__":
    app.run(debug=True, port=3000, host="0.0.0.0")
