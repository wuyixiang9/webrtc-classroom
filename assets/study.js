const $localVideo = document.getElementById('local-video')
const remoteVideo = document.getElementById('remote-video')
const $call = document.getElementById('call')

var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};

let localStream
navigator.mediaDevices.getUserMedia({
  // audio: true,
  video: {
    width: 640,
    height: 480
  }
})
  .then(getLocalStream)

$call.addEventListener('click', function () {
  var pc = new RTCPeerConnection({});
  pc.addStream(localStream)
  pc.createOffer(function (offer) {
    pc.setLocalDescription(offer)
    sendSDP(offer.type, offer.sdp)
  })
})
function getLocalStream(stream) {
  $localVideo.srcObject = stream
  localStream = stream
}

function sendSDP(type, sdp) {
  var data = new FormData();
  data.append("sdp", sdp);
  fetch('/sdp/' + type,
    {
      method: "POST",
      body: data
    })
    .then(function (res) { return res.json(); })
    .then(function (data) { alert(JSON.stringify(data)) })
}