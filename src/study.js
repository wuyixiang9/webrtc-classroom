require('./styles/study.css')
require('webrtc-adapter')
const $localVideo = document.getElementById('local-video')
const remoteVideo = document.getElementById('remote-video')
const $call = document.getElementById('call')
const $connect = document.getElementById('connect')
const $remoteUser = document.getElementById('remote-user')

var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};
var ice = {
  "iceServers": [
    { "url": "stun:stun.l.google.com:19302" },
    { "url": "stun:stun.xten.com:3478" }]
};
var pc
let localStream
navigator.mediaDevices.getUserMedia({
  // audio: true,
  video: {
    width: 640,
    height: 480
  }
})
  .then(getLocalStream)
$connect.addEventListener('click', function () {
  getRemoteAnswer($remoteUser.value)
    .then(offer => {
      pc.setRemoteDescription({ type: 'answer', sdp: offer.sdp }, function () {
        console.log('success', ...arguments)
      });
    })
})
$call.addEventListener('click', function () {
  pc = new RTCPeerConnection(ice);
  pc.addStream(localStream)
  pc.createOffer(function (offer) {
    pc.setLocalDescription(offer);
  });
  pc.ontrack = function (e) {
    remoteVideo.srcObject = e.streams[0]
  };
  pc.oniceconnectionstatechange = function (evt) {
    console.log("ICE connection state change: " + evt.target.iceConnectionState);
  }
  pc.onicecandidate = function (evt) {
    if (evt.target.iceGatheringState == "complete") {
      pc.createOffer(function (offer) {
        sendSDP(offer)
      });
    }
  }
})
function getLocalStream (stream) {
  $localVideo.srcObject = stream
  localStream = stream
}

function sendSDP (offer) {
  return fetch('/sdp', {
    method: "POST",
    credentials: "same-origin",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(offer.toJSON())
  })
    .then(res => res.json())
}

function getRemoteAnswer (remoteId) {
  return fetch('/sdp?remoteId=' + remoteId, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())

}