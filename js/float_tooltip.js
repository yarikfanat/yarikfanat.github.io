
class FloatToolTip {

  constructor(type) 
  {
    this.type=type; //тип tooltip ('rect'-прямоугольный,'circle'-круг,...)    
    this.array_Objs=[];//массив обьектов типа Element для которых применяется tooltip и самих tooltip   
    this.state={id_start:[],start_timing:[],id_element:[],tool_tip:[],idx:0};//обьект - текущее состояние обьектов
    this.animate_propAttention=['bounce','flash','pulse','rubberBand','shakeX','shakeY','headShake','swing','tada','wobble','jello','heartBeat'];
    this.animate_propBackIn=['backInDown','backInLeft','backInRight','backInUp'];
    this.animate_propBackOut=['backOutDown','backOutLeft','backOutRight','backOutUp'];
    this.animate_propBounceIn=['bounceIn','bounceInDown','bounceInLeft','bounceInRight','bounceInUp'];
    this.animate_propBounceOut=['bounceOut','bounceOutDown','bounceOutLeft','bounceOutRight','bounceOutUp'];
    this.animate_propFadeIn=['fadeIn','fadeInDown','fadeInDownBig','fadeInLeft','fadeInLeftBig','fadeInRight','fadeInRightBig','fadeInUp','fadeInUpBig','fadeInTopLeft',
                             'fadeInTopRight','fadeInBottomLeft','fadeInBottomRight'];
    this.animate_propFadeOut=['fadeOut','fadeOutDown','fadeOutDownBig','fadeOutLeft','fadeOutLeftBig','fadeOutRight','fadeOutRightBig','fadeOutUp','fadeOutUpBig',
    						  'fadeOutTopLeft','fadeOutTopRight','fadeOutBottomRight','fadeOutBottomLeft'];
    this.animate_propFlippers=['flip','flipInX','flipInY','flipOutX','flipOutY'];
    this.animate_propLightspeed=['lightSpeedInRight','lightSpeedInLeft','lightSpeedOutRight','lightSpeedOutLeft'];
    this.animate_propRotateIn=['rotateIn','rotateInDownLeft','rotateInDownRight','rotateInUpLeft','rotateInUpRight'];
    this.animate_propRotateOut=['rotateOut','rotateOutDownLeft','rotateOutDownRight','rotateOutUpLeft','rotateOutUpRight'];
    this.animate_propSpecials=['hinge','jackInTheBox','rollIn','rollOut'];
    this.animate_propZoomIn=['zoomIn','zoomInDown','zoomInLeft','zoomInRight','zoomInUp'];
    this.animate_propZoomOut=['zoomOut','zoomOutDown','zoomOutLeft','zoomOutRight','zoomOutUp'];
    this.animate_propSlideIn=['slideInDown','slideInLeft','slideInRight','slideInUp'];
    this.animate_propSlideOut=['slideOutDown','slideOutLeft','slideOutRight','slideOutUp'];
    this.animateArray=[this.animate_propAttention,this.animate_propSpecials,this.animate_propFlippers,this.animate_propLightspeed,this.animate_propBackIn,this.animate_propBackOut,
    				   this.animate_propBounceIn,this.animate_propBounceOut,this.animate_propFadeIn,this.animate_propFadeOut,this.animate_propRotateIn,this.animate_propRotateOut,
    				   this.animate_propZoomIn, this.animate_propZoomOut,this.animate_propSlideIn,this.animate_propSlideOut];
  }
  get getID() {    	
    return '_' + Math.random().toString(36).substr(2, 9);
  }
  addToElement(id_element,text)//привязка tooltip к элементу html
  {
  	var array_id_ttips=[];//массив уникальных идентификаторов tooltip
  	var array_el_ttips=[];// массив обьектов tooltip (5 штук с разным расположением указателя)
  	var El_and_Tools; //обьект с html элементом и привязаным масивом tooltip
  	var id_ttip,element;
 
  	element=document.getElementById(id_element);
  	if (!element)
  		return null;
   
  	for (var i = 0; i < 5; i++) 
  	{
  		while (true) {
  			id_ttip=this.type+this.getID;
  			if (!document.getElementById(id_ttip))
  			{
  				if (!array_id_ttips.includes(id_ttip))
  				{
  					array_id_ttips.push(id_ttip);
  					break;
  				}  				
  			}
  		}  
  		document.body.insertAdjacentHTML('beforeend', '<div id="'+id_ttip+'" class="'+this.type+(i+1)+'">'+text+'</div>');
  		array_el_ttips.push(document.getElementById(id_ttip));	  		
  	}
  	El_and_Tools={Element:element,Element_id:id_element,Array_Ttips:array_el_ttips}; 
  	this.array_Objs.push(El_and_Tools); 
  	this.state.id_start.push(0);
  	this.state.start_timing.push(false);
  	this.state.id_element.push(id_element);
  	this.state.tool_tip.push(0);

  	for (i = 0; i < array_el_ttips.length; i++) {
  		array_el_ttips[i].addEventListener("click",this.click_handler.bind(this,this.array_Objs,this.state,id_element),false);
  	}

  	element.addEventListener("mouseover", this.over_handler.bind(this,id_element,this.state),false);
  	element.addEventListener("mouseout", this.out_handler.bind(this,id_element,this.state),false);
  	element.addEventListener("click", this.click_handler.bind(this,this.array_Objs,this.state,id_element),false);
  	document.addEventListener("mousemove", this.move_handler.bind(this,this.array_Objs,this.state),false);
  	return array_el_ttips;
  }

