import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';


import { MediaService } from './services/media'
import { SocketService } from './services/socket'

@Component({
  selector: '#root',
  template: `
    <div class="app">
      <action-box></action-box>
      <div class="board">
        <fieldset>
          <legend>local {{ownUid}}</legend>
          <div>
            <stream-player [stream]="localStream"></stream-player>
          </div>
        </fieldset>
        <fieldset>
          <legend>remote {{adverseUid}}</legend>
          <div>
            <stream-player [stream]="remoteStream"></stream-player>
          </div>
        </fieldset>
        <fieldset>
          <legend>dataChannel</legend>
          <div>
            <dialogue></dialogue>
          </div>
        </fieldset>
      </div>
    </div>
  `,
  styles: [`
    .board {
      display:flex;
    }
    .board > fieldset{
      flex:1
    }
  `],
  providers: [MediaService, SocketService]
})
export class AppComponent implements OnDestroy {
  title = 'webrtc classroom';
  localStream = null
  remoteStream = null

  ownUid: string
  adverseUid: string

  localOpenSubscription: Subscription
  localCloseSubscription: Subscription

  constructor(private mediaService: MediaService, private socketService: SocketService) {
    this.localOpenSubscription = this.mediaService.cameraOpenMission$.subscribe(stream => {
      this.localStream = stream
    })
    this.localCloseSubscription = this.mediaService.cameraCloseMission$.subscribe(stream => {
      this.localStream = null
    })
    this.socketService.fetchOwnIdentity()
      .then(({ uid }) => this.ownUid = uid)
    this.socketService.socketMission$.subscribe(streams => {
      this.remoteStream = streams[0]
    })
  }

  ngOnDestroy() {
    this.localOpenSubscription.unsubscribe()
    this.localCloseSubscription.unsubscribe()
  }
}
