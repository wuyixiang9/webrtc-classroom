import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MediaService {

  private cameraOpenSource = new Subject();
  private cameraCloseSource = new Subject();
  private openedStream: MediaStream

  cameraOpenMission$ = this.cameraOpenSource.asObservable();
  cameraCloseMission$ = this.cameraCloseSource.asObservable();

  openCamera(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({ video: { width: 640 }, audio: true })
      .then(stream => {
        this.openedStream = stream
        this.cameraOpenSource.next(stream)
        return stream
      })
  }
  closeCamera(): Promise<MediaStream> {
    this.openedStream.getTracks().forEach(track => track.stop())
    this.cameraCloseSource.next(this.openedStream)
    return Promise.resolve(this.openedStream)
  }
}