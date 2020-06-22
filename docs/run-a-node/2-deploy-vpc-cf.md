---
id: 2-deploy-vpc-cf
title: Create VPC
---

## What Is a VPC?
The first step in deploying a public Tezos node on AWS is to deploy the [VPC](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html) CloudFormation script. VPC stands for Virtual Private Cloud, and creates a virtual network where all your AWS resources will be deployed.


## Create Stack
Log into the AWS console, and navigate to Services > CloudFormation. Click “Create Stack” and choose “With new resources”

<img src="/img/images/vpcs-1.png" alt="create-stack-with-new-resources"/>


## Walk through the CloudFormation steps

### Step 1: Specify Template

In the specify template section, choose “Upload a template file” and select the `public-vpc.cloudformation.yaml` file. Then hit next.

<img src="/img/images/vpcs-2.png" alt=""/>

### Step 2: Specify stack details

The only thing you’ll need to do here is specify a stack name. I’ve chosen `node-vpcs`. Hit next.

<img src="/img/images/vpcs-3.png" alt=""/>

### Step 3: Configure stack options

You don’t need to do anything here. Click next.

### Step 4: Review

Check the acknowledgement checkbox and click “Create stack”

The CloudFormation script will allocate resources and set everything up for you. You can monitor its progress in the Services > CloudFormation > Stacks list and clicking on your VPC CloudFormation stack. 
