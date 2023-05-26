# Authenguard VS Code Extension

Authenguard delivers real-time vulnerability detection in your code. As you write your code, this extension not only identifies vulnerabilities but also provides context-aware explanations of the vulnerabilities and suggests fixes. With a dual purpose of enhancing code security and educating about security best practices, Authenguard aims to become your constant coding and security companion.

![Animated GIF of authenguard working](https://mvp.authentura.co.uk/static/early-animated.gif)


**NOTE:** [To gain access to the early beta you have to join our waitlist.](https://forms.office.com/Pages/ResponsePage.aspx?id=AtzyDUXV30OsSvs76idkrFYzqS-SJ8tCv1gOL4GgWU1UNFlPUEdCTk01RFFIVkhBUzlBVE5HRldCUy4u)


<br>


# Contents:
- [How to Use](#How-to-Use)
  - [Start Here](#start-here)
  - [Using Authenguard](#using-authenguard)
- [Waitlist](#sign-up-to-the-waitlist)
- [Addressing Privacy Concerns](#addressing-privacy-concerns)
- [Bugs We Know About](#bugs-we-know-about)
- [Get in Touch](#get-in-touch)
	- [Report an Issue](#report-an-issue)


<br>


# How to Use
## Start Here

When you're approved on the waitlist, we'll send you a link to a sign-up form. The link will look like this: `https://mvp.authentura.co.uk/register/<token>`.

After you sign up, we'll give you an API token. Put this token and your username into the extension settings to start using the extension.
![Image of Authenguard settings](https://mvp.authentura.co.uk/static/settings_image.png)

Once your login info is good to go, you can start using Authenguard.


<br>


## Using Authenguard

When Authenguard is on, it checks the code near your cursor for vulnerabilities every time you save a file. It works with all programming languages, but it's best with popular ones because of the data it was trained on.

To turn Authenguard on or off, click the Authenguard button at the bottom of your screen.

![Image of Authenguard toggle button](https://mvp.authentura.co.uk/static/authenguard-button.png)

**Heads up:** Using the extension with non security related tasks (like design work, simple scripts, etc) can cause a higher number of false positives. These can be annoying, so we recommend you only turn the extension on when you think you might need it!
(We are currently working on fixing this issue)


<br>


# Waitlist

As we are in the early stages of Authenguard's beta version, we've put together a **free** waitlist for early testers. All we request in return is your valuable feedback and that you report bugs when it's convenient.

To join the waitlist, simply follow [this link](https://forms.office.com/Pages/ResponsePage.aspx?id=AtzyDUXV30OsSvs76idkrFYzqS-SJ8tCv1gOL4GgWU1UNFlPUEdCTk01RFFIVkhBUzlBVE5HRldCUy4u) and answer five brief questions. The whole process should take around one minute.

**NOTE:** While a "yes" answer to question five isn't strictly mandatory, those who provide feedback will be prioritized in our queue.


<br>


# Addressing Privacy Concerns

Understanding that Authenguard heavily relies on third-party LLM APIs like OpenAI, which might utilize data for training, and acknowledging that we ourselves may potentially do the same, we are aware of your possible privacy concerns.

To address these, we assure you that:

**Firstly**, all data sent to OpenAI or used for training our model is fully anonymized. Only the code itself and our model's response are stored.

**Secondly**, we're working on a mechanism to automatically redact any sensitive or identifiable information from code, including names, hard-coded passwords, API keys, and so forth. This mechanism will operate either locally on your machine or on our servers before any data gets saved or sent to OpenAI. While **this feature is not yet active, it should be soon**. If this is a major concern for you, feel free to add your email to [this form](https://forms.office.com/Pages/ResponsePage.aspx?id=AtzyDUXV30OsSvs76idkrGRPDdQgCeFKrcOZX0BBG-9UNkw1M01CNTU1QllUSk9SWTY4VUw2N1dMVy4u) where we'll notify you once our model is operational.

**Lastly**, in later stages of testing and deployment, we will provide privacy-centric tiers that ensure we do not store or train on any of your data.


<br>


# Bugs We Know About

### False positives

Currently, Authenguard may flag benign lines of code as issues, especially if the code doesn't carry any security relevance. We are hard at work to rectify this, but for now, we recommend you turn off Authenguard when working with non-security-related code, such as design work or simple scripts.

### Hover provider not updating with explanations

If you request an explanation for an issue, you may encounter a bug where the hover provider doesn't update until you move your mouse away and refocus. This stems from a limitation with vscode, which we are actively addressing. For the time being, it's best to move your mouse away from the issue and refocus once the explanation is ready.


<br>


# Get in Touch

For any further queries or simply to reach our team, you can contact us at [contact@authentura.co.uk](mailto:contact@authentura.co.uk). We are always open to questions, so don't hesitate to get in touch!

## Report an Issue

Should you come across any bugs that we didn't mention above, we would greatly appreciate if you could bring it to our attention. Major security vulnerabilities might even warrant a small bounty from us. You can use the above email or directly get in touch with me, the lead developer, at [s.morris@authentura.co.uk](mailto:s.morris@authentura.co.uk).
