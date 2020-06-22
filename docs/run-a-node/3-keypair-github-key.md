---
id: 3-keypair-github-key
title: Key Pair and Github Access Key
---

## Create a Key Pair

Once we deploy our EC2 containers, we'll want to be able to remotely access them from your local machine. In order to authenticate ssh, AWS uses key pairs. 

Navigate to Services > EC2, then choose "Key Pairs" from the sidebar under the Network & Security heading. Click "Create Key Pair."

<img src="/img/images/keypair-1.png" alt=""/>


Give it a name that will identify it. I have chosen `new-keypair` here, but you probably want to give it a name that identifies it as yours. Keep the option set to `pem`, and click "Create key pair."

<img src="/img/images/keypair-2.png" alt=""/>


You should be taken to a success message and a download of a `pem` file should be triggered.

<img src="/img/images/keypair-3.png" alt=""/>

Move your newly downloaded pem file to your .ssh directory (on MacOS).

```shell
$ mv ~/Downloads/new-keypair.pem ~/.ssh/

$ chmod 600 ~/.ssh/new-keypair.pem
```

We will be using this to authenticate when we ssh into our new EC2s.


## Create a Github Access Token

One other preparatory step we need to take is to create a Github Access Token that will give AWS permission to access the repositories it needs. 

Navigate to https://github.com/settings/tokens, select "Personal access token" in the sidebar, and select "Generate new token"

<img src="/img/images/gh-1.png" alt=""/>

It will ask for a note saying what it will be used for and what permissions to provide. Give it a descriptive note, and then check the "repo" option, which are the minimal permissions required. Scroll to the bottom and click "Generate new token"


<img src="/img/images/gh-2.png" alt=""/>

You will have your access token generated and visible, but it will not remain visible once you close this window. Keep it open for now, or copy it so you can use it again when we deploy our CloudFormation files later in the tutorial. You can always generate new tokens if you lose access to this one, so don’t worry if you accidentally close the window.

<img src="/img/images/gh-3.png" alt=""/>

Now that we have the credentials we need for accessing both our AWS EC2s and for AWS to access our repos, we can move onto the next step.