const localVideo = document.getElementById('local-video')
const remoteVideo = document.getElementById('remote-video')

navigator.mediaDevices.getUserMedia({
  // audio: true,
  video: {
    width: 640,
    height: 480
  }
})
  .then(getLocalStream)

function getLocalStream(stream) {
  localVideo.srcObject = stream
}