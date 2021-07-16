var conf_json,complex,tool_tip;
var player_hide=true;
var chat_hide=true;
var src_video='';

function Init() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    //	console.log (this.responseText);
      	complex = JSON.parse(this.responseText);
      	InitElements ();
    }
  };
  xhttp.open("GET", conf_json, true);
  xhttp.send();
}

function InitElements () {
	var element_photo,element_content,list_exersices,element_ex,info,round_rep;

	list_exersices='';
	tool_tip = new FloatToolTip("rect");

	for (var i = 0; i < complex.photo_equip.length; i++) {
		if (i <= 5)
		{
			element_photo=document.getElementById ('photo_equip'+i);
			element_photo.src = complex.photo_equip[i][0];		
			element_ex=document.getElementById ('ex'+i);
			element_ex.textContent = complex.exercise_name[i][0];
			info = complex.details[i][0];
			round_rep = info.rounds+'x'+info.reps;
			document.getElementById ('info'+i).textContent = round_rep;

			list_exersices = CreateListEx (i);
			element_content=document.getElementById ('content'+(i+1));
			element_content.children[0].insertAdjacentHTML ('beforeend',list_exersices);
		}		
		else
		{
			//Create Elements
			list_exersices = CreateListEx (i);
			info = complex.details[i][0];
			round_rep = info.rounds+'x'+info.reps;
			
			element_content=document.getElementById ('content'+i);
			element_content.insertAdjacentHTML ('afterend','<div class="content" id="content'+(i+1)+'"><div class="equipment"><div class="passe-partout"><img src="'+complex.photo_equip[i][0]+
												'" class="photo_equip" id="photo_equip'+i+'"><div class="info" id="info'+i+'">'+round_rep+'</div></div><div class="block_main_ex">'+
												'<button class="button_list_ex" id="btn_list'+i+'" onclick="ExerciseLists(this,'+"'list_ex"+i+"'"+')"><b>+</b></button>'+
												'<div class="exercise_name" onclick="ShowPhotoEx(this)" id="ex'+i+'">'+complex.exercise_name[i][0]+'</div></div>'+list_exersices+'</div></div>');
		}
		tool_tip.addToElement ('photo_equip'+i,'<span style="font-family: Arial;color: rgb(0,85,125)">Для просмотра видео<br> нажмите значок видеокамеры</span>');
		tool_tip.set_BgColor ('photo_equip'+i,"rgba(255,255,185,0.8)");
		tool_tip.set_AnimationIn('photo_equip'+i,"rubberBand");
		tool_tip.set_AnimationOut('photo_equip'+i,"zoomOutRight");
	}
}

function CreateListEx (i) {
	var list_ex,str_name;
	var group_ex = complex.exercise_name[i];

	(complex.superset[i]==true)? str_name='Суперсет комплекс</span><img src="img/two-way.png" width="32" height="32"></p>': 
	                             str_name='Альтернативные упражнения</span></p>';
	if (group_ex.length > 1) {

		list_ex='<ul class="list_exercise" id="list_ex'+i+'"><p><span style="font-family: Arial;color: rgb(0,85,125);margin-right:40px">'+str_name;
		for (var j = 1; j < group_ex.length; j++) {
			list_ex += '<li onclick="ShowPhotoEx(this)">'+group_ex[j]+'</li>';
		}
		list_ex += '</ul>';
	}
	return list_ex;
}

function ExerciseLists (but,id_list) {
	var list_ex;

	if (but.textContent=='+')
		but.textContent = '-';
	else
		but.textContent = '+';

	list_ex=document.getElementById (id_list);

	if (but.textContent=='-')
		list_ex.style.display='block';

	for (var i = 0; i < list_ex.children.length; i++) { 
		if (list_ex.children[i].tagName.toLowerCase()=='li')
		{
			(but.textContent=='-')? list_ex.children[i].classList.remove ('animation_lists_hide'): list_ex.children[i].classList.remove ('animation_lists_show');
			(but.textContent=='-')? list_ex.children[i].classList.add ('animation_lists_show'): list_ex.children[i].classList.add ('animation_lists_hide');
		}
	}
	if (but.textContent=='+')
	{
		setTimeout (function() {list_ex.style.display='none';},700);	
	}
}

function WebRTCChat () {	
	ShowChat ();return;
	if (!webSocket)
		connect ();
	else
	{
		if (msg_connect.user_name)
			ShowChat ();
		else if (confirm("Нет связи с WebSocket сервером сигнализации или он выключен. Повторите попытку?"))
    	{
    		if (webSocket)
    			webSocket.close ();
    		connect ();
    	}
	}	
}

function ShowChat () {
	var chat = document.getElementById ('chat');

	if (chat_hide)
	{
		chat.classList.remove ('animation_chat_hide');
		chat.classList.add ('animation_chat_show');
		chat_hide = false;
	}else
	{
		chat.classList.remove ('animation_chat_show');
		chat.classList.add ('animation_chat_hide');		
		chat_hide = true;				
	}
}
function PlayVideo () {
	
	if (src_video == '')
	{
		alert ('видеоролик еще не добавлен');
		return;
	}

	var player = document.getElementById ('player');
	if (player_hide)
	{
		player.src = src_video;
		player.classList.remove ('animation_player_hide');
		player.classList.add ('animation_player_show');
	//	player.style.display = 'block';
		player_hide = false;
	}else{
		player.classList.remove ('animation_player_show');
		player.classList.add ('animation_player_hide');
	//	player.style.display = 'none';
		setTimeout (()=> {player.src = '';},500);			
		player_hide = true;				
	}
}

function ShowPhotoEx (element)
{
	var index;
	var info,round_rep;
	var src_photo,current_photo;

	if (element.id.indexOf('ex')!=-1)
	{//главное упр-е
		index = Number (element.id.slice (2));
		src_photo = complex.photo_equip[index][0];	
		src_video = complex.src_video[index][0];
		info = complex.details[index][0];	
	}else
	{//список альтернативных упр-й
		var exercise_name = element.textContent;
		var list = document.getElementById (element.parentElement.id);
		var items = list.querySelectorAll ('li');
		index = Number (list.id.slice (7));

		for (var i = 0; i < items.length; i++) {
			if (items[i].textContent==exercise_name)
			{
				src_photo = complex.photo_equip[index][i+1];
				src_video = complex.src_video[index][i+1];
				info = complex.details[index][i+1];
				break;
			}
		}
	}
	round_rep = info.rounds+'x'+info.reps;
	current_photo=document.getElementById ('photo_equip'+index);
	if (current_photo.src != src_photo)
		current_photo.src = src_photo;
	document.getElementById ('info'+index).textContent = round_rep;
}