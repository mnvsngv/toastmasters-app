import { Component } from '@angular/core';
import {AlertController,NavController } from 'ionic-angular';
//import * as firebase from "firebase";

@Component({
  selector: 'page-ballots',
  templateUrl: 'ballots.html',
})

export class Ballots {
  submitPrep:Boolean=false;
  submitTT:Boolean=false;
  submitEval:Boolean=false;
  submitBig3:Boolean=false;
  pspeaker: String;
  pindex: number;
  pspeakers: Array<{name: string, index: number}>;
  ttspeaker: String;
  ttindex: number;
  ttspeakers: Array<{name: string, index: number}>;
  espeaker: String;
  eindex: number;
  espeakers: Array<{name: string, index: number}>;
  bspeaker: String;
  bindex: number;
  bspeakers: Array<{role: string, name: string, index: number}>;

// result:Boolean=false;
  constructor(public navCtrl: NavController, public alertCtrl: AlertController) {
    let context = this;
    let firebaseRef = firebase.database().ref('/roleBearers');

    firebaseRef.once('value').then(function(snapshot) {
      let roleBearers = snapshot.val();

      let preparedSpeakers = roleBearers.preparedSpeakers;
      context.pspeakers = [];

      let index: number = context.getFromLocalStorage("preparedSpeaker");
      if(index != null) {
        context.submitPrep=true;
      }

      let i = 0;
      for(let speaker of preparedSpeakers) {
        if(i === index) context.pspeaker = speaker.name;
        context.pspeakers.push( {name: speaker.name, index: i++} );
      }

      let ttSpeakers = roleBearers.ttSpeakers;
      context.ttspeakers = [];

      index = context.getFromLocalStorage("ttSpeaker");
      if(index != null) {
        context.submitTT=true;
      }

      i = 0;
      for(let speaker of ttSpeakers) {
        if(i === index) context.ttspeaker = speaker.name;
        context.ttspeakers.push( {name: speaker.name, index: i++} );
      }

      let evaluators = roleBearers.evaluators;
      context.espeakers = [];

      index = context.getFromLocalStorage("evaluator");
      if(index != null) {
        context.submitEval=true;
      }

      i = 0;
      for(let speaker of evaluators) {
        if(i === index) context.espeaker = speaker.name;
        context.espeakers.push( {name: speaker.name, index: i++} );
      }

      let big3 = roleBearers.big3;
      context.bspeakers = [];

      index = context.getFromLocalStorage("big3");
      if(index != null) {
        context.submitBig3=true;
      }

      i = 0;
      for(let speaker of big3) {
        if(i === index) context.bspeaker = speaker.name;
        context.bspeakers.push( {role: speaker.role, name: speaker.name, index: i++} );
      }
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
              firebase.database().ref('/roleBearers/preparedSpeakers/'+this.pindex+'/votes').transaction(function(snapshot) {
                return snapshot + 1;
              });
              this.addToLocalStorage("preparedSpeaker", this.pindex);
              break;
            }
            case 'tt':{
              this.submitTT=true;
              firebase.database().ref('/roleBearers/ttSpeakers/'+this.ttindex+'/votes').transaction(function(snapshot) {
                return snapshot + 1;
              });
              this.addToLocalStorage("ttSpeaker", this.ttindex);
              break;
            }
            case 'eval':{
              this.submitEval=true;
              firebase.database().ref('/roleBearers/evaluators/'+this.eindex+'/votes').transaction(function(snapshot) {
                return snapshot + 1;
              });
              this.addToLocalStorage("evaluator", this.eindex);
              break;
            }
            case 'big3':{
              this.submitBig3=true;
              firebase.database().ref('/roleBearers/big3/'+this.bindex+'/votes').transaction(function(snapshot) {
                return snapshot + 1;
              });
              this.addToLocalStorage("big3", this.bindex);
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

      case 'big3':{
        if(this.bspeaker!=null){
          this.showAlertSubmit(sp,this.bspeaker);
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
      case 'big3':{
        return this.submitBig3;
      }
    }
  }
  voteP(p){
    this.pspeaker=p.name;
    this.pindex = p.index;
  }
  voteTT(p){
    this.ttspeaker=p.name;
    this.ttindex = p.index;
  }
  voteE(p){
    this.espeaker=p.name;
    this.eindex = p.index;
  }
  voteB(p){
    this.bspeaker=p.name;
    this.bindex = p.index;
  }


  addToLocalStorage(name, value) {
  let object = {value: value, timestamp: new Date().getTime()};
  localStorage.setItem(name, JSON.stringify(object));
}

  getFromLocalStorage(name) {
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
