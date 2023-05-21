
<center><span style="font-size:30; font-weight:bold;color:#cc3061">Authenguard</span> <span>by Authentura</span>
<center>(beta)</center>


Authenguard delivers real-time vulnerability detection in your code. As you write your code, this extension not only identifies vulnerabilities but also provides context-aware explanations of the vulnerabilities and suggests fixes. With a dual purpose of enhancing code security and educating about security best practices, Authenguard aims to become your constant coding and security companion.

![[early-animated.gif]]


**NOTE:** [To gain access to the early beta you have to join our waitlist.](https://forms.office.com/Pages/ResponsePage.aspx?id=AtzyDUXV30OsSvs76idkrFYzqS-SJ8tCv1gOL4GgWU1UNFlPUEdCTk01RFFIVkhBUzlBVE5HRldCUy4u)



------



### Contents:
- [How to Use](#How-to-Use)
  - [Start Here](#start-here)
  - [Using Authenguard](#using-authenguard)
- [Waitlist](#sign-up-to-the-waitlist)
- [Addressing Privacy Concerns](#addressing-privacy-concerns)
- [Bugs We Know About](#bugs-we-know-about)
- [Get in Touch](#get-in-touch)
	- [Report a bug](#report-a-bug)


------

# How to Use
## Start Here

When you're approved on the waitlist, we'll send you a link to a sign-up form. The link will look like this: `https://mvp.authentura.co.uk/register/<token>`.

After you sign up, we'll give you an API token. Put this token and your username into the extension settings to start using the extension.
![[settings_image.png]]

Once your login info is good to go, you can start using Authenguard.

<br>
<br>

## Using Authenguard

When Authenguard is on, it checks the code near your cursor for vulnerabilities every time you save a file. It works with all programming languages, but it's best with popular ones because of the data it was trained on.

To turn Authenguard on or off, click the Authenguard button at the bottom of your screen.
![[authenguard-button.png]]

**Heads up:** Using the extension with non security related tasks (like design work, simple scripts, etc) can cause a higher number of false positives. These can be annoying, so we recommend you only turn the extension on when you think you might need it!
(We are currently working on fixing this issue)

<br>

----

<br>

# Sign up to the waitlist!

Authenguard is in its early beta. We have launched a **free** early tester waitlist. All we ask in return is your feedback and that you try report bugs when its not an inconvenience.

To join the waitlist, follow [this link](https://forms.office.com/Pages/ResponsePage.aspx?id=AtzyDUXV30OsSvs76idkrFYzqS-SJ8tCv1gOL4GgWU1UNFlPUEdCTk01RFFIVkhBUzlBVE5HRldCUy4u) and answer 5 simple questions. (~about ~1 minute)

**Note:** Question 5 is not strictly required to be a "yes", but users that provide feedback will be higher up in our queue.


<br>

----

<br>

# Addressing Privacy concerns

Authenguard relies heavily on third party LLM API's (like openai). OpenAI admits to using this data for training. We do the same. Understandably so could be a privacy concern for you or your organsiation.

We have a few things to help address this.

Firstly, all data that we send to openAI or use ourselves for training our model is fully anonised. Nothing but the code itself and the response of our model is stored.

Secondly, and more importantly. We are working on a model to automatically redact any sensitive or identifiable information from code. These would include; names, hardcoded passwords and API keys, etc. This model is going to run either locally on your computer or on our servers before getting saved or sent to OpenAI. **This model is not active yet, however it should be shortly** If this is a dealbreaker for you, then you can add your email on [this form]() where we will notify you when our model is operational.

Finally, in later stages of the testing and deployment, we will offer privacy friendly tiers where we do not store or train on any of your data. 