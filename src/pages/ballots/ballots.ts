import { Component } from '@angular/core';
import { AlertController, NavController } from 'ionic-angular';
import firebase from 'firebase';

@Component({
  selector: 'page-ballots',
  templateUrl: 'ballots.html',
})


export class Ballots {
  // "Model" items to store the data that will be bound to the View:
  // Arrays to keep track of voting history
  submit:Array<{[index: string]: boolean}>;
  selectedSpeaker: Array<{[index: string]: string}>;

  // Arrays to store all the names of the speakers
  preparedSpeakers: Array<{name: string, index: number}>;
  ttSpeakers: Array<{name: string, index: number}>;
  evaluators: Array<{name: string, index: number}>;
  big3: Array<{role: string, name: string, index: number}>;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController) {
    // Initialize empty arrays so that they are not "undefined" when used
    this.submit = [];
    this.selectedSpeaker = [];

    // Setup the speaker sections with listeners and perform data sanity
    this.setupSpeakers("preparedSpeakers");
    this.setupSpeakers("ttSpeakers");
    this.setupSpeakers("evaluators");
    this.setupSpeakers("big3");
  }

  setupSpeakers(roleType: string) {
    // Check if there is an existing vote from the user
    let votedName = Ballots.getFromLocalStorage(roleType);

    if(votedName != null)// there is an existing vote
      this.submit[roleType] = true;
    else // there was no existing vote
      this.submit[roleType] = false;

    // We set up context as "this" so we can reference the correct
    // object inside the firebase method
    let context = this;

    // set up listeners
    firebase.database().ref('master/roleBearers/' + roleType).on('value', function(snapshot) {
      context.updateSpeakers(roleType, snapshot.val());

      if(!context.submit[roleType]) // if we haven't already voted...
        context.selectedSpeaker[roleType] = undefined; // ...then deselect current selection
      else // we have already voted...
        context.selectedSpeaker[roleType] = votedName; // ...so show the previous vote
    });
  }

  updateSpeakers(roleType, speakers) {
    switch(roleType) {
      case "preparedSpeakers":
        this.preparedSpeakers = speakers;
        break;

      case "ttSpeakers":
        this.ttSpeakers = speakers;
        break;

      case "evaluators":
        this.evaluators = speakers;
        break;

      case "big3":
        this.big3 = speakers;
        break;
    }
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
        handler: data => {
          this.submit[roleType] = true;
          firebase.database().ref('master/roleBearers/votes/' + roleType +'/' + this.selectedSpeaker[roleType]).transaction(function(snapshot) {
            return snapshot + 1;
          });
          Ballots.addToLocalStorage(roleType, this.selectedSpeaker[roleType]);
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
      if(now - timestamp > 60*60*1000 /* 1 hour */) {
        localStorage.removeItem(name);
        return null;
      } else {
        return cookie.value;
      }
    }
  }
}
