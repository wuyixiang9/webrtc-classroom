import { Component, Inject, Output, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms'

import { SocketService } from '../services/socket'

@Component({
  selector: 'dialogue',
  template: `
    <form action="" (submit)="onSubmit($event)">
      <input type="text" [(ngModel)]="preliminaryMessage" [ngModelOptions]="{standalone: true}">
    </form>
  `,
  providers: [SocketService]
})
export default class ActionBoxComponent {

  preliminaryMessage = ''
  messages

  constructor(private socketService: SocketService) {
    this.socketService.signalMission$.subscribe(data => {
      console.log(data)
    })
  }

  onSubmit(e) {
    e.preventDefault()
    this.socketService.sendMessage(this.preliminaryMessage)
  }
}