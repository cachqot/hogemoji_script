
//ブラウザ取得
var use_browser = ""

const agent = window.navigator.userAgent.toLowerCase()
if (agent.indexOf("edg") != -1 || agent.indexOf("edge") != -1) {
  use_browser = "edge"
}else if (agent.indexOf("chrome") != -1) {
  use_browser = "chrome"
} else if (agent.indexOf("safari") != -1) {
  use_browser = "safari"
} else if (agent.indexOf("firefox") != -1) {
  use_browser = "firefox"
}

console.log(use_browser)


window.onload = function(){
  add_div()
}


//コードの最初の行を<div></div>で囲う
var div = document.getElementById('editor')

    div.addEventListener("keypress",add_div)
    div.addEventListener("keydown",add_div)
    div.addEventListener("mousedown", add_div)

function add_div() {
    if(div.childElementCount == 0 || String(div.children[0].localName) == "br"){ //divが含まれていないなら or <br>なら
      document.getElementById('editor').innerHTML = '<div><br></div>'
    }
}

var emoji_list = 
["(equal)","(plus)","(minus)","(times)","(division)","(percent)",
    "(pare)","(pare_end)","(dot)","(greater)","(smaller)",
    "(function)","(return)",
    "(command_end)",
    "(if)","(loop)",
    "(print)","(input)"
  ]


//絵文字のリストを追加

var n = 0;
var line = 0;

var table_element = document.getElementById("emoji_list").getElementsByTagName("table")[0]

for(var i = 0;i < emoji_list.length;i++){
  if(n == 5){
    table_element.innerHTML += "<tr></tr>"
    n = 0
    line += 1
  }

  table_element.getElementsByTagName("tr")[line].innerHTML += '<td><img class="emoji" onclick="add_click();" src="emoji/'+emoji_list[i].replace("(","").replace(")","")+'.svg" alt="'+emoji_list[i]+'"></td>'

  n += 1
}

//editorに命令(img)を挿入

function add_click(e){

  //altを取得
  var e = e || window.event;
  var elem = e.target || e.srcElement;
  var elemalt = elem.getAttribute('alt');

  var editor_html = document.getElementById("editor")

  if(editor_html.childElementCount == 0  || String(div.children[0].localName) == "br"){
    //何も入力されていないときはそのまま追加
    editor_html.innerHTML += '<div><img class="emoji_txt" src="emoji/'+elemalt.replace("(",'').replace(")",'')+'.svg" alt="'+elemalt+'">&nbsp;</div>'
    editor_html.querySelector("div").remove()
  }else{
    editor_html = editor_html.getElementsByTagName("div")
    console.log(editor_html[0])
    //キャレット（マウスカーソル）の後ろに絵文字を挿入
    document.execCommand('insertHTML', false, '<img class="emoji_txt" src="emoji/'+elemalt.replace("(",'').replace(")",'')+'.svg" alt="'+elemalt+'">&nbsp;');
  }
}


//<img class="emoji_txt" src="emoji/if.svg" alt="(if)">

//エディタにペーストしたら余分な<div>タグが付くバグを修正
(function () {
  var area = document.getElementById("editor");
  area.addEventListener("paste", function (e) {
      e.preventDefault();
      var text;

      //ペーストされた要素にdivタグがない場合はdivタグをつける
      if (window.clipboardData) {
          text = window.clipboardData.getData("html")
      } else {
          text = e.clipboardData.getData("text/html")
      }
      
      document.execCommand('insertHTML', false, text);
      
  }, false);
}());

function del_div(element){

  
}

function add_div_paste(element){
  if(in_tag("div",element)){
    return element
  }else{
    return "<div>"+element+"</div>"
  }
}

//特定のタグを含むか含まないか
function in_tag(tag_name,element){
  var div = document.createElement('div');
  div.innerHTML = element; //html要素に変換
  document.body.appendChild(div);

  if(div.getElementsByTagName(tag_name).length != 0){
      document.body.removeChild(div); //bodyから削除
      return true;  //タグが存在したら
  }else{
    document.body.removeChild(div);
      return false;
  }
}