  getArray_TTip(id_element) {
 	for (var i = 0; i < this.array_Objs.length; i++) {
 		if (this.array_Objs[i].Element_id == id_element)
 			return this.array_Objs[i].Array_Ttips;
  }
  return null;
 }

 set_BgColor (id_element,value) {
 	var arr_ttips=this.getArray_TTip(id_element);
 	var styleElem = document.head.appendChild(document.createElement("style"));
 	if (arr_ttips)
 	{
 		for (var i = 0; i < arr_ttips.length; i++) 
 		{
 			arr_ttips[i].style.backgroundColor=value;
 			switch (i)
 			{
 				case 0:case 1:
 					styleElem.insertAdjacentHTML('beforeend', "#"+arr_ttips[i].id+":after {border-color: transparent transparent "+value+" "+value+";}");
 				break;
 				case 2:
 					styleElem.insertAdjacentHTML('beforeend', "#"+arr_ttips[i].id+":after {border-color: transparent transparent "+value+" transparent;}");
 				break;
 				case 3:case 4:
 					styleElem.insertAdjacentHTML('beforeend', "#"+arr_ttips[i].id+":after {border-color: transparent "+value+" "+value+" transparent;}");
 				break;
 			}
 			
 		}
 	}
 }

set_BorderWidth (id_element,value) {
	if (!Number.isInteger(value))
		return;
	if (!value)
		return;

	
	var arr_ttips=this.getArray_TTip(id_element);	
// 	var br = Math.round((50- (value/Math.sin ((45*Math.PI)/180))+value)/2);
 	if (arr_ttips)
 	{
 		var styleElem = document.head.appendChild(document.createElement("style"));
 		var style = window.getComputedStyle(arr_ttips[0],null);
		var bgcolor = style.getPropertyValue("background-color");

 		for (var i = 0; i < arr_ttips.length; i++) 
 		{
 			arr_ttips[i].style.borderWidth = value+'px';
 			switch (i)
 			{
 				case 0: 					
 					styleElem.insertAdjacentHTML('beforeend', "#"+arr_ttips[i].id+":before {left:-"+value+"px;}");
 					styleElem.insertAdjacentHTML('beforeend', "#"+arr_ttips[i].id+":after {border: "+(25-value)+"px solid;top: -"+((25-value)*2)+"px;left:0;"+
 						                         "border-color: transparent transparent "+bgcolor+" "+bgcolor+";}");
 				break;
 				case 1:
 					styleElem.insertAdjacentHTML('beforeend', "#"+arr_ttips[i].id+":after {border: "+(25-value)+"px solid;top: -"+((25-value)*2)+"px;left:"+(30+value)+"px;"+
 												 "border-color: transparent transparent "+bgcolor+" "+bgcolor+";}");
 				break;
 				case 2: 				
 					styleElem.insertAdjacentHTML('beforeend', "#"+arr_ttips[i].id+":after {top: -"+((50-(value*2))*2)+"px;margin-left:-"+(25-value)+"px;"+
 						                         "border-top-width:"+(50-(2*value))+"px;border-bottom-width:"+(50-(2*value))+"px;"+
 						                         "border-right-width:"+(25-value)+"px;border-left-width:"+(25-value)+"px;}");
 				break;
 				case 3:
 					styleElem.insertAdjacentHTML('beforeend', "#"+arr_ttips[i].id+":after {border: "+(25-value)+"px solid;top: -"+((25-value)*2)+"px;right:"+(30+value)+"px;"+
 												 "border-color: transparent "+bgcolor+" "+bgcolor+" transparent;}");
 				break;
 				case 4:
 					styleElem.insertAdjacentHTML('beforeend', "#"+arr_ttips[i].id+":before {right:-"+value+"px;}");
 					styleElem.insertAdjacentHTML('beforeend', "#"+arr_ttips[i].id+":after {border: "+(25-value)+"px solid;top: -"+((25-value)*2)+"px;right:0;"+
 												 "border-color: transparent "+bgcolor+" "+bgcolor+" transparent;}");
 				break;
 			} 			
 		}
 	}
 }

