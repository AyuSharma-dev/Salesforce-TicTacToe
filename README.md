# Salesforce Tic-Tac-Toe

Hi! The Salesforce **Tic-Tac-Toe** is a visual representation of how a **Real Time Integration** can be done btween two different Salesforce orgs utilizing the Push topics as Streaming channel and keep the components in Sync with the Server of another Salesforce org or a third party system.

[![Button](https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/src/main/webapp/resources/img/deploy.png)](https://githubsfdeploy.herokuapp.com/app/githubdeploy/AyuSharma-dev/Salesforce-TicTacToe)

<br/><br/>

[![TicTacToeGif4a449f5c29f04915.gif](https://s6.gifyu.com/images/TicTacToeGif4a449f5c29f04915.gif)]
<br/>
# Setup

Deploy the Repository on two different Salesforce Org. I would only recommend to use Trailhead playgrounds or Developer Edition. This Repo is not cofigured for Sandboxes. After Successfully deployment follow the below steps for both the Orgs.

## Assign Permission Set User
Assign TicTacToe permission set to the Playing user. This permission is created as part of package deployment.

## Run The Apex Script

Run the following Apex Script  in Execute Anonymous window:

```ruby
PushTopic pushTopic = new  PushTopic();
pushTopic.Name = 'myPushTopic';
pushTopic.Query = 'SELECT Id, ButtonNumber__c, Finished__c, Tied__c FROM PushTopicCustom__c WHERE ButtonNumber__c IN (';
pushTopic.Query += '\'one\',\'two\',\'three\',\'four\',\'five\',\'six\',\'seven\',\'eight\',\'nine\',\'zero\')';
pushTopic.ApiVersion = 50.0;
insert pushTopic;

PushTopicCustom__c pushCustom = new  PushTopicCustom__c();
insert pushCustom;
```
This will create a Push Topic publisher and a Record for PushTopicCustom__c object record.

## Update the Remote Site Settings

As Part of the Package a Remote Site must be created in both of your org named as TicTacToeSite. Edit these and Add the URL of Destination Orgs . For example

>Org1 will have Instance url of Org2 : https://org2.my.salesforce.com

>Org2 will have Instance url of Org1 : https://org1.my.salesforce.com

This should be the Instance URL not the URL you see in browser in Salesforce Lightning. To get the URL either **switch to Salesforce Classic** or run this Command in Execute anonymous: **URL.getOrgDomainUrl()**


## Create Custom Setting Record

Now to make both the Org Authorize each Other, You need to create a record for **TicTaxToeSettings__c** custom setting. This Record will contain the information of your Destination Org. As part of the repository deploy a connected App is created in each Org. We require the Client Id and Secret from these connected apps. Below are field values for Record in Org1:

- **Name**: main
- **Client Id**: *Get Client Id from Connected App of Org2*
- **Client Secret**: *Get Client Secret from Connected App of Org2*
- **Username** : Username of the Org2.
- **Password**: Password of the Org2.
- **Instance URL**: Instance URL of Org2.
- **PustTopic Record Id**: Record Id of the PushTopicCustom__c  Record in Org1.
- **Destination Org pushTopic RecordId**: Record Id of the PushTopicCustom__c  Record in Org.

Leave SId field blank and Repeat the same steps in your Org2 for Org1.

>**Caution**: I don't suggest this type of Authorization in Production Environments or Enterprise development 	   as this expose sensitive information. I would suggest to use either JWT or Oauth2.0 to get the Authorization Done.

## One Last and Small thing Update the CSS and JS File

**In TicTacToe.css marked and markedOpponent class's Background URL should be opposite.**
For example
>Org1: 
>>**marked** -> Circle
>>**markedOpponent** -> Cross

>Org2: 
>>**marked** -> Cross
>>**markedOpponent** -> Circle

In TicTacToe.js file update the line number 11:
```ruby 
disableButtons = false; //Change this to true in only one org.
``` 

Thats it You are ready to Play Game in your Salesforce ORGs.
---


# License
You can use this code as you wish. Author does not take responsibility of any Harm to Data of any kind.