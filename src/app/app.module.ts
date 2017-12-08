import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import TrackPlayer from './components/track-player';
import ActionBox from './components/action-box';
import { MediaService } from './services/media';

@NgModule({
  declarations: [
    AppComponent,
    TrackPlayer,
    ActionBox
  ],
  imports: [
    BrowserModule,
  ],
  providers: [MediaService],
  bootstrap: [AppComponent]
})
export class AppModule { }
