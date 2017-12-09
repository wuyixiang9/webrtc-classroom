import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import RTCConfigure from '../RTCConfigure'
import { Observable } from 'rxjs/Observable';

const socketDebugger = require('debug')('socket')

@Injectable()
export class SocketService {

  private socketSource = new Subject();

  socketMission$: Observable<any> = this.socketSource.asObservable()

  createICECandidate(stream: MediaStream) {
    const pc = new RTCPeerConnection(RTCConfigure);
    pc.addStream(stream)
    pc.createOffer(function (offer) {
      pc.setLocalDescription(offer);
    });
    pc.oniceconnectionstatechange = function (evt) {
      socketDebugger("ICE connection state change: " + evt.target);
    }
    pc.addEventListener('icecandidate', evt => {
      socketDebugger('ICE connection gathering state: ' + evt.target.iceGatheringState)
      if (evt.target.iceGatheringState == "complete") {
        pc.createOffer(offer => {
          this.socketSource.next(offer)
        });
      }
    })
    return pc
  }

  sendSDP(offer: RTCSessionDescription) {
    return fetch('/sdp', {
      method: "POST",
      credentials: "same-origin",
      headers: [
        ['Accept', 'application/json'],
        ['Content-Type', 'application/json']
      ],
      body: JSON.stringify(offer.toJSON())
    })
      .then(res => res.json())
  }
}