 static get_prop_AnimationOut (id_element,array_obj) {
 	for (var i = 0; i < array_obj.length; i++) {
 		if (array_obj[i].Element_id == id_element)
 		{
 			if (typeof array_obj[i].Animation_Out=="undefined")
 				return null;
 			return array_obj[i].Animation_Out;
 		}
 	}
 }

 static del_Animation_Out (tooltip,state,idx,prop) {
 	tooltip.classList.remove ('animate__'+prop);//Удаляется только с одного tooltip, а их 5 штук!!!
 	tooltip.style.display = 'none';
 	state.tool_tip[idx]=0;
 }

 out_handler(id_element,state,evt) {
 	var i = FloatToolTip.get_idx_stateobj(state,id_element);

	if (!state.tool_tip[i])
	{
		state.start_timing[i]=false;
	 	clearTimeout (state.id_start[i]);
	}
 }

 over_handler(id_element,state,evt) {
 	var i = FloatToolTip.get_idx_stateobj(state,id_element);
 	state.idx=i;
 	if (state.tool_tip[i])
 		return;
 	state.start_timing[i]=true;
 	state.id_element[i]=id_element;//??по идее лишнее
 } 

 static get_idx_stateobj (state,id_element) {
 	for (var i = 0; i < state.id_element.length; i++) {
 		if (state.id_element[i]==id_element)
 			return i;
 	}
 }
 click_handler(array_obj,state,id_element,evt) {
 	var i = FloatToolTip.get_idx_stateobj(state,id_element);
 
 	if (state.tool_tip[i])
 	{ 		
 		clearTimeout (state.id_start[i]);
 		state.id_start[i]=0;
 
	    var prop=FloatToolTip.get_prop_AnimationOut(state.id_element[i],array_obj);
	    if (prop)
		{
			state.tool_tip[i].classList.add ('animate__'+prop);
			setTimeout (function() {FloatToolTip.del_Animation_Out(state.tool_tip[i],state,i,prop);},1000);

		}else
		{
	    	state.tool_tip[i].style.display = 'none';
	    	state.tool_tip[i]=0;
		}
	    
 	}
 }

 set_AnimationOut (id_element,prop) {
 	for (var i = 0; i < this.array_Objs.length; i++) {
 		if (this.array_Objs[i].Element_id == id_element)
 		{
 			this.array_Objs[i].Animation_Out = prop;
 			break;
 		} 		
 	}
 }

 set_AnimationIn (id_element,prop){
 	var clist,find;
 	for (var i = 0; i < this.array_Objs.length; i++) {
 		if (this.array_Objs[i].Element_id == id_element)
 		{
 			for (var j = 0; j < this.array_Objs[i].Array_Ttips.length; j++)
 			{ 				
 				clist = this.array_Objs[i].Array_Ttips[j].classList;
 				find = false;
 				for (var n = 0; n < this.animateArray.length; n++) {
 					for (var k = 0; k < this.animateArray[n].length; k++) {
 						if (clist.contains('animate__'+this.animateArray[n][k]))
 						{
 							clist.remove ('animate__'+this.animateArray[n][k]);
 							find = true;
 							break;
 						} 					
 					} 
 					if (find == true)
 						break;
 				}
 				this.array_Objs[i].Array_Ttips[j].classList.add ('animate__animated');
 				this.array_Objs[i].Array_Ttips[j].classList.add ('animate__'+prop);
 			}
 			break;
 		} 			
 	}
 }

