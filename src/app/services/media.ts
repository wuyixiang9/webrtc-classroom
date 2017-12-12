import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MediaService {

  private cameraOpenSource = new Subject();
  private cameraCloseSource = new Subject();
  private openedStream: MediaStream

  cameraOpenMission$ = this.cameraOpenSource.asObservable();
  cameraCloseMission$ = this.cameraCloseSource.asObservable();

  enumerateCameras() {
    return navigator.mediaDevices.enumerateDevices()
      .then(devices => devices.filter(device => device.kind === 'videoinput'))
  }
  enumerateMicrophone() {
    return navigator.mediaDevices.enumerateDevices()
      .then(devices => devices.filter(device => device.kind === 'audioinput'))
  }

  open(video: MediaDeviceInfo, audio: MediaDeviceInfo): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      video: { width: 640, deviceId: video && video.deviceId },
      audio: { deviceId: audio && audio.deviceId },
    })
      .then(stream => {
        this.openedStream = stream
        this.cameraOpenSource.next(stream)
        return stream
      })
  }
  close(): Promise<MediaStream> {
    this.openedStream.getTracks().forEach(track => track.stop())
    this.cameraCloseSource.next(this.openedStream)
    return Promise.resolve(this.openedStream)
  }
}