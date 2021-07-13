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
var myPeerConnection = null;    // RTCPeerConnection
var transceiver = null;         // RTCRtpTransceiver
var webcamStream = null;        // MediaStream from webcam
var target_user=null;

var msg_connect = {
	type:'connect_user',
	user_name:null,
	func:null
};

function log(text) {
  var time = new Date();

  console.log("[" + time.toLocaleTimeString() + "] " + text);
}

function sendToServer(msg) {
  var msgJSON = JSON.stringify(msg);

  log("Sending '" + msg.type + "' message: " + msgJSON);
  webSocket.send(msgJSON);
}

function connect() {
	var scheme = "ws";
	var serverUrl;

	var myHostname = window.location.hostname;
	if (!myHostname) {
  		myHostname = "localhost";
	}
	log("Hostname: " + myHostname);

	if (document.location.protocol === "https:") {
	  	scheme += "s";
	}
	serverUrl = scheme + "://" + myHostname + ":8080";
	serverUrl = scheme+"://7727a4490a71.ngrok.io"
//    serverUrl = scheme+"://my-node-serverjs.appspot.com"
  	log(`Connecting to server: ${serverUrl}`);
	webSocket = new WebSocket(serverUrl);

	webSocket.onopen = ()=> {
	
		console.log ('connection_open ..');
		myUsername = msg_connect.user_name = user_name;
		if (msg_connect.user_name=='yarikfanat')
			msg_connect.func = 'trainer';
		else
			msg_connect.func = 'client';
		
		webSocket.send(JSON.stringify(msg_connect));
		ShowChat ();	
	};

	webSocket.onmessage = (event)=> {
		  	
		var text = "";
		var msg = JSON.parse(event.data);			

		switch(msg.type) {
		   	case "user_list":
		      console.log ('получено сообщение ',msg.list);
		      CreateUserList (msg.list);
		      break;
			   
		    case "message":
		    var chatbox = document.getElementById("chat_win");
		  
		      text =  '<span style="color:red">'+msg.date+'</span>'+'<span style="color:blue">&nbsp'+msg.from_user+'=>&nbsp</span>'+msg.text+'<br>';
		      chatbox.innerHTML += text;
		      chatbox.scrollTop = chatbox.scrollHeight - chatbox.clientHeight;

		      break;	
		    case "video-offer":  
		      handleVideoOfferMsg(msg);
		      break;

		    case "video-answer":  
		      handleVideoAnswerMsg(msg);
	          break;
		    case "new-ice-candidate": 
		      handleNewICECandidateMsg(msg);
		      break;

		    case "hang-up": 
		      handleHangUpMsg(msg);
		      break;		         
			    
	  	}
	  	
	};
}

function handleSendButton () {
	var msg = {
	    type: "message_touser",
	    text: document.getElementById("text_chat").value,
	    target:target_user,
	    from_user:msg_connect.user_name
	};
	
	if (!target_user)		
		return;
	console.log ('target user=>',target_user);
	
	webSocket.send(JSON.stringify(msg));
	var d = new Date();
	var date = d.toLocaleDateString()+' '+d.toLocaleTimeString();
	var chatbox = document.getElementById("chat_win");
	var text =  '<span style="color:red">'+date+'</span>'+
	            '<span style="background-color:rgb(166,210,255);color:black;font-style:italic;padding:7px;border-radius:8px;line-height:2.2">&nbsp'+msg.text+
	            '</span><br>';

	chatbox.innerHTML += text;
	chatbox.scrollTop = chatbox.scrollHeight - chatbox.clientHeight;
	document.getElementById("text_chat").value = "";
	  	
}

function CreateUserList (user_list) {
	var users,user,elem,user_name;

	users = document.getElementById("userslist");
	while (users.firstChild) {
	  users.removeChild(users.firstChild);
	}

	user_list.forEach((client)=> {
		elem = document.createElement("li");
		elem.onclick = SelectUser;
		elem = users.appendChild (elem);
		user_name = document.createTextNode(client);
		elem.appendChild (user_name);
	});
	if (user_list.length)
	{
		target_user = user_list[0];
		document.getElementById("text_chat").disabled = false;
    	document.getElementById("send").disabled = false;
    	document.getElementById("VideoCall").disabled = false;
	}else
	{
		target_user = null;
		document.getElementById("text_chat").disabled = true;
    	document.getElementById("send").disabled = true;
    	document.getElementById("VideoCall").disabled = true;
	}
}

