---
id: 5-tezos-nodes
title: Deploy Your Tezos Nodes
---

## Deploy the frontnode-standalone CloudFormation

Now that we have data, we can deploy our nodes. Find the `frontnode-standalone.yaml` CloudFormation script in your local filesystem.

First, if you deployed a tezos-updater in the previous step, we’re going to add our new chaindata s3 bucket as a resource in the RegionMap. Find your region, and add a name and the bucket name to the map and save the file. 

<img src="/img/images/nodes-1.png"/>

Next, navigate to Services > CloudFormation in the AWS console. Select “Create Stack” “With new resources” (this should start feeling familiar!) 
<img src="/img/images/nodes-2.png"/>

If you deployed the `tezos-updater` in the last section, this will look very similar, but we’ll go through step by step, and I’ll point out the parameters to pay attention to.

### Step 1: Specify Template

Use the `frontnode-standalone.yaml` file.
<img src="/img/images/nodes-3.png"/>

### Step 2:  Specify Stack details
 - Stack name: Give your stack a name that will identify it
<img src="/img/images/nodes-4.png"/>
 - Github configuration Parameters will require several updates. 
 - Unless you’ve changed the repository name for the node-docker fork, that field will remain unchanged.
 - The branch will default to “testnet,” so update it if you’re deploying mainnet or zeronet nodes.
 - The user is going to be changed to the github user that forked the repository.
 - The personal access token is what we generated and copied from github in the previous section.
<img src="/img/images/nodes-5.png"/>
 - VPC Configuration Parameters will require several updates. 
 - In the first dropdown, find the VPCs we just created. In the tutorial, we named them “node-vpcs”
 - When we choose what subnets to deploy to, we will choose the subnets associated with “node-vpcs.” Choose all three.
<img src="/img/images/nodes-6.png"/>
 - ECS Configuration 
 - Add the keypair we created earlier to the keypair option
 - Update the number of ECS hosts from 5 to 2 (this is the number of nodes you’ll deploy)
 - For right now, leave the rest of the options unchanged. We will be changing the number of ECS tasks a little later.
 <img src="/img/images/nodes-7.png"/>
 - Tezos Configuration, SNS and Cloudwatch Configurations
 - Be sure the tezos network you’re connecting to matches the tezos-updater you will be using in your region
 - The other fields can be left as is for now.
<img src="/img/images/nodes-8.png"/>

### Step 3: Configure stack options
 You don’t need to do anything here. Click next.

### Step 4: Review
 Check the acknowledgement checkbox and click “Create stack”

The CloudFormation script will allocate resources and set everything up for you. You can monitor its progress in the Services > CloudFormation > Stacks list and clicking on your node CloudFormation stack. 


## Update ECS Tasks
Once the stack has been created successfully, we can update the stack to create an ECS task. It may seem odd to immediately update the stack we just created, but there’s a reason for this. If we launch a task before the CodePipeline/CodeBuild builds your first artifact, the task creation will fail, causing the entire stack to fail and roll back. When you deploy with 0, then wait a few minutes until CodePipeline builds the first artifact, you can then update the number of tasks to be > 0 and they will successfully create/launch the tasks.

Go to Services > CloudFormation > Stacks, select the nodes stack and click “Update”
<img src="/img/images/nodes-9.png"/>

Select “Use current template” and click “Next”
<img src="/img/images/nodes-10.png"/>

Update the number of ECS tasks from 0 to 1, and click “Next” Save the new stack. 
<img src="/img/images/nodes-11.png"/>

Now, we should have nodes running, accessing data stored in our s3 buckets. Let's confirm that everything is working as expected in the next step.