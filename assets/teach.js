const localVideo = document.getElementById('local-video')
const remoteVideo = document.getElementById('remote-video')
const answer = document.getElementById('answer')
const $remoteUser = document.getElementById('remote-user')

let pc
var ice = {
  "iceServers": [
    { "url": "stun:stun.l.google.com:19302" },
    { "url": "stun:stun.xten.com:3478" }]
};
var localStream
navigator.mediaDevices.getUserMedia({
  // audio: true,
  video: {
    width: 640,
    height: 480
  }
})
  .then(getLocalStream)

answer.addEventListener('click', function () {
  getRemoteOffer($remoteUser.value).then(offer => {
    pc = new RTCPeerConnection(ice);
    pc.setRemoteDescription({ type: 'offer', sdp: offer.sdp });
    pc.ontrack = function (e) {
      remoteVideo.srcObject = e.streams[0]
    };
    pc.addStream(localStream);

    pc.createAnswer(function (answer) {
      pc.setLocalDescription(answer);
      sendSDP(answer.type, answer.sdp);
    });
  })
})
function getLocalStream (stream) {
  localStream = stream
  localVideo.srcObject = stream
}

function sendSDP (type, sdp) {
  return fetch('/sdp/' + type,
    {
      method: "POST",
      credentials: "same-origin",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sdp
      })
    })
    .then(res => res.json())
}

function getRemoteOffer (remoteId) {
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