---
id: 1-run-a-node-intro
title: Setup and Deploy a Public Tezos Node with AWS Cloud Services
sidebar_label: Running a Public Tezos Node with AWS Cloud
---

## Introduction

Running a Tezos Node on your local machine is made fairly simple using the [shell script](http://tezos.gitlab.io/introduction/howtoget.html), but what happens if you want to run a node that is resiliant against outages, can scale to accept many more requests, and you don't have to manage, deploying a node in the cloud might be something you'd like to consider. 

However, getting started with AWS requires a lot of devops knowledge that you might not want to learn from scratch. 

This tutorial will take you through a deployment process step by step for a **public** testnet node, providing scripts and tools that will make the process much easier. It assumes you have little to no previous AWS experience, but that you are more comfortable with git. 

This tutorial is intended for more advanced users, who are interested in hosting a cluster of nodes capabable of handling hundreds of public requests.

Before you get started, you'll need an AWS account, to fork the necessary repositories, and to choose the appropriate network and docker image to deploy, which we'll discuss now.

### Amazon Web Services
Before we get started, you will need to [set up your AWS account.](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/)

#### What is CloudFormation
Allocating resources and configuring options in AWS can become tedious and difficult to manage. If something goes wrong or you want to change something, you might have to tear down everything and start from scratch. 

CloudFormation allows you to specify all the resources and settings you'll need to accomplish a task in one configuration file. All stacks created with CloudFormation will be the same every time, and aren't subject to forgetting a setting. It also means that if there's any problem creating the stack, the whole thing can be rolled back and redeployed.

#### Estimated costs: 
AWS has a number of methods for charging for their services. In this tutorial, we use an "always on" method, but this can be modified in the provided CloudFormation scripts if you wish. 

You should typically run 2 nodes so that if one fails, the load balancer can point to the other. We suggest you run i3.large ec2s. Pricing is set differently from [region to region](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html). [Find the pricing per hour](https://aws.amazon.com/ec2/pricing/on-demand/) for the region you want to deploy in, and multiply the cost by a constant uptime of approximately 730 hours per month and by the number of nodes you plan to run. The load balancer will cost approximately an additional $20 per month. In addition, if you run your own updater, you will be running a third i3.large EC2. 

With updater = $`(3 * [price of i3.large EC2 in your region] * 730) + 20`
Without updater = $`(2 * [price of i3.large EC2 in your region] * 730) + 20`


## Fork and Customize Source Repositories

You can read about the different Tezos networks [here](https://tezos.gitlab.io/#the-networks) and choose one that meets your needs. In this tutorial, we will be deploying a testnet node, but you can also deploy mainnet or zeronet nodes. 

### Tezos Docker Images

Tezos releases Docker images for each of the networks, both maintaining an always-up-to-date version, and individual release versions. You can find the one you’d like on [docker hub](https://hub.docker.com/r/tezos/tezos/tags?page=1). 

- Mainnet will be prefixed with "master" 
- Testnet will be named for whatever the most recent testnet protocol exists. At the time of writing, it is prefixed with "babylonnet"
- Zeronet will be prefixed with "zeronet." This is a node you’ll want to pin to a specific release version image, since it will often have breaking changes

Auto-updating versions are named just the "prefix" described above, whereas specific versions will be followed by an underscore and a hash. 
<img src="/img/images/intro-1.png"/>


### Resource Repositories 

We'll be using three repositories with boilerplate pre-written so that you don't have to.
- [node-docker](https://github.com/tqtezos/node-docker)
- [tezos-updater](https://github.com/tqtezos/tezos-updater) (optional, but recommended)
- [node-cloudformation](https://github.com/tqtezos/node-cloudformation)

Before beginning, you will want to fork these repos and customize them. 

Clone your `node-cloudformation` fork to your local machine so that you can access the CloudFormation scripts. You can examine the `yaml` files, and anywhere that there is a reference to the `tqtezos` github account or repositories, you will want to update those references to your own forks. 

#### Pick your Docker Image and Update Accordingly

The `node-docker` and `tezos-updater` repositories have three branches to choose from: mainnet, testnet, and zeronet. These branches use the auto-updating docker image (see "Tezos Docker Images" above), and if you’d like to pin the release version you’re using when you deploy, you'll need to modify the `Dockerfile` in the appropriate branch in both repositories. Pinned image versions will need to be monitored and updated manually, but will be easier to control.

<img src="/img/images/node-docker.png"/>


Now that we've decided what network to deploy a public node for, and updated our repositories successfully, we can start by creating a Virtual Private Cloud to deploy our nodes in.