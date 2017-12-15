import { Injectable, Inject } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import TraceService from './trace'
import RTCConfigure from '../RTCConfigure'

@Injectable()
export class SocketService {

  private socketSource: Subject<any> = new Subject();
  private signalSource: Subject<any> = new Subject();

  socketMission$: Observable<any> = this.socketSource.asObservable()
  signalMission$: Observable<any> = this.signalSource.asObservable()
  connectionMission$: Observable<any> = this.signalSource.asObservable()

  peerConnection: RTCPeerConnection
  signalChannel: RTCDataChannel

  constructor(private traceService: TraceService) {
  }

  createPeerConnection() {
    const pc = this.peerConnection = new RTCPeerConnection(RTCConfigure)
    const trace = this.traceService.trace
    pc.addEventListener('addstream', e => {
      trace('addstream', 'id' + e['stream'].id)
    })
    pc.addEventListener('icecandidate', e => {
      const c = e['candidate']
      if (!c) return
      const protocol = c['protocol'],
        ip = c['ip'],
        port = c['port'],
        sdpMid = c['sdpMid']
      trace('icecandidate', `${protocol} ${sdpMid} ${ip}:${port}`)
    })
    pc.addEventListener('iceconnectionstatechange', e => {
      trace('iceconnectionstatechange', pc.iceConnectionState)
    })
    pc.addEventListener('icegatheringstatechange', e => {
      trace('icegatheringstatechange', e.target['iceGatheringState'])
    })
    pc.addEventListener('negotiationneeded', e => {
      trace('session negotiation')
    })
    pc.addEventListener('removestream', e => {
      trace('removestream', e)
    })
    pc.addEventListener('signalingstatechange', e => {
      trace('signalingstatechange', e.target['signalingState'])
    })
    pc.addEventListener('datachannel', e => {
      trace('datachannel added to the connection')
      const dc = this.signalChannel = e['channel']
      dc.addEventListener('close', e => {
        trace('datachannel close')
      })
      dc.addEventListener('error', e => {
        trace('dc error', e)
      })
      dc.addEventListener('message', e => {
        trace('dc message', e)
        this.onReceiveMessage(e['data'])
      })
      dc.addEventListener('open', e => {
        trace('datachannel open')
      })
    })
    pc.addEventListener('close', e => {
      trace('close', e)
    })
    pc.addEventListener('error', e => {
      trace('error', e)
    })
    pc.addEventListener('message', e => {
      trace('message', e)
    })
    pc.addEventListener('open', e => {
      trace('open', e)
    })
    pc.addEventListener('tonechange', e => {
      trace('tonechange', e)
    })
    pc.addEventListener('identityresult', e => {
      trace('identityresult', e)
    })
    pc.addEventListener('idpassertionerror', e => {
      trace('idpassertionerror', e)
    })
    pc.addEventListener('idpvalidationerror', e => {
      trace('idpvalidationerror', e)
    })
    pc.addEventListener('peeridentity', e => {
      trace('peeridentity', e)
    })
    pc.addEventListener('isolationchange', e => {
      trace('isolationchange', e)
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
        this.traceService.trace('candidate added success.')
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
      this.traceService.trace('dc close', e)
    })
    dc.addEventListener('error', e => {
      this.traceService.trace('dc error', e)
    })
    dc.addEventListener('message', e => {
      this.traceService.trace('dc message', e)
      this.onReceiveMessage(e['data'])
    })
    dc.addEventListener('open', e => {
      this.traceService.trace('dc open', e)
    })
  }
  sendMessage(message: string) {
    const wrapped = {
      message,
      timestamp: new Date().getTime()
    }
    this.signalSource.next(Object.assign({
      type: 'send'
    }, wrapped))
    this.signalChannel.send(JSON.stringify(wrapped))
  }
  onReceiveMessage(data) {
    data = JSON.parse(data)
    this.signalSource.next(Object.assign({
      type: 'receive'
    }, data))
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