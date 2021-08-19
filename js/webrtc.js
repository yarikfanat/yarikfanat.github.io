var webSocket=null;
var mediaConstraints = {
  audio: true,            
  video: {
    aspectRatio: {
      ideal: 1.0 
    }
  }
};

var myUsername = null;
var target_user = null;
var myPeerConnection = null;    // RTCPeerConnection
var transceiver = null;         // RTCRtpTransceiver
var webcamStream = null;        // MediaStream from webcam

function log(text) {
  var time = new Date();

  console.log("[" + time.toLocaleTimeString() + "] " + text);
}

function sendToServer(msg) {
  var msgJSON = JSON.stringify(msg);

  log("Sending '" + msg.type + "' message: " + msgJSON);
  webSocket.send(msgJSON);
}

async function invite(evt) {

  log("Стартую видеозвонок");
  if (myPeerConnection) {
  	if (confirm("Переинициализировать текущий видеозвонок?"))
    {
    	log ("Переинициализация текущего видеозвонка по запросу пользователя..");
    	hangUpCall();
    	invite();
    }
  } else {
 
    log("Inviting user " + target_user);
    log("Установка соединения с: " + target_user);
    createPeerConnection();

    try {
      webcamStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      document.getElementById("local_video").srcObject = webcamStream;
    } catch(err) {
      handleGetUserMediaError(err);
      return;
    }

    try {
      webcamStream.getTracks().forEach(
        transceiver = track => myPeerConnection.addTransceiver(track, {streams: [webcamStream]})
      );
    } catch(err) {
      handleGetUserMediaError(err);
    }
  }
}

async function createPeerConnection() {
  log("Настройка соединения...");

  myPeerConnection = new RTCPeerConnection({
    iceServers: [     
			      	{ 	urls: ["stun:stun.stunprotocol.org","stun:stun1.l.google.com:19302","stun:stun2.l.google.com:19302",
							   "stun:stun4.l.google.com:19302","stun:stun.ekiga.net","stun:stun.ideasip.com","stun:stun.rixtelecom.se",
							   "stun:stun.schlund.de"] 
					},
				    {
				      	urls: "turn:192.158.29.39:3478?transport=udp", 
				      	credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=', 
			     		username: '28224511:1379330808' 
				    },
				    {
				    	urls: 'turn:numb.viagenie.ca',
    					credential: 'muazkh',
    					username: 'webrtc@live.com'
				    },
				    {
					    url: 'turn:turn.bistri.com:80',
					    credential: 'homeo',
					    username: 'homeo'
					},
					{
					    url: 'turn:turn.anyfirewall.com:443?transport=tcp',
					    credential: 'webrtc',
					    username: 'webrtc'
					}
    			]

  });
  
  myPeerConnection.onicecandidate = handleICECandidateEvent;
  myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
  myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
  myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
  myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
  myPeerConnection.ontrack = handleTrackEvent;
}

function handleICECandidateEvent(event) {
  if (event.candidate) {
    log("*** Отправка ICE кандидатов: " + event.candidate.candidate);

    sendToServer({
      type: "new-ice-candidate",
      target: target_user,
      candidate: event.candidate,
      from_user: myUsername
    });
  }
}

function handleTrackEvent(event) {
  log("*** Track event");
  document.getElementById("received_video").srcObject = event.streams[0];
//  document.getElementById("hangup-button").disabled = false;

  sendToServer({
  	type: "hang-up-on",
    target: myUsername,
    from_user: myUsername});
}

async function handleNegotiationNeededEvent() {
 
  log("*** Negotiation needed");

  try {
    log("---> Creating offer");
    const offer = await myPeerConnection.createOffer();

    if (myPeerConnection.signalingState != "stable") {
      log("     -- The connection isn't stable yet; postponing...")
      return;
    }

    log("---> Setting local description to the offer");
    await myPeerConnection.setLocalDescription(offer);


    log("---> Отсылаю видео-предложение на удаленный узел");
    sendToServer({
      from_user: myUsername,
      target: target_user,
      type: "video-offer",
      sdp: myPeerConnection.localDescription
    });
  } catch(err) {
    log("*** The following error occurred while handling the negotiationneeded event:");
    reportError(err);
  };
}

function handleICEConnectionStateChangeEvent(event) {
  log("*** ICE connection state changed to " + myPeerConnection.iceConnectionState);

  switch(myPeerConnection.iceConnectionState) {
    case "closed":
    case "failed":
    case "disconnected":
      closeVideoCall();
      break;
  }
}

function handleSignalingStateChangeEvent(event) {
  log("*** WebRTC signaling state changed to: " + myPeerConnection.signalingState);
  switch(myPeerConnection.signalingState) {
    case "closed":
      closeVideoCall();
      break;
  }
}

function log_error(text) {
  var time = new Date();

  console.trace("[" + time.toLocaleTimeString() + "] " + text);
}