//コードをダウンロード
function download_code(){
  var code_element = document.getElementById("editor").getElementsByTagName("div")
  var ret_code = ""

  for(var i = 0;i < code_element.length;i++){
      if(code_element[i].getElementsByTagName("img").length != 0){ //この中にimg（命令、cmd）があったら altも追加
          var tmp = String(code_element[i].innerHTML)
          var ret_list = []
          var cmd_tmp = ""


          for(var j = 0;j < tmp.length;j++){ //altも含めて返す

              if(tmp[j] == "<"){
                  if(cmd_tmp != ""){
                      ret_list.push(cmd_tmp)
                  }
                  cmd_tmp = tmp[j]
              }else if(tmp[j] == ">"){
                  if(cmd_tmp != ""){
                      ret_list.push(cmd_tmp+tmp[j])
                      cmd_tmp = ""
                  }
              }else{
                  cmd_tmp += tmp[j]
              }
          }
          //最後は追加されないため追加する
          ret_list.push(cmd_tmp)
          cmd_tmp = ""

          //imgのaltを無理やりとってくる

          for(var j = 0;j < ret_list.length;j++){

              var div = document.createElement('div');
              div.innerHTML = ret_list[j]; //html要素に変換
              document.body.appendChild(div); //bodyに追加

              if(div.getElementsByTagName("img").length != 0){
                  var ret_alt = div.getElementsByTagName("img")[0].getAttribute('alt') //altを取得
              }else{
                  var ret_alt = div.textContent //img(命令)以外はテキストを読む
              }
              document.body.removeChild(div); //bodyから削除

              ret_code += ret_alt

          }
          ret_code += "\n"

          //ヒュー終わった

      }else{ //なかったらそのまま読んで追加
          ret_code += code_element[i].textContent+"\n"
      }
  }

  ret_code = ret_code.replace(/&nbsp;/g," ") //&nbsp;を空白に変換
  
  console.log("download code")
  console.log(ret_code)

  // テキストエリアより文字列を取得
  const txt = ret_code;
  if (!txt) { return; }
  // 文字列をBlob化
  const blob = new Blob([txt], { type: 'text/plain' });
  // ダウンロード用のaタグ生成
  const a = document.createElement('a');
  a.href =  URL.createObjectURL(blob);
  a.download = 'untitle.hge';
  a.click();

}


/*******************************************/

// ドラッグ&ドロップエリアの取得
var fileArea = document.getElementById('dropArea');

// input[type=file]の取得
var fileInput = document.getElementById('uploadFile');

// ドラッグオーバー時の処理
fileArea.addEventListener('dragover', function(e){
    e.preventDefault();
    fileArea.classList.add('dragover');
});

// ドラッグアウト時の処理
fileArea.addEventListener('dragleave', function(e){
    e.preventDefault();
    fileArea.classList.remove('dragover');
});

// ドロップ時の処理
fileArea.addEventListener('drop', function(e){
    e.preventDefault();
    fileArea.classList.remove('dragover');

    // ドロップしたファイルの取得
    var files = e.dataTransfer.files;

    // 取得したファイルをinput[type=file]へ
    fileInput.files = files;

    var reader = new FileReader
    
    if(typeof files[0] !== 'undefined') {
        //ファイルが正常に受け取れた際の処理
        reader.readAsText(files[0])
        reader.onload = function(ev){
          //テキストエリアに表示する
          document.getElementById("editor").innerHTML = open_img(reader.result);
        }      

    } else {
        //ファイルが受け取れなかった際の処理
    }
});

// input[type=file]に変更があれば実行
// もちろんドロップ以外でも発火します
fileInput.addEventListener('change', function(e){
    var files = e.target.files;

    var reader = new FileReader

    if(typeof e.target.files[0] !== 'undefined') {
        // ファイルが正常に受け取れた際の処理
        reader.readAsText(files[0])
        reader.onload = function(ev){
          //テキストエリアに表示する
          document.getElementById("editor").innerHTML = open_img(reader.result);
        }   
    } else {
        // ファイルが受け取れなかった際の処理
    }
}, false);



