import { Component, Inject, Output, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms'

import { MediaService } from '../services/media'
import { SocketService } from '../services/socket'

@Component({
  selector: 'action-box',
  template: `
    <label>
      <select [(ngModel)]="selected.camera">
        <option *ngFor="let device of cameraDevices" [value]="device.deviceId">{{device.label || device.deviceId}}</option>
      </select>
    </label>
    <label>
      <select [(ngModel)]="selected.microphone">
        <option *ngFor="let device of microphoneDevices" [value]="device.deviceId">{{device.label || device.deviceId}}</option>
      </select>
    </label>
    <button (click)="onClickOpen()" [disabled]="isOpen">Open</button>  
    <button (click)="onClickClose()" [disabled]="!isOpen">Close</button>  
    <button (click)="onClickRequestServer()" [disabled]="">Request</button>
    <button (click)="onClickRespondOffer()" [disabled]="">Respond</button>
    <button (click)="onClickReceiveAnwser()" [disabled]="">Receive</button>
  `,
  // providers: [MediaService]
})
export default class ActionBoxComponent implements OnInit {
  isOpen = false
  selected = {
    camera: undefined,
    microphone: undefined
  }
  localStream: MediaStream
  cameraDevices: MediaDeviceInfo[]
  microphoneDevices: MediaDeviceInfo[]

  constructor(private mediaService: MediaService, private socketService: SocketService) {

  }

  ngOnInit() {
    this.mediaService.enumerateCameras()
      .then(devices => {
        this.cameraDevices = devices
        this.selected.camera = devices[0]
      })
    this.mediaService.enumerateMicrophone()
      .then(devices => {
        this.microphoneDevices = devices
        this.selected.microphone = devices[0]
      })
  }
  onClickOpen() {
    const [cameraDevice] = this.getDeviceInfoById(this.cameraDevices, this.selected.camera)
    const [microphoneDevice] = this.getDeviceInfoById(this.microphoneDevices, this.selected.microphone)
    this.mediaService.open(cameraDevice, microphoneDevice)
      .then(stream => {
        this.localStream = stream
        this.isOpen = true
      })
  }
  onClickClose() {
    this.mediaService.close()
      .then(stream => {
        this.socketService.destoryPeerConnection()
        this.localStream = null
        this.isOpen = false
      })
  }

  onClickRequestServer() {
    this.socketService.createPeerConnection()
    this.socketService.createOffer(this.localStream)
      .then(({ sdp }) => {
        this.socketService.saveOffer(sdp)
      })
  }

  onClickRespondOffer() {
    this.socketService.createPeerConnection()
    const uid = prompt('enter adverse uid')
    this.socketService.getOffer(uid)
      .then(({ sdp }) => {
        this.socketService.getIceCandidate(uid)
          .then(candidates => {
            candidates.map(icecandidate => this.socketService.addIceCandidate(icecandidate))
          })
        this.socketService.createAnswer(this.localStream, sdp)
          .then(desc => {
            this.socketService.saveAnswer(desc.sdp)
          })
      })
  }

  onClickReceiveAnwser() {
    const uid = prompt('enter adverse uid')
    this.socketService.getAnswer(uid)
      .then(({ sdp }) => {
        this.socketService.getIceCandidate(uid)
          .then(candidates => {
            candidates.map(icecandidate => this.socketService.addIceCandidate(icecandidate))
          })
        this.socketService.setRemoteDesc(sdp)
      })
  }

  getDeviceInfoById(deviceInfos: MediaDeviceInfo[], deviceId: string): MediaDeviceInfo[] {
    return deviceInfos.filter(device => device.deviceId === deviceId)
  }
}