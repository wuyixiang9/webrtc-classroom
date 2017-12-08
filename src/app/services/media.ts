import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MediaService {

  private cameraMissionSource = new Subject();

  cameraMission$ = this.cameraMissionSource.asObservable();

  openCamera(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.cameraMissionSource.next(stream)
        return stream
      })
  }
  closeCamera() {

  }
}