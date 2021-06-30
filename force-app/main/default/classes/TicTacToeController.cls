/**
 * @description       : Controller class for TicTacToe LWC
 * @author            : Ayush Sharma
 * @last modified on  : 06-30-2021
 * @last modified by  : Ayush Sharma
 * Modifications Log 
 * Ver   Date         Author         Modification
 * 1.0   06-30-2021   Ayush Sharma   Initial Version
**/
public with sharing class TicTacToeController {
    
    /**
    * @description Method runs on Button click and Sends information to another Org.
    * @author Ayush Sharma | 06-30-2021 
    * @param String coordinate 
    * @param Boolean finished 
    * @param Boolean tied 
    **/
    @AuraEnabled
    public static void chancePlayed( String coordinate, Boolean finished, Boolean tied ){

        TicTacToeSettings__c tSetting = TicTacToeSettings__c.getInstance('main');
        String authorizationHeader = 'Bearer '+tSetting.sId__c;
        HttpRequest httpRequest = new HttpRequest();
        httpRequest.setMethod('PATCH');
        httpRequest.setEndpoint( tSetting.instance_Url__c+'/services/data/v52.0/sobjects/PushTopicCustom__c/'+tSetting.Destination_Org_pushTopic_RecordId__c );
        httpRequest.setHeader('Authorization', authorizationHeader);
        httpRequest.setHeader('Content-Type', 'application/json;charset=UTF-8');
        if( finished ){
            httpRequest.setBody('{ "ButtonNumber__c" : "'+coordinate+'", "Finished__c" : true }');
        }
        else if( tied ){
            httpRequest.setBody('{ "ButtonNumber__c" : "'+coordinate+'", "Tied__c" : true }');
        }
        else{
            httpRequest.setBody('{ "ButtonNumber__c" : "'+coordinate+'"}');
        }
        Http http = new Http();
        HTTPResponse httpResponse = http.send(httpRequest);
        system.debug('httpResponse -> '+ httpResponse.getBody());
        system.debug('httpResponse.getHeaderKeys() -> '+ httpResponse.getHeaderKeys());

    }

    /**
    * @description Method Authorizes the Org and get the Session Id.
    * @author Ayush Sharma | 06-30-2021 
    **/
    @AuraEnabled
    public static void getAuthorization(){

        TicTacToeSettings__c tSetting = TicTacToeSettings__c.getInstance('main');
        HttpRequest httpRequest = new HttpRequest();
        httpRequest.setMethod('POST');
        httpRequest.setEndpoint( 'https://login.salesforce.com/services/oauth2/token' );
        String reqBody ='grant_type=password&client_id='+tSetting.ClientId__c
                        +'&client_secret='+tSetting.Client_Secret__c
                        +'&username='+tSetting.Username__c+'&password='+tSetting.Password__c;
        httpRequest.setBody(reqBody);
        httpRequest.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        Http http = new Http();
        HTTPResponse res = http.send(httpRequest);
        Map<String, Object> mapResponse = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        tSetting.sId__c = (String)mapResponse.get( 'access_token' );
        update tSetting;
    }

    /**
    * @description Method Resets the PushTopic record on Initialization.
    * @author Ayush Sharma | 06-30-2021 
    **/
    @AuraEnabled
    public static void resetPushTopicRecord(){
        TicTacToeSettings__c tSetting = TicTacToeSettings__c.getInstance('main');
        PushTopicCustom__c pt = new PushTopicCustom__c( Id = tSetting.pushTopic_RecordId__c );
        pt.ButtonNumber__c = null;
        pt.Finished__c = false;
        pt.Tied__c = false;
        update pt;
    }

}