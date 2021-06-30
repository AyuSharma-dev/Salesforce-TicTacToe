import { LightningElement, track } from 'lwc';
import { subscribe, onError } from 'lightning/empApi';  
import chancePlayed from '@salesforce/apex/TicTacToeController.chancePlayed';
import resetPushTopicRecord from '@salesforce/apex/TicTacToeController.resetPushTopicRecord';
import getAuthorization from '@salesforce/apex/TicTacToeController.getAuthorization';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class TicTacToe extends LightningElement {

    @track channelName = '/topic/myPushTopic';
    disableButtons = false;
    bannerMsg = 'Your Turn';
    progress = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
    ];
    overallProgress = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
    ];
    subscription = {};  
  
    connectedCallback() {
        getAuthorization(); // Get session Id on Authorization.
        // initialize component
        resetPushTopicRecord()//Reset the Push Topic record to null values.
        .then(result => {
            console.log('successfully Reset Record');
            this.handleSubscribe();
        })
        .catch(error => {
            console.log('error-->'+JSON.stringify(error));
        });
    }

    //Method called on Button click from Components.
    handleClick( event ){
        let btnCmp = this.template.querySelector("."+event.target.value);
       
        let col = btnCmp.dataset.column;
        let row = btnCmp.dataset.row;
       
        if( this.progress[row][col] == 0 || this.overallProgress[row][col] == 0 ){
            return; //Checking if Button is already pressed previously.
        }

        btnCmp.classList.add( 'marked' );
        this.progress[row][col] = 0;
        this.overallProgress[row][col] = 0;
        let finished = false;
        let tied = false;
        if( this.evalCriteria() ){ //If Method returns true that means Player has won the game.
            console.log('You Won');
            this.bannerMsg = 'Congratulations!! You Won..';
            this.showToast( 'Congratulations!!', 'You won the game...', 'success' );
            finished = true;
            this.showRestartButton();
        }
        else if( this.evalTie() ){ //If Method returns true that means Match is Tied.
            this.bannerMsg = 'Match Tied..';
            this.showToast( 'Oops...', 'Match Tied..', 'info' );
            tied = true;
            this.showRestartButton();
        }
        else{
            this.bannerMsg = 'Waiting for Opponent Response.';
        }

        //Calling Apex Method to Updated PushTopic custom record on another Org.
        chancePlayed({ coordinate: ''+event.target.value, finished: finished, tied: tied })
        .then(result => {
            console.log('successfully published');
            this.disableButtons = true;
        })
        .catch(error => {
            console.log('error-->'+JSON.stringify(error));
        });

    }
  
    //Method makes the Restart button visible on Finished and Tied games.
    showRestartButton(){
        let resButton = this.template.querySelector(".refreshButton");
        resButton.classList.remove( 'slds-hide' );
    }

    //Method Shows Toast of different types based on param values.
    showToast( title, message, variant ){
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    //Method restarts the game.
    restartGame( event ){
        chancePlayed({ coordinate: 'zero', finished: false, tied: false })
        .then(result => {
            console.log('successfully published');
            location.reload();
        })
        .catch(error => {
            console.log('error-->'+JSON.stringify(error));
        });
        
    }

    // Handles subscribe button click  
    handleSubscribe() {  
        // Callback invoked whenever a new event message is received  
        const messageCallback = ( response ) => {   
            let opponentButton = response.data.sobject.ButtonNumber__c;
            if( opponentButton == 'zero' ){ //We pass zero on Restart action
                location.reload();
                return;
            }

            let btnCmp = this.template.querySelector("."+opponentButton);
            btnCmp.classList.add( 'markedOpponent' ); //Adding the Image of Opponent mark
            this.overallProgress[btnCmp.dataset.row][btnCmp.dataset.column] = 0;
            

            if( response.data.sobject.Finished__c ){ //Opponent has won the Game if we receive Finished as true.
                console.log('Opponent Won the Game.');
                this.bannerMsg = 'Opponent Won the Game';
                this.showToast( 'Sorry..', 'Opponent Won the Game', 'error' );
                this.showRestartButton();
            }
            else if( response.data.sobject.Tied__c ){ 
                this.bannerMsg = 'Match Tied..';
                this.showToast( 'Oops...', 'Match Tied..', 'info' );
                this.showRestartButton();
            }
            else{
                this.bannerMsg = 'Your Turn';
                this.disableButtons = false;
            }
            
        };  
  
        // Invoke subscribe method of empApi. Pass reference to messageCallback  
        subscribe( this.channelName, -1, messageCallback ).then(response => {  
            // Response contains the subscription information on successful subscribe call  
            console.log( 'Successfully subscribed to : ', JSON.stringify( response.channel ) );  
            this.subscription = response;  
        });  
    }  

    //Method evaluates if Player has won the game or not.
    evalCriteria(){
        let a = this.progress;
        //Horizontal and Vertical Match
        for( let i=0; i<3; i++ ){
            let result1 = true;
            let result2 = true;
            for( let k=0; k<3; k++ ){  
                result1 = a[i][k] == 0; 
                if(result1 == false){ break; }  
            }
            for( let k=0; k<3; k++ ){  
                result2 = a[k][i] == 0; 
                if(result2 == false){ break; }  
            }
            if( result1 || result2 ){  return true;  }
        }

        //Diagonal Match
        if( ( a[0][0] == 0 && a[1][1] == 0 && a[2][2] == 0 ) ||
            ( a[0][2] == 0 && a[1][1] == 0 && a[2][0] == 0 ) ){
                return true;
        }
        
        return false;
    }

    //Method checks if the game is tied.
    evalTie(){
        let tied = true;
        for( let i=0; i<3; i++ ){
            for( let k=0; k<3; k++ ){
                if( this.overallProgress[i][k] == 1 ){
                    tied = false;
                }
            }
        }
        return tied;
    }
  
    registerErrorListener() {  
  
        // Invoke onError empApi method  
        onError(error => {  
            console.log( 'Received error from server: ', JSON.stringify( error ) );  
            // Error contains the server-side error  
        });  
  
    }  
}