import { Component, Inject, Output, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms'

import { SocketService } from '../services/socket'

@Component({
  selector: 'dialogue',
  template: `
    <form action="" (submit)="onSubmit($event)">
      <input type="text" [(ngModel)]="preliminaryMessage" [ngModelOptions]="{standalone: true}">
      <div class="message-box">
        <div class="message-wrapper" *ngFor="let msg of messages">
          <span class="message-type">{{msg.type}}</span>
          <span class="message-content">{{msg.message}}</span>
          <span class="message-time">{{msg.timestamp}}</span>
        </div>
      </div>
    </form>
  `,
})
export default class ActionBoxComponent {

  preliminaryMessage = ''
  messages = []

  constructor(private socketService: SocketService) {
    this.socketService.signalMission$.subscribe(data => {
      this.messages.push(data)
    })
    this.socketService.connectionMission$.subscribe(data => {
      this.messages.push(data)
    })
  } 
  onSubmit(e) {
    e.preventDefault()
    this.socketService.sendMessage(this.preliminaryMessage)
  }
}