function handleICEGatheringStateChangeEvent(event) {
  log("*** ICE gathering state changed to: " + myPeerConnection.iceGatheringState);
  if (myPeerConnection.iceGatheringState=='complete')
  	  applyAspectRatio ();
}

function reportError(errMessage) {
  log_error(`Error ${errMessage.name}: ${errMessage.message}`);
}

function handleGetUserMediaError(e) {
  log_error(e);
  switch(e.name) {
    case "NotFoundError":
      alert("Не могу начать видеозвонок, так как не обнаружены камера/микрофон");
      break;
    case "SecurityError":
    case "PermissionDeniedError":

      break;
    default:
      alert("Ошибка открытия вашей камеры/микрофона: " + e.message);
      break;
  }

  closeVideoCall();
}

function closeVideoCall() {
  var localVideo = document.getElementById("local_video");

  log("Closing the call");

  if (myPeerConnection) {
    log("--> Closing the peer connection");

    myPeerConnection.ontrack = null;
    myPeerConnection.onnicecandidate = null;
    myPeerConnection.oniceconnectionstatechange = null;
    myPeerConnection.onsignalingstatechange = null;
    myPeerConnection.onicegatheringstatechange = null;
    myPeerConnection.onnotificationneeded = null;

    myPeerConnection.getTransceivers().forEach(transceiver => {
      transceiver.stop();
    });

    if (localVideo.srcObject) {
      localVideo.pause();
      localVideo.srcObject.getTracks().forEach(track => {
        track.stop();
      });
    }

    myPeerConnection.close();
    myPeerConnection = null;
    webcamStream = null;
  }
  sendToServer({
  	type: "hang-up-off",
    target: myUsername,
    from_user: myUsername});
//  document.getElementById("hangup-button").disabled = true;
}

async function handleVideoOfferMsg(msg) {
  target_user = msg.from_user;

  log("Received video chat offer from " + target_user);
  if (!myPeerConnection) {
    createPeerConnection();
  }

  var desc = new RTCSessionDescription(msg.sdp);

  if (myPeerConnection.signalingState != "stable") {
    log("  - But the signaling state isn't stable, so triggering rollback");

    await Promise.all([
      myPeerConnection.setLocalDescription({type: "rollback"}),
      myPeerConnection.setRemoteDescription(desc)
    ]);
    return;
  } else {
    log ("  - Setting remote description");
    await myPeerConnection.setRemoteDescription(desc);
  }

  if (!webcamStream) {
    try {
      webcamStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    } catch(err) {
      handleGetUserMediaError(err);
      return;
    }

    document.getElementById("local_video").srcObject = webcamStream;

    try {
      webcamStream.getTracks().forEach(
        transceiver = track => myPeerConnection.addTransceiver(track, {streams: [webcamStream]})
      );
    } catch(err) {
      handleGetUserMediaError(err);
    }
  }
 
  log("---> Отправка видео-ответа вызывающему");

  await myPeerConnection.setLocalDescription(await myPeerConnection.createAnswer());

  sendToServer({
    from_user: myUsername,
    target: target_user,
    type: "video-answer",
    sdp: myPeerConnection.localDescription
  });
}

async function handleVideoAnswerMsg(msg) {
  log("*** Call recipient has accepted our call");

  var desc = new RTCSessionDescription(msg.sdp);
  await myPeerConnection.setRemoteDescription(desc).catch(reportError);
}

async function handleNewICECandidateMsg(msg) {
  var candidate = new RTCIceCandidate(msg.candidate);

  log("*** Добавляю принятых ICE кандидатов: " + JSON.stringify(candidate));
  try {
    await myPeerConnection.addIceCandidate(candidate)
  } catch(err) {
    reportError(err);
  }
} 

function handleHangUpMsg(msg) {
  log("*** Принято hang up сообщение от удаленного узла");

  closeVideoCall();
}

function hangUpCall() {
 var msg={
  	from_user: myUsername,
    target: target_user,
    type: "hang-up"
  };

  closeVideoCall();
  sendToServer(msg);
}

function applyAspectRatio () {
	var supports = navigator.mediaDevices.getSupportedConstraints();
	
	console.log ('supports contraints->',supports);
	if (!supports["width"]) {

		console.log ('getSupportedConstraints() :ограничение ["width"] не поддерживается ');
		return ;
	}
	var received_video = document.getElementById ('received_video');

	console.log ('Установка  параметров <Receive видео> :width=',received_video.clientWidth,' height=',received_video.clientHeight);
	try {
			received_video.srcObject.getVideoTracks().forEach((track)=> {
				track.applyConstraints({
					width: {ideal:received_video.clientWidth},
					height: {ideal:received_video.clientHeight},
				})
				.then (()=> {
					console.log ('Sucessfull applyConstraints width=',received_video.clientWidth,'Height=',received_video.clientHeight);

				})
				.catch (e => {
					console.log ('The constraints could not be satisfied by the available devices');
    					// The constraints could not be satisfied by the available devices.
  				});

			});
	} catch (err) {

		console.error('Ошибка при установке новых настроек экрана Receive видео->', err.message);
	}
}