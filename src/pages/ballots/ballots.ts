import { Component } from '@angular/core';
import {AlertController,NavController } from 'ionic-angular';

@Component({
  selector: 'page-ballots',
  templateUrl: 'ballots.html',
})

export class Ballots {
submitPrep:Boolean=false;
submitTT:Boolean=false;
submitEval:Boolean=false;
pspeaker: String;
pspeakers: Array<{name: string}>;
ttspeaker: String;
ttspeakers: Array<{name: string}>;
espeaker: String;
espeakers: Array<{name: string}>;
// result:Boolean=false;
  constructor(public navCtrl: NavController, public alertCtrl: AlertController) {
    let context = this;

    firebase.database().ref('/roleBearers').once('value').then(function(snapshot) {
      let roleBearers = snapshot.val();
      let preparedSpeakers = roleBearers.preparedSpeakers;

      context.pspeakers = [];
      for(let speaker of preparedSpeakers) {
        context.pspeakers.push({name: speaker.name});
      }

      context.ttspeakers = [
        { name: 'TT1' },
        { name: 'TT2'},
        { name: 'TT3'},
        { name: 'TT4' }
      ];

      context.espeakers = [
        { name: 'E1' },
        { name: 'E2' }
      ];
    });


  }

  showAlertSelect() {
    let alert = this.alertCtrl.create({
      title: 'Prepared Speech',
      subTitle: 'Please select at least one Speaker',
      buttons: [{
        text:'OK',
        handler : data=>{
console.log("Hi");
      }
    }]
    });
    alert.present();
  }

  showAlertSubmit(sp,speaker) {
    let alert = this.alertCtrl.create({
      title: 'Prepared Speech',
      subTitle: 'Are you sure you want to submit your vote for '+speaker+'?',
      buttons: [{
        text:'OK',
        handler : data=>{
          switch(sp){
            case 'prep':{
      this.submitPrep=true;
      break;
            }
            case 'tt':{
      this.submitTT=true;
            break;
          }
            case 'eval':{
      this.submitEval=true;
          break;
          }
          }

      // return true;
      }
    },{
        text:'Cancel',
        handler : data=>{
console.log("Cancel");
// this.submit=false;
// return false;
      }
    }]
    });
    alert.present();
    // return promise(result);
  }

submitP(sp){
  switch(sp){
            case 'prep':{
       if(this.pspeaker!=null){
  this.showAlertSubmit(sp,this.pspeaker);
  // console.log('if'+ this.submit);
}
else{
this.showAlertSelect();
}
 break;
            }
            case 'tt':{ if(this.ttspeaker!=null){
  this.showAlertSubmit(sp,this.ttspeaker);
// console.log("SubmitP");
  // console.log('if'+ this.submit);
}
else{
this.showAlertSelect();
}  break;
            }
            case 'eval':{
               if(this.espeaker!=null){
  this.showAlertSubmit(sp,this.espeaker);
  // console.log('if'+ this.submit);
}
else{
this.showAlertSelect();
}
            break;
           }
}

}
getP(sp){
console.log("getP"+sp);
// return true;
switch(sp){
            case 'prep':{
      return this.submitPrep;
            }
            case 'tt':{
      return this.submitTT;
            }
            case 'eval':{
    return this.submitEval;
            }
}
}
 voteP(p){
   this.pspeaker=p.name;
 }
 voteTT(p){
   this.ttspeaker=p.name;
 }
 voteE(p){
   this.espeaker=p.name;
 }
}
