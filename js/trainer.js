var complex,tool_tip;

function Init() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    //	console.log (this.responseText);
      	complex = JSON.parse(this.responseText);
      	InitElements ();
    }
  };
  xhttp.open("GET", "json/trainer.json", true);
  xhttp.send();
}

function InitElements () {
	var element_photo,element_content,list_exersices,element_ex;

	list_exersices='';
	tool_tip = new FloatToolTip("rect");

	for (var i = 0; i < complex.photo_equip.length; i++) {
		if (i <= 5)
		{
			element_photo=document.getElementById ('photo_equip'+i);
			element_photo.src = complex.photo_equip[i][0];		
			element_ex=document.getElementById ('ex'+i);
			element_ex.textContent = complex.exercise_name[i][0];

			list_exersices = CreateListEx (i);
			element_content=document.getElementById ('content'+(i+1));
			element_content.children[0].insertAdjacentHTML ('beforeend',list_exersices);
		}		
		else
		{
			//Create Elements
			list_exersices = CreateListEx (i);
			
			element_content=document.getElementById ('content'+i);
			element_content.insertAdjacentHTML ('afterend','<div class="content" id="content'+(i+1)+'"><div class="equipment"><div class="passe-partout"><img src="'+complex.photo_equip[i][0]+
												'" class="photo_equip" id="photo_equip'+i+'"></div><div class="block_main_ex">'+
												'<button class="button_list_ex" id="btn_list'+i+'" onclick="ExerciseLists(this,'+"'list_ex"+i+"'"+')"><b>+</b></button>'+
												'<div class="exercise_name" onclick="ShowPhotoEx(this)" id="ex'+i+'">'+complex.exercise_name[i][0]+'</div></div>'+list_exersices+'</div></div>');
		}
		tool_tip.addToElement ('photo_equip'+i,"Для просмотра видео<br> нажмите значок видеокамеры");
		tool_tip.set_AnimationIn('photo_equip'+i,"rubberBand");
		tool_tip.set_AnimationOut('photo_equip'+i,"zoomOutRight");
	}
}

function CreateListEx (i) {
	var list_ex;
	var group_ex = complex.exercise_name[i];
	
	if (group_ex.length > 1) {

		list_ex='<ul class="list_exercise" id="list_ex'+i+'"><p><span style="font-family: Arial;color: rgb(0,85,125)">Альтернативные упражнения</span></p>';
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

function ShowPhotoEx (element)
{
	var index;
	var src_photo,current_photo;

	if (element.id.indexOf('ex')!=-1)
	{//главное упр-е
		index = Number (element.id.slice (2));
		src_photo = complex.photo_equip[index][0];		
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
				break;
			}
		}
	}
	current_photo=document.getElementById ('photo_equip'+index);
	if (current_photo.src != src_photo)
		current_photo.src = src_photo;
}