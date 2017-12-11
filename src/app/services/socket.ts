import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import RTCConfigure from '../RTCConfigure'
import { Observable } from 'rxjs/Observable';

const socketDebugger = require('debug')('socket')

@Injectable()
export class SocketService {

  private socketSource: Subject<any> = new Subject();

  socketMission$: Observable<any> = this.socketSource.asObservable()

  peerConnection: RTCPeerConnection = new RTCPeerConnection(RTCConfigure)

  constructor() {
    this.peerConnection.onicecandidate = e => {
      if (e.candidate) {
        this.saveIceCandidate(e.candidate)
      }
    }
    this.peerConnection.oniceconnectionstatechange = e => {
      console.log('oniceconnectionstatechange', e)
    }
    this.peerConnection.addEventListener('track', e => {
      this.socketSource.next(e['streams'])
    })
  }

  createOffer(stream: MediaStream): Promise<RTCSessionDescriptionInit> {
    const pc = this.peerConnection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream)
    })
    return pc.createOffer({
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    }).then(desc => {
      pc.setLocalDescription(desc)
      return desc
    })
  }
  addIceCandidate(candidate) {
    return this.peerConnection.addIceCandidate(candidate)
      .then(() => {
        console.log('AddIceCandidate success.')
      })
      .catch(e => {
        console.error(e.message)
        throw e
      })
  }
  setRemoteDesc(sdp) {
    return this.peerConnection.setRemoteDescription({ type: 'answer', sdp })
  }

  createAnswer(stream: MediaStream, sdp) {
    const pc = this.peerConnection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream)
    })
    return pc.setRemoteDescription({ type: 'offer', sdp })
      .then(() => pc.createAnswer())
      .then(desc=> {
        pc.setLocalDescription(desc)
        return desc
      })
  }

  saveOffer(desc) {
    return fetch('/sdp', {
      method: "POST",
      credentials: "same-origin",
      headers: [
        ['Accept', 'application/json'],
        ['Content-Type', 'application/json']
      ],
      body: JSON.stringify({ type: 'offer', sdp: desc })
    })
      .then(res => res.json())
  }
  saveAnswer(desc) {
    return fetch('/sdp',
      {
        method: "POST",
        credentials: "same-origin",
        headers: [
          ['Accept', 'application/json'],
          ['Content-Type', 'application/json']
        ],
        body: JSON.stringify({ type: 'answer', sdp: desc })
      })
      .then(res => res.json())
  }
  getAnswer(uid) {
    return fetch(`/sdp?uid=${uid}&type=answer`, {
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
    return fetch(`/sdp?uid=${uid}&type=offer`, {
      method: "GET",
      credentials: "same-origin",
      headers: [
        ['Accept', 'application/json'],
        ['Content-Type', 'application/json']
      ],
    })
      .then(res => res.json())
  }
  saveIceCandidate(candidate: RTCIceCandidate) {
    return fetch('/candidate', {
      method: "POST",
      credentials: "same-origin",
      headers: [
        ['Accept', 'application/json'],
        ['Content-Type', 'application/json']
      ],
      body: JSON.stringify({ candidate: candidate.toJSON() })
    })
      .then(res => res.json())
  }
  getIceCandidate(uid) {
    return fetch('/candidate?uid=' + uid, {
      method: "GET",
      credentials: "same-origin",
      headers: [
        ['Accept', 'application/json'],
        ['Content-Type', 'application/json']
      ],
    })
      .then(res => res.json())
      .then(body => body.candidates)
  }
  fetchOwnIdentity() {
    return fetch('/uid', {
    })
      .then(res => res.json())
  }
}