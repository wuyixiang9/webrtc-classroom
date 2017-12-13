import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import RTCConfigure from '../RTCConfigure'
import { Observable } from 'rxjs/Observable';

const socketDebugger = require('debug')('socket')

@Injectable()
export class SocketService {

  private socketSource: Subject<any> = new Subject();
  private signalSource: Subject<any> = new Subject();

  socketMission$: Observable<any> = this.socketSource.asObservable()
  signalMission$: Observable<any> = this.signalSource.asObservable()

  peerConnection: RTCPeerConnection
  signalChannel: RTCDataChannel

  constructor() {

  }

  createPeerConnection() {
    const pc = this.peerConnection = new RTCPeerConnection(RTCConfigure)
    pc.addEventListener('addstream', e => {
      console.log('addstream', e)
    })
    pc.addEventListener('icecandidate', e => {
      console.log('icecandidate', e)
    })
    pc.addEventListener('iceconnectionstatechange', e => {
      console.log('iceconnectionstatechange', e)
    })
    pc.addEventListener('icegatheringstatechange', e => {
      console.log('icegatheringstatechange', e)
    })
    pc.addEventListener('negotiationneeded', e => {
      console.log('negotiationneeded', e)
    })
    pc.addEventListener('removestream', e => {
      console.log('removestream', e)
    })
    pc.addEventListener('signalingstatechange', e => {
      console.log('signalingstatechange', e)
    })
    pc.addEventListener('datachannel', e => {
      console.log('datachannel', e)
      const dc = this.signalChannel = e['channel']
      dc.addEventListener('close', e => {
        console.log('dc close', e)
      })
      dc.addEventListener('error', e => {
        console.log('dc error', e)
      })
      dc.addEventListener('message', e => {
        console.log('dc message', e)
        this.onReceiveMessage(e['data'])        
      })
      dc.addEventListener('open', e => {
        console.log('dc open', e)
      })
    })
    pc.addEventListener('close', e => {
      console.log('close', e)
    })
    pc.addEventListener('error', e => {
      console.log('error', e)
    })
    pc.addEventListener('message', e => {
      console.log('message', e)
    })
    pc.addEventListener('open', e => {
      console.log('open', e)
    })
    pc.addEventListener('tonechange', e => {
      console.log('tonechange', e)
    })
    pc.addEventListener('identityresult', e => {
      console.log('identityresult', e)
    })
    pc.addEventListener('idpassertionerror', e => {
      console.log('idpassertionerror', e)
    })
    pc.addEventListener('idpvalidationerror', e => {
      console.log('idpvalidationerror', e)
    })
    pc.addEventListener('peeridentity', e => {
      console.log('peeridentity', e)
    })
    pc.addEventListener('isolationchange', e => {
      console.log('isolationchange', e)
    })
    pc.addEventListener('icecandidate', e => {
      if (e.candidate) {
        this.saveIceCandidate(e.candidate)
      }
    })
    pc.addEventListener('track', e => {
      this.socketSource.next(e['streams'])
    })
  }

  destoryPeerConnection() {
    if (this.peerConnection)
      this.peerConnection.close()
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
      .then(desc => {
        pc.setLocalDescription(desc)
        return desc
      })
  }

  createDataChannel() {
    const pc = this.peerConnection
    const dc = this.signalChannel = pc.createDataChannel('signal-channel')
    dc.addEventListener('close', e => {
      console.log('dc close', e)
    })
    dc.addEventListener('error', e => {
      console.log('dc error', e)
    })
    dc.addEventListener('message', e => {
      console.log('dc message', e)
      this.onReceiveMessage(e['data'])
    })
    dc.addEventListener('open', e => {
      console.log('dc open', e)
    })
  }
  sendMessage(message: string) {
    this.signalSource.next({ send: message })
    this.signalChannel.send(message)
  }
  onReceiveMessage(message: string) {
    this.signalSource.next({ receive: message })
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
      method: "GET",
      credentials: "same-origin",
      headers: [
        ['Accept', 'application/json'],
        ['Content-Type', 'application/json']
      ]
    })
      .then(res => res.json())
  }
}