/******************************** */

//ファイルを開くときに命令を画像に変換するため
function open_img(input_code){

  var tokens = []
  var command_tmp = "" //とりあえず途中のコードはここに保存
  var command_rec = false //これが命令かを示す
  var string_token = false //「"」で囲まれた文字列(つまりプログラムの中でのstring)は命令とみなさない　 true・・・string

  for(var i = 0;i < input_code.length;i++){

      //ここから先がstringだった場合 / stringの終わりだった場合
      if(string_token == false && input_code[i] == '"'){
          string_token = true //ここから先はstring型ですよ
          if(command_tmp != ""){
              tokens.push(command_tmp) //区切る
          }
          command_tmp = ""+input_code[i]
      }else if(string_token == true && input_code[i] == '"'){
          string_token = false //普通のモードに直す
          if(command_tmp != ""){
              tokens.push(command_tmp+input_code[i])  //stringとして保存する
          }
          command_tmp = ""
      }


      //ここから先がコマンドだった場合
      if(input_code[i] == "(" && command_rec == false && string_token == false){
          command_rec = true

          //後ろを区切る
          if(command_tmp != ""){
              tokens.push(command_tmp)
              command_tmp = ""
          }
      }

      //一時的に保存しておく
      if(input_code[i] != '"' && input_code[i] != "\n" && input_code[i].replace(/\s+/g, "").length != 0){
          command_tmp += input_code[i]
      }

      //命令の終わりだった場合コマンドをtokensに保存する
      if(input_code[i] == ")" && command_rec == true){
          tokens.push(command_tmp)
          command_rec = false
          command_tmp = ""
      }

      //改行 or 空白だったら区切る
      if(input_code[i] == "\n" || input_code[i].replace(/\s+/g, "").length == 0){
          if(command_tmp != ""){
              tokens.push(command_tmp)
          }
          tokens.push(input_code[i])
          command_tmp = ""
      }
  }

  //コマンドが余っていたらtokensに追加する
  if(command_tmp != ""){
      tokens.push(command_tmp)
 }
 console.log(tokens)

 var ret_tmp = []
 var ret_list = []
 var cmd_jud = false

 console.log(emoji_list)

 //命令をimgに変換する
 for(var i = 0;i < tokens.length;i++){
   for(var j = 0;j < emoji_list.length;j++){
    if(tokens[i] == emoji_list[j]){ //とりあえず命令があったらimgに変換
      ret_tmp.push('<img class="emoji_txt" src="emoji/'+emoji_list[j].replace("(",'').replace(")",'')+'.svg" alt="'+emoji_list[j]+'">')
      cmd_jud = true
      break;
    }
   }
   if(cmd_jud){
     cmd_jud = false
   }else if(tokens[i] == "\n"){ //改行ならリストを分ける
    ret_list.push(ret_tmp)
    ret_tmp = []
  }else if(tokens[i].replace(/\s+/g, "").length == 0){ //空白なら
    ret_tmp.push("&nbsp;")
   }else{
    ret_tmp.push(tokens[i])
  }

 }
 ret_list.push(ret_tmp)
 ret_tmp = []

 console.log(ret_list)

 var tmp_str = ""
 var ret_str = ""
 for(var i = 0;i < ret_list.length;i++){
   for(var j = 0;j < ret_list[i].length;j++){
     tmp_str += ret_list[i][j]
   }
   ret_str += "<div>"+tmp_str+"</div>"
   tmp_str = ""
 }

 console.log(ret_str)

 return add_div_paste(ret_str)

}

/********************************* */
/*

window.onbeforeunload = function() {
};

*/


function make_code(query){
  var element = document.getElementById("help_content")
  switch(query){
    case "function":
      location.href = "#help_window"
      break;
  }

}