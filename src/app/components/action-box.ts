import { Component, Inject, Output } from '@angular/core';

import { MediaService } from '../services/media'


@Component({
  selector: 'action-box',
  template: `
    <button (click)="onClickOpenCamera()" [disabled]="cameraSwitchState()">Open camera</button>  
  `,
  // providers: [MediaService]
})
export default class ActionBoxComponent {
  isOpenCamera = false

  constructor(private mediaService: MediaService) { }

  cameraSwitchState() {
    return this.isOpenCamera
  }

  onClickOpenCamera() {
    this.mediaService.openCamera()
      .then(stream => {
        this.isOpenCamera = true
      })
  }

}