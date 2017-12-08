import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import TrackPlayer from './components/track-player';
import ActionBox from './components/action-box';

@NgModule({
  declarations: [
    AppComponent,
    TrackPlayer,
    ActionBox
  ],
  imports: [
    BrowserModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
