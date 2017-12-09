import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import RTCConfigure from '../RTCConfigure'
import { Observable } from 'rxjs/Observable';

const socketDebugger = require('debug')('socket')

@Injectable()
export class SocketService {

  private socketSource = new Subject();

  socketMission$: Observable<any> = this.socketSource.asObservable()

  peerConnection: RTCPeerConnection = new RTCPeerConnection(RTCConfigure)

  constructor() {
    this.peerConnection.ontrack = function (e) {
      console.log(arguments)
    };
  }

  createLocalDesc(stream: MediaStream): Promise<RTCSessionDescriptionInit> {
    const pc = this.peerConnection
    pc.addStream(stream)
    return pc.createOffer({
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    }).then(desc => {
      pc.setLocalDescription(desc)
      return desc
    })
  }
  // TODO 最后一步设定没有成功
  setRemoteDesc(sdp) {
    return this.peerConnection.setRemoteDescription({ type: 'answer', sdp })
  }

  createAnswer(stream: MediaStream, offer) {
    const pc = this.peerConnection
    pc.setRemoteDescription({ type: 'offer', sdp: offer.sdp })
    pc.addStream(stream)

    return pc.createAnswer()
  }

  sendSDP(desc) {
    return fetch('/sdp', {
      method: "POST",
      credentials: "same-origin",
      headers: [
        ['Accept', 'application/json'],
        ['Content-Type', 'application/json']
      ],
      body: JSON.stringify(desc.toJSON())
    })
      .then(res => res.json())
  }
  sendAnwser({ type = 'answer', sdp }) {
    this.peerConnection.setRemoteDescription({ type: 'offer', sdp });
    return fetch('/sdp',
      {
        method: "POST",
        credentials: "same-origin",
        headers: [
          ['Accept', 'application/json'],
          ['Content-Type', 'application/json']
        ],
        body: JSON.stringify({
          type,
          sdp
        })
      })
      .then(res => res.json())
  }
  getAnwser(uid) {
    return fetch('/sdp?uid=' + uid, {
      method: "GET",
      credentials: "same-origin",
      headers: [
        ['Accept', 'application/json'],
        ['Content-Type', 'application/json']
      ],
    })
      .then(res => res.json())
  }
  getOffer(uid) {
    return fetch('/sdp?uid=' + uid, {
      method: "GET",
      credentials: "same-origin",
      headers: [
        ['Accept', 'application/json'],
        ['Content-Type', 'application/json']
      ],
    })
      .then(res => res.json())
  }
  fetchOwnIdentity() {
    return fetch('/uid', {
    })
      .then(res => res.json())
  }
}