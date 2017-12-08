import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';


import { MediaService } from './services/media'

@Component({
  selector: '#root',
  template: `
    <div class="app">
      <h2>{{title}}</h2>
      <div class="board">
        <fieldset>
          <legend>local</legend>
          <div>
            <stream-player [stream]="localStream"></stream-player>
          </div>
        </fieldset>
        <fieldset>
          <legend>remote</legend>
          <div>
            <stream-player [stream]="remoteStream"></stream-player>
          </div>
        </fieldset>
      </div>
      <action-box></action-box>
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
  providers: [MediaService]
})
export class AppComponent implements OnDestroy {
  title = 'webrtc classroom';
  localStream = null
  remoteStream = null

  localSubscription: Subscription

  constructor(private mediaService: MediaService) {
    this.localSubscription = this.mediaService.cameraMission$.subscribe(stream => {
      this.localStream = stream
    })
  }

  ngOnDestroy() {
    this.localSubscription.unsubscribe()
  }
}
