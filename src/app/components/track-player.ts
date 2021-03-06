import { Component, Input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';

@Component({
  selector: 'stream-player',
  template: `
    <video *ngIf="stream" #video autoplay="autoplay"></video>
    <span *ngIf="!stream">no exist stream</span>
  `,
  styles: [
    `
    video{
      max-width:100%;
    }
    `
  ]
})
export default class TrackPlayerComponent implements AfterViewChecked {

  prevStream = null
  @Input() stream: MediaStream;

  @ViewChild('video') video: ElementRef;

  ngAfterViewChecked() {
    if ((this.stream && !this.prevStream) || (this.stream && (this.prevStream.id != this.stream.id))) {
      this.video.nativeElement.srcObject = this.stream
    }
  }
}