import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import 'webrtc-adapter'

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
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
