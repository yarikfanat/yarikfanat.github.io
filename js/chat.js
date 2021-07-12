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
//	serverUrl = scheme + "://" + myHostname + ":8080";
	serverUrl = scheme+"://534e011001be.ngrok.io"
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
		   //   chatbox.insertAdjacentHTML('beforeend', '<span style="color:red">'+msg.date+'</span>'+
		     // 						     '<span style="color:blue">&nbsp'+msg.from_user+'=>&nbsp</span>'+msg.text+'<br>');
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
	var text =  '<span style="color:red">'+date+'</span>'+'<span style="background-color:rgb(166,210,255);color:black;font-style:italic;padding:7px;border-radius:4px;">&nbsp'+msg.text+'</span><br>';

	chatbox.innerHTML += text;
	chatbox.scrollTop = chatbox.scrollHeight - chatbox.clientHeight;
	//document.getElementById("chat_win").insertAdjacentHTML('beforeend', '<span style="color:red">'+date+'</span>'+
	  // 												       '<span style="background-color:silver;color:black">&nbsp'+msg.text+'</span><br>');
	//document.getElementById("text_chat").value = "";
	  	
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
	}else
	{
		document.getElementById("text_chat").disabled = true;
    	document.getElementById("send").disabled = true;
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