import { Component } from '@angular/core';

@Component({
  selector: '#root',
  template: `
    <div class="app">
      <h2>{{title}}</h2>
      <div class="board">
        <fieldset>
          <legend>local</legend>
          <div>
          <track-player [track]="localTrack"></track-player>
          </div>
        </fieldset>
        <fieldset>
          <legend>remote</legend>
          <div>
          <track-player [track]="remoteTrack"></track-player>
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
  `]
})
export class AppComponent {
  title = 'webrtc classroom';
}
