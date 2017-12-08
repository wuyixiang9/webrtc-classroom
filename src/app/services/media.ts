import { Injectable } from '@angular/core';

@Injectable()
export class MediaService {
  openCamera(): Promise<MediaStreamTrack> {
    return navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => stream.getTracks()[0])
  }
  openMicrophone(): Promise<MediaStreamTrack> {
    return navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => stream.getTracks()[0])
  }
}