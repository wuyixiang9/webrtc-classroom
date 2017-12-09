import { Component, Inject, Output } from '@angular/core';

import { MediaService } from '../services/media'
import { SocketService } from '../services/socket'

@Component({
  selector: 'action-box',
  template: `
    <button (click)="onClickOpenCamera()" [disabled]="isOpenCamera">Open camera</button>  
    <button (click)="onClickCloseCamera()" [disabled]="!isOpenCamera">Close camera</button>  
    <button (click)="onClickRequestServer()" [disabled]="">Request</button>
  `,
  // providers: [MediaService]
})
export default class ActionBoxComponent {
  isOpenCamera = false

  localStream: MediaStream

  peerConnection: RTCPeerConnection

  constructor(private mediaService: MediaService, private socketService: SocketService) {

    this.socketService.socketMission$.subscribe(offer => {
      this.socketService.sendSDP(offer)
    })
  }

  onClickOpenCamera() {
    this.mediaService.openCamera()
      .then(stream => {
        this.localStream = stream
        this.isOpenCamera = true
      })
  }

  onClickCloseCamera() {
    this.mediaService.closeCamera()
      .then(stream => {
        this.localStream = null
        this.isOpenCamera = false
      })
  }

  onClickRequestServer() {
    this.peerConnection = this.socketService.createICECandidate(this.localStream)
  }
}