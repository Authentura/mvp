import api
import auth
from flask import Flask, request, make_response
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

        response, status = api.make_request(model, code)
        # return json if the response is correct
        if status == 200:
            res = make_response(response)
            res.content_type = "Application/json"
            return res

        # if there is an error then just return straight this
        return response, status


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
restful.add_resource(GPTClassify, "/classify/<model>")


if __name__ == "__main__":
    api.setup()
    auth.setup()

    app.run(debug=True, port=3000, host="0.0.0.0")