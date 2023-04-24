import api
import auth
from flask import Flask, request, make_response
from flask_restful import Api, Resource
from dotenv import load_dotenv

load_dotenv()

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

        # text-davinci is gpt3, curie is the cheap fine-tuned and davinci is the expensive one.
        # NOTE: In future versions we will not allow the users to choose. I am only keeping the old
        #            ones here as Sam won't be able to use the custom ones atm.
        if model not in [
                'text-davinci-003',
                'davinci:ft-personal-2023-04-08-13-10-24',
                'curie:ft-personal-2023-04-08-19-01-16',
                'curie:ft-personal-2023-04-08-19-01-16',
                'curie:ft-personal-2023-04-12-13-08-55', # current
            ]:
            return "Invalid model", 400

        code: str = request.get_json().get("code")
        if code is None:
            return "No code supplied", 400

        response, status = api.make_request(model, code)
        print('response: ',response , type(response))
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
restful.add_resource(CheckCode, "/check/<model>")


if __name__ == "__main__":
    api.setup()
    auth.setup()

    app.run(debug=True, port=3000, host="0.0.0.0")