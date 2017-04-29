import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Ballots } from './ballots';

@NgModule({
  declarations: [
    Ballots,
  ],
  imports: [
    IonicPageModule.forChild(Ballots),
  ],
  exports: [
    Ballots
  ]
})
export class BallotsModule {}
