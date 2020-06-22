---
id: 4-tezos-updater
title: Deploy the Tezos Updater
---

## Should You Deploy Your Own Updater?

The `tezos-updater` downloads historic chain data from the network, and listens to updates to keep your node data up to date. 

Note that this step is optional, and is only required if you want to run your own node updater to control versioning, or you are deploying a node in an aws region where there is no public updater available for the net you want to use (mainnet/testnet/zeronet). You can see the [list of public updaters that are available here](https://github.com/tqtezos/node-cloudformation/blob/804cf05e4530e52a1f7ac7d102f7ba74e51de776/frontnode-standalone.yaml#L247). Check that the bucket that matches your needs is accessible (ecosystems change faster than documentation) before you assume you can use it.

Since a new version of the public updater could be incompatible with your node, we recommend you run your own updater. It is rare that you will have a conflict between different releases, but if the underlying storage structure changes, your data updater will no longer be compatible with your nodes, and they will be out of sync. You may also want to run your own updater if you want to control the chain data you are seeing. While the buckets listed here should have accurate data, we can’t guarantee it.

If you decide not to run your own updater, skip to [the next page](/docs/run-a-node/5-tezos-nodes).


## Deploy the tezos-updater CloudFormation

Navigate to Services > CloudFormation in the same region as your VPCs, and click “Create stack” from the dropdown, choosing the “With new resources” option.

<img src="/img/images/updater-1.png" />

### Step 1: Specify Template

 In the specify template section, choose “Upload a template file” and select the `tezos-updater.yaml` file. Then hit next.
 <img src="/img/images/updater-2.png"/>

### Step 2: Specify stack details

There are quite a few more options to specify here than we did with VPC deployment, so we’ll go through section by section.

 - Stack name is simply a name to give your tezos updater deployment CloudFormation stack. Because we’re deploying a testnet in this tutorial, I’ve named my stack “testnet-updater”

<img src="/img/images/updater-3.png"/>
 - Github configuration Parameters will require several updates. 
 - Unless you’ve changed the repository name for the tezos-updater fork, that field will remain unchanged.
 - The branch will default to “testnet,” which means we do not need to make any changes. If you want to deploy a mainnet or zeronet node, you will update this field.
 - The user is going to be changed to the github user that forked the repository
 - The personal access token is what we generated and copied from github in Part 2.

<img src="/img/images/updater-4.png"/>

 - VPC and ECS Configuration Parameters will require several updates. 
 - In the first dropdown, find the VPCs we just created. In the tutorial, we named them “node-vpcs”
 - When we choose what subnets to deploy to, we will choose the subnets associated with “node-vpcs.” Choose all three.
 - Add the keypair we created earlier to the keypair option
 For right now, leave the rest of the options unchanged. We will be changing the number of updater tasks a little later.

<img src="/img/images/updater-5.png"/>

 - Tezos configuration is unchanged. Click “Next.”

 <img src="/img/images/updater-6.png"/>

### Step 3: Configure stack options

 You don’t need to do anything here. Click next.

### Step 4: Review

 Check the acknowledgement checkbox and click “Create stack”

The CloudFormation script will allocate resources and set everything up for you. You can monitor its progress in the Services > CloudFormation > Stacks list and clicking on your updater CloudFormation stack. Wait for the stack to finish creating before moving on.
<img src="/img/images/updater-7.png"/>

## Set s3 Chainbucket Requester Pays

The updater CloudFormation will create some s3 buckets. Navigate to Services > S3 and locate a bucket that looks like `[stack-name]-chainbucket-[random-id]`

<img src="/img/images/reqpays-1.png"/>

This is where all the block data will be stored.

Because this data will be accessed by public nodes, you’ll want to change a property to have the person requesting the data for download charged by amazon instead of you.

Click the bucket name, which will bring you to an overview of the bucket. Select the “Properties” tab at the top. 

<img src="/img/images/reqpays-2.png"/>

Scroll down until you find a section titled “Requester Pays.” Click this and select the “Enabled” option, and save.

<img src="/img/images/reqpays-3.png"/>

## Download Chain Data

There are two options for downloading the data you’ll need to get your node up to date. You can either update the configuration on your updater to download all the data itself, which will be slower, or if you have access to another updater running the same protocol and version as you, you can transfer the data, which will take only minutes instead of days. (Again, do this at your own risk; public buckets could have inaccurate data.)

To transfer data from another updater instance:

### Find a Data Source
First, let’s find a public chainbucket to transfer our data from. Open the [tezos-node cloudformation](https://github.com/tqtezos/node-cloudformation/blob/master/frontnode-standalone.yaml#L245) file, and find the `RegionMap` section. This maps all regions to the block chain data buckets available for the various nets. This is what the list looks like at the time of writing.
<img src="/img/images/chaindata-1.png"/>
Because we’re deploying a testnet node, the only option we have to copy data from here is the `testnet` bucket in `eu-west-1`. The bucket name we’ll need is `alphanet-updater-chainbucket-1v6go885nadpa` (Note: it is always possible that tutorials and scripts will get out of date, and that the buckets listed here, and even in the github repository will no longer be available. In that case, you can always download the data yourself. Skip to step 5 in that case.)

### Find the Public DNS for Our EC2
Next, we find the Public DNS for our EC2. In the AWS console, navigate to Services > EC2 > Instances and find your tezos updater instance. At the bottom of the page, there will be a “Description” tab, and in the list of EC2 properties, locate the “Public DNS”
<img src="/img/images/chaindata-2.png"/>
Our DNS here is `ec2-54-188-94-183.us-west-2.compute.amazonaws.com`. Copy this address, as we’ll be using it in step 4.

### SSH Into EC2
Now, we’ll ssh into our EC2, and from inside, we’ll copy data from the public chainbucket we found in the `RegionMap` to our newly-created chainbucket. We’re going to be using the `pem` file we downloaded in step 2.4 to ssh into our new tezos-updater container. 

In a terminal, we’re going to use the public DNS for our EC2 and our `pem` file like this: `ssh -i ~/.ssh/[your pem file name].pem ec2-user@[your public DNS]`

In my case, I will type:

```shell
$ ssh -i ~/.ssh/new-keypair.pem ec2-user@ec2-54-188-94-183.us-west-2.compute.amazonaws.com
```

You will be asked if you want to add a new known host. Type “yes” and hit enter, and you should now see something like the following:

```shell
   __|  __|  __|
   _|  (   \__ \   Amazon ECS-Optimized Amazon Linux AMI 2018.03.20200115
 ____|\___|____/
For documentation, visit http://aws.amazon.com/documentation/ecs
[ec2-user@ip-10-190-10-222 ~]$
```

### Initiate the Data Copy
Now we'll initiate a data copy. In the EC2 terminal, use the following commands.
We're going to define two variables: `sourcebucket` and `targetbucket`. `sourcebucket` is the s3 bucket that already has chain data stored that we want to copy from (we picked this data source from the RegionMap in step 1). `targetbucket` is the s3 chainbucket we created with our CloudFormation script, and we found when we [set requester pays](#set-s3-chainbucket-requester-pays).


```shell
[ec2-user@ip-10-190-10-222 ~]$ export sourcebucket=alphanet-updater-chainbucket-1v6go885nadpa
[ec2-user@ip-10-190-10-222 ~]$ export targetbucket=testnet-updater-chainbucket-167t5ylzl69jf
[ec2-user@ip-10-190-10-222 ~]$ aws s3 sync --delete --request-payer requester s3://$sourcebucket s3://$targetbucket
```
The data will start to sync, and you should see output like the following:
```shell
copy: s3://alphanet-updater-chainbucket-1v6go885nadpa/current1 to s3://testnet-updater-chainbucket-167t5ylzl69jf/current1
copy: s3://alphanet-updater-chainbucket-1v6go885nadpa/node1/context/store.branches to s3://testnet-updater-chainbucket-167t5ylzl69jf/node1/context/store.branches
copy: s3://alphanet-updater-chainbucket-1v6go885nadpa/node1/context/index/lock to s3://testnet-updater-chainbucket-167t5ylzl69jf/node1/context/index/lock
```


## Update ECS Tasks
Once the data has finished copying, and we’ve confirmed that the CloudFormation stack has finished creation, we will want to turn on an ECS task to keep the data up to date. In the AWS console, navigate to Services > CloudFormation > Stacks and find the stack for your updater. Click the “Update” button.
<img src="/img/images/chaindata-3.png"/>
Check “Use current template” and click next.
<img src="/img/images/chaindata-4.png"/>
In the ECS Configuration, update the number of updater tasks from 0 to 1. Click next. 
<img src="/img/images/chaindata-5.png"/>
Click next through the following screens. When you are done, you should be taken back to the CloudFormation stack screen for your updater, and it should now say “UPDATE_IN_PROGRESS.” Your chainbucket will now be regularly updated with new block chain data.

Now we've got an updater task that is making sure our data is up to date. We can now deploy our nodes to access that data.