function SelectUser (evt) {

	evt.target.style.color = 'blue';
	target_user = evt.target.textContent;

	var users = document.getElementById("userslist");
	for (var i = 0; i < users.children.length; i++) 
	{
		if (users.children[i].textContent != target_user)
		{
			users.children[i].style.color = 'rgb(125,125,125)';
		}
	}
}

function handleKey2(evt) {
  if (evt.keyCode === 13 || evt.keyCode === 14) {
    if (!document.getElementById("send").disabled) {
      handleSendButton();
    }
  }
}

function ChoiceChat(event) {
	var video_chat,txt_chat,head_camera,head_chat,style,z_ind;
	var styleElem,head_users,users_list,controls;
	var container = document.getElementById ('chat');

	if (event.target.id=='head_chat')
	{
		txt_chat = document.getElementById ('chat_win');	
		style = window.getComputedStyle (txt_chat,null);

		if (style.getPropertyValue ('display')=='none')
		{ //активируем текстовый чат
			styleElem = document.head.appendChild(document.createElement("style"));
			head_camera = document.getElementById ('head_camera');
			head_camera.style.backgroundColor = 'rgb(201,201,201)';
			event.target.style.backgroundColor = 'rgb(106,181,255)';
			styleElem.insertAdjacentHTML('beforeend', "#"+event.target.id+":after {border-color:  rgb(106,181,255) transparent transparent transparent;}");
			styleElem.insertAdjacentHTML('beforeend', "#head_camera:after {border-color:  rgb(201,201,201) transparent transparent transparent;}");

			

			container.style.gridTemplateAreas = '"head-chat head-camera" "chatbox chatbox" "head-users head-users" "userslistbox userslistbox" "chat_controls chat_controls"';
			container.style.gridTemplateRows = 'auto 100px auto 80px 1fr';
			txt_chat.style.display = 'block';
			head_users = document.getElementById ("head_users");
			head_users.style.display = 'block';
			users_list = document.getElementById ("userslist");
			users_list.style.display = 'block';
			controls = document.getElementById ("controls");
			controls.style.display = 'block';

			video_chat = document.getElementById ('camera_win');
			video_chat.style.display = 'none';
		}
	}
	if (event.target.id=='head_camera')
	{
		video_chat = document.getElementById ('camera_win');
		style = window.getComputedStyle (video_chat,null);

		if (style.getPropertyValue ('display')=='none')
		{ //активируем видеочат
			styleElem = document.head.appendChild(document.createElement("style"));
			event.target.style.backgroundColor = 'rgb(106,181,255)';
			head_chat = document.getElementById ('head_chat');
			head_chat.style.backgroundColor = 'rgb(201,201,201)';
			styleElem.insertAdjacentHTML('beforeend', "#"+event.target.id+":after {border-color:  rgb(106,181,255) transparent transparent transparent;}");
			styleElem.insertAdjacentHTML('beforeend', "#head_chat:after {border-color:  rgb(201,201,201) transparent transparent transparent;}");

			container.style.height = '380px';
			container.style.gridTemplateAreas = '"head-chat head-camera" "camerabox camerabox"'
			container.style.gridTemplateRows = 'auto 1fr';
			video_chat.style.width = '100%';
			video_chat.style.height = '100%';
			video_chat.style.display = 'block';
			
			txt_chat = document.getElementById ('chat_win');
			txt_chat.style.display = 'none';
		
			head_users = document.getElementById ("head_users");
			head_users.style.display = 'none';
		
			users_list = document.getElementById ("userslist");
			users_list.style.display = 'none';
		
			controls = document.getElementById ("controls");
			controls.style.display = 'none';
	
		}
	}
}
async function invite(evt) {

  log("Стартую видеозвонок");
  if (myPeerConnection) {
    alert("Видеозвонок уже открыт. Чтобы начать новый видеозвонок, завершите текущий");
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
			      	{ 	urls: ["stun:stun.stunprotocol.org","stun:stun1.l.google.com:19302","stun2.l.google.com:19302",
							   "stun3.l.google.com:19302","stun4.l.google.com:19302","stun.ekiga.net","stun.ideasip.com","stun.rixtelecom.se",
							   "stun.schlund.de"] 
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
  document.getElementById("hangup-button").disabled = false;
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

function handleICEGatheringStateChangeEvent(event) {
  log("*** ICE gathering state changed to: " + myPeerConnection.iceGatheringState);
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

  document.getElementById("hangup-button").disabled = true;
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
