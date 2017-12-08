import { Component, Input, ViewChild, ElementRef } from '@angular/core';

import { MediaService } from '../services/media'


@Component({
  selector: 'action-box',
  template: `
    <button (click)="onClickOpenCamera">Open camera</button>  
  `,
})
export default class ActionBoxComponent {
  isOpenCamera = false

  constructor(private mediaService: MediaService) { }

  // cameraSwitchState() {
  //   return this.isOpenCamera
  // }

  onClickOpenCamera() {
    this.mediaService.openCamera()
      .then(track => {
        this.isOpenCamera = true
      })
  }

}