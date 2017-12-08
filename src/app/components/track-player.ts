import { Component, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'track-player',
  template: `
    <video *ngIf="track" #video autoplay="autoplay"></video>
    <span *ngIf="!track">no exist track</span>
  `
})
export default class TrackPlayerComponent {

  @Input() track: MediaStreamTrack;

  @ViewChild('video') video: ElementRef;

  ngOnChanges() {
    if (this.track) {
      this.video.nativeElement.srcObject = this.track
    }
  }
}