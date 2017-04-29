import { Component } from '@angular/core';
import {AlertController,NavController } from 'ionic-angular';
import firebase from 'firebase';

@Component({
  selector: 'page-ballots',
  templateUrl: 'ballots.html',
})


export class Ballots {
  // "Model" items to store the data that will be bound to the View
  // Arrays to keep track of voting history
  submit:Array<{[index: string]: boolean}>;
  selectedSpeaker: Array<{[index: string]: string}>;
  votedIndex: Array<{[index: string]: number}>;

  // Arrays to store all the names of the speakers
  preparedSpeakers: Array<{name: string, index: number}>;
  ttSpeakers: Array<{name: string, index: number}>;
  evaluators: Array<{name: string, index: number}>;
  big3: Array<{role: string, name: string, index: number}>;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController) {
    // We store the "this" variable so that
    // the proper "this" object can be used inside firebaseRef
    let context = this;
    let firebaseRef = firebase.database().ref('/roleBearers');

    // Initialize empty arrays so that they are not "undefined" when used
    this.submit = [];
    this.votedIndex = [];
    this.selectedSpeaker = [];

    firebaseRef.once('value').then(function(snapshot) {
      let roleBearers = snapshot.val();
      context.preparedSpeakers = context.setupSpeakers("preparedSpeakers", roleBearers.preparedSpeakers);
      context.ttSpeakers = context.setupSpeakers("ttSpeakers", roleBearers.ttSpeakers);
      context.evaluators = context.setupSpeakers("evaluators", roleBearers.evaluators);
      context.big3 = context.setupSpeakers("big3", roleBearers.big3);
    });
  }

  setupSpeakers(roleType: string, speakers) {
    let array = [];

    // Check if there is an existing vote from the user
    let index = Ballots.getFromLocalStorage(roleType);

    if(index != null) { // there is an existing vote
      this.submit[roleType] = true;
      this.votedIndex[roleType] = index;
    } else { // there was no existing vote
      this.submit[roleType] = false;
      this.votedIndex[roleType]= -1;
    }

    let i = 0;
    for(let speaker of speakers) {
      if(i === index) // there was a previous vote found so store the speaker name
        this.selectedSpeaker[roleType] = speaker.name;

      if (roleType != "big3") // we skip the "Role" column
        array.push({name: speaker.name, index: i++});
      else // we add the "Role" column
        array.push({role: speaker.role, name: speaker.name, index: i++});
    }
    return array;
  }

  showAlertSelect() {
    let alert = this.alertCtrl.create({
      title: 'Alert',
      subTitle: 'Please select at least one speaker',
      buttons: [{
        text:'OK'
      }]
    });
    alert.present();
  }

  showAlertSubmit(roleType: string) {
    let titleText: string;
    switch(roleType) {
      case "preparedSpeakers":
        titleText = "Prepared Speakers";
        break;

      case "ttSpeakers":
        titleText = "TT Speakers";
        break;

      case "evaluators":
        titleText = "Evaluators";
        break;

      case "big3":
        titleText = "Big 3";
        break;
    }

    let alert = this.alertCtrl.create({
      title: titleText,
      subTitle: 'Are you sure you want to submit your vote for '+ this.selectedSpeaker[roleType] +'?',
      buttons: [{
        text:'Yes',
        handler : data=>{
          this.submit[roleType] = true;
          firebase.database().ref('/roleBearers/' + roleType +'/'+this.votedIndex[roleType]+'/votes').transaction(function(snapshot) {
            return snapshot + 1;
          });
          Ballots.addToLocalStorage(roleType, this.votedIndex[roleType]);
        }
      },{
        text:'No'
      }]
    });
    alert.present();
  }

  submitVoteFor(roleType){
    if(this.selectedSpeaker[roleType] != null) {
      this.showAlertSubmit(roleType);
    } else {
      this.showAlertSelect();
    }
  }
  hasVotedFor(roleType){
    return this.submit[roleType];
  }
  makeSelection(roleType, speaker){
    this.selectedSpeaker[roleType] = speaker.name;
    this.votedIndex[roleType] = speaker.index;
  }

  static addToLocalStorage(name, value) {
    let object = {value: value, timestamp: new Date().getTime()};
    localStorage.setItem(name, JSON.stringify(object));
  }

  static getFromLocalStorage(name) {
    let object = localStorage.getItem(name);
    if(object == null) {
      return null;
    } else {
      let now = new Date().getTime();
      let cookie = JSON.parse(object);
      let timestamp = cookie.timestamp;
      if(now - timestamp > 60*60*1000 /*1 hour */) {
        localStorage.removeItem(name);
        return null;
      } else {
        return cookie.value;
      }
    }
  }
}
