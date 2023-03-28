import os
import json
import openai

def setup():
    """ Run some things that are globally needed """

    key: str = os.environ.get("OPENAI_KEY")
    print('key: ',key , type(key))
    assert key is not None, "No openAI api key is present. Please set env 'OPENAI_KEY'"

    openai.api_key = key




def get_prompt() -> str:
    """
        Get the prompt.
        It is in its own function as if it causes performance
        issues we will have to move it to a "setup" function
        that only gets called when the service runs.
    """

    with open("./prompt.txt", "r", encoding="utf-8") as infile:
        prompt = infile.read()

    return prompt.strip("\n")



def generate_response(prompt, model) -> str:
    """ Get the response from openai """
    if model == "text-davinci-4":
        response = openai.Completion.create(
            engine=model,
            prompt=prompt,
        )
    else:
        response = openai.Completion.create(
            engine=model,
            prompt=prompt,
            max_tokens=2048,
            n=1,
            stop=None,
            temperature=0,
        )

    return response.choices[0].text.strip()


def make_request(model: str, code: str):
    """ Make a request to the openAI api """

    # get model
    model = f"text-davinci-00{model}"

    # Add line numbers to code
    # GPT cannot count, if we want line numbers we have to add it ourselves
    code_with_numbers = ""
    for i, line in enumerate(code.split("\n")):
        code_with_numbers += f"{i+1:>5}| {line}\n"


    # Get prompt
    prompt = get_prompt()
    prompt = prompt.replace("[CODE]", code_with_numbers)


    # Get response
    response = generate_response(prompt, model)

    return response, 200









# Runs in the beginning of the program
setup()
