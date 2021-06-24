var users,user_name,password;
var user_exist=false;

function setCookie(cname,cvalue,exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  user_exist=false;
  user_name=getCookie("username");
  password=getCookie("password");
  var logon=document.getElementById ('logon');

  if (user_name != "") {
      if (password == "")
      {
          logon.style.display = 'block';
          document.getElementById ('head_name1').classList.add ('animation_name_head1');
          document.getElementById ('head_name2').classList.add ('animation_name_head2');
          //вывод формы на ввод
      }else
      {
          user_exist=true;
          CheckUser ();          
      }
  } else 
  {
    //вывод формы на ввод
      logon.style.display = 'block';
      document.getElementById ('head_name1').classList.add ('animation_name_head1');
      document.getElementById ('head_name2').classList.add ('animation_name_head2');
  }
}

function FormHandler () {

   var user_element=document.getElementById ('usr');
   var pass_element=document.getElementById ('pass');
  
   user_name = user_element.value;
   password = pass_element.value;
   CheckUser ();
}

function CheckUser() {
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    //  console.log (this.responseText);
        var logon,form;
        users = JSON.parse(this.responseText);
        var i = users.usr_name.findIndex ( (name)=> {return name==user_name;});
        if (i!=-1 && users.usr_pass[i]==password)
        {
            //сохраняем куки
            if (user_exist==false)
            {
                if (document.getElementById ('chk').checked)
                {
                    setCookie("username", user_name, 365);
                    setCookie("password", password, 365);
                }              
            }
            logon=document.getElementById ('logon');
            if (logon)
            {
                logon.style.display = 'none';
            }
            var head = document.getElementById ('head');
            var wrap = document.getElementById ('wrap');
            head.style.display = 'block';
            wrap.style.display = 'block';

            conf_json = users.usr_conf[i];
            if (conf_json !=null && conf_json !='')
                Init ();
          
        }else
        {
            if (user_exist==true)
            {
                document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "password=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                user_exist = false;
                logon=document.getElementById ('logon');
                logon.style.display = 'block';
                document.getElementById ('head_name1').classList.add ('animation_name_head1');
                document.getElementById ('head_name2').classList.add ('animation_name_head2');
            }else
              alert ("Имя пользователя или пароль не верны");            
        }            
    }
  };
  xhttp.open("GET", "json/users.json", true);
  xhttp.send();
}