 move_handler(array_obj,state,evt) {	
 	var i=state.idx;

 	for (var j = 0; j < state.tool_tip.length; j++) {
 		if (j!=i && state.tool_tip[j])
 		{
 			FloatToolTip.position_event (array_obj,state,j,evt);
 			break;
 		}
 	}
 	FloatToolTip.position_event (array_obj,state,i,evt); 	
}

static position_event(array_obj,state,i,evt) {
	if (state.start_timing[i])
	{   	
	 	clearTimeout (state.id_start[i]);
	  	state.id_start[i]=setTimeout (function() {FloatToolTip.show_ttip(evt,array_obj,state,i);},1000);		
	}else
	{
 		if (state.tool_tip[i])
 		{
	 		var elem=document.getElementById(state.id_element[i]);
	 		var c=elem.getBoundingClientRect ();
		    if (!(evt.clientX >= c.left && evt.clientX <= c.right && evt.clientY >= c.top && evt.clientY <= c.bottom))//за пределами элемента
		    {
		       c=state.tool_tip[i].getBoundingClientRect ();
		       if (!(evt.clientX >= c.left && evt.clientX <= c.right && evt.clientY >= c.top && evt.clientY <= c.bottom))//за пределами tooltip
		       {
					var prop=FloatToolTip.get_prop_AnimationOut(state.id_element[i],array_obj);
			    	if (prop)
					{
						state.tool_tip[i].classList.add ('animate__animated');
						state.tool_tip[i].classList.add ('animate__'+prop);
						setTimeout (function() {FloatToolTip.del_Animation_Out(state.tool_tip[i],state,i,prop);},1000);
					}else
					{
			    		state.tool_tip[i].style.display = 'none';	    	
			    		state.tool_tip[i]=0;
					}		        	     
		       }
		    }
	 	}
	}
}

static show_ttip(evt,array_obj,state,idx) {
	var x,y,width_tool,style,border_tool,array_ttip,ttip,wborder;

	state.start_timing[idx]=false;
	clearTimeout (state.id_start[idx]);

	for (var i = 0; i < array_obj.length; i++) {
		if (array_obj[i].Element_id == state.id_element[idx])
	 	{
	 		array_ttip = array_obj[i].Array_Ttips;
	 		break;
	 	}
	}
	// Для браузера IE6-8
	if (document.all)  
	{ 
	 	x = evt.clientX + document.body.scrollLeft; 
	  	y = evt.clientY + document.body.scrollTop; 
	 // Для остальных браузеров
	} else  
	{ 
	   	x = evt.pageX; // Координата X курсора
	   	y = evt.pageY; // Координата Y курсора
	}
	 
	if (array_ttip)
	{
		var t=0;
		array_ttip[2].style.visibility='hidden';	
	 	array_ttip[2].style.display='block'; 

		style = window.getComputedStyle(array_ttip[2],null);
	 	border_tool = style.getPropertyValue("border-width");
	 	wborder = border_tool.slice (0,border_tool.length-2);
	 	width_tool = array_ttip[2].clientWidth+(Number(wborder)*2);

	 	array_ttip[2].style.display='none';

	 	if (evt.clientX >= width_tool/2)
	 	{	 		
	 		if (evt.clientX <= document.body.clientWidth-(width_tool/2))
	 		{
	 			ttip = array_ttip[2];
				t = 2;
	 		}else if (evt.clientX > document.body.clientWidth-(30+Number(wborder)))
	 		{
	 			t = 4;
				ttip = array_ttip[4];	
	 		}else 
	 		{
	 			t = 3;
				ttip = array_ttip[3];
	 		}	 		
	 	}else if (evt.clientX >= 0 && evt.clientX < 30+Number(wborder))
	 	{
	 		t = 0;
			ttip = array_ttip[0];
		}else					
		{
			ttip = array_ttip[1];
			t = 1; 		
	 	}
	  	ttip.style.top = y + (50-Number(wborder)) +'px';
	  	if (t == 0)
	  		ttip.style.left = x +'px';
	  	else if (t == 1)
	  	{
	  		ttip.style.left = x - (30+Number(wborder)) +'px';
	  	}
	 	else if (t == 2)
	 	{
	 		// tooltip с указателем по центру в верху
	 		ttip.style.left = x - (width_tool/2)+'px';
	 	}
	 	else if (t == 3)
	 	{
	 		ttip.style.left = x - width_tool + (30+Number(wborder)) +'px';
	 	}
	 	else
	 	{
	 		ttip.style.left = x - width_tool+'px';
	 	}	

	 	state.tool_tip[idx]=array_ttip[t];
	 	ttip.style.display='block'; 	
	 	ttip.style.visibility='visible';
	}
}
}