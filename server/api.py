import os
import re
import json
import data
import openai


def setup():
    """ Run some things that are globally needed """

    key: str = os.environ.get("OPENAI_KEY")
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


def format_response(res: str) -> list:#[dict[str,str]]:
    """
        GPT models respond to queries as one long string.
        This function breaks that string into json to make
        it easier to process on the front-end.

        Or in other words: I'm better at writing python than typescript
    """

    issues: list[dict[str,str|int]] = []
    for line in res.split('\n'):
        match = re.search(r' ?\[\d+\]', line)
        if match:
            # Split the line
            line_number = match.group(0)
            rest = line.strip(line_number)

            # Get line number int
            line_number = re.search(r'\d+', line_number)
            line_number = int(line_number.group(0))

            # Get the title and the body
            title = rest.split(':')[0]
            body = ':'.join(rest.split(':')[1:]) + '\n'


            issues.append({
                "line_number": line_number,
                "title": title,
                "body": body,
                })

        else:
            issues[-1]['body'] += line+'\n'

    return {"issues": issues}

def generate_response(prompt, model) -> str:
    """ Get the response from openai """
    response = openai.Completion.create(
        engine=model,
        prompt=prompt,
        max_tokens=10,
        n=1,
        stop="\n###",
        temperature=0,
    )

    return response.choices[0].text.strip()


def make_request_classify(model: str, code: str, username: str) -> tuple:#[dict|int]:
    """ Make a request to our vulnerability classify model """

    # Add line numbers to code
    # GPT cannot count, if we want line numbers we have to add it ourselves
    code_with_numbers = ""
    for i, line in enumerate(code.split("\n")):
        code_with_numbers += f"{i+1:>5}| {line}\n"
    print('code_with_numbers: ',code_with_numbers , type(code_with_numbers))

    prompt = code_with_numbers
    prompt += "\n\n###\n\n"

    # Get response
    response = generate_response(prompt, model)
    print('response: ',response , type(response))
    
    # Save request
    data.save_request(username, model, prompt, response)
    
    if not response.strip().strip().startswith("No"):
        response_json: dict = format_response(response)
    else:
        response_json = {"issues": []}

    return response_json, 200



def make_request_explain(model: str, code: str, line: int, title: str, username: str) -> tuple:#[dict|int]:
    """ Make a request to the openai api to explain a vulnerability """
    # Add line numbers to code
    # GPT cannot count, if we want line numbers we have to add it ourselves
    code_with_numbers = ""
    for i, line in enumerate(code.split("\n")):
        code_with_numbers += f"{i+1:>5}| {line}\n"
    print('code_with_numbers: ',code_with_numbers , type(code_with_numbers))


    with open("./explain/prompt.txt", "r", encoding="utf-8")as infile:
        prompt = infile.read()

    prompt = prompt.replace("[CODE]", code_with_numbers)
    prompt = prompt.replace("[LINE]", str(line))
    prompt = prompt.replace("[TITLE]", title)

    response = generate_response(prompt, model)
    
    # Save request
    data.save_request(username, model, prompt, response)

    response_json = {
        "explanation": response,
        "vulnerable": (False if response.upper().startswith("NOT VULNERABLE") else True)
      }

    return response_json, 200