var input_code = ""
var tokens = []
var ast = []

//parser()の時に使う
//文法規則：演算子などの優先順位
//下に行くほど優先度が高くなる
const rules = [
    {ops:[]},
    {ops:["(equal)"]},
    {ops:["(dot)"]},
    {ops:["(greater)","(smaller)"]},
    {ops:["(plus)","(minus)"]},
    {ops:["(times)","(division)","(percent)"]},
  ];

var pare_runfunc = false


//変数の値と名前を関連付けるリスト
var var_list_val = [] //値
var var_list_name = [] //名前

var var_local_val = [] //ローカル変数
var var_local_name = []

//関数の名前と位置を関連付けるリスト
var func_list_num = [] //何番目か
var func_list_name = [] //関数の名前

var if_mode = false //if文の時に(equal)を変数宣言ではなく、比較として使用する時がtrue
var func_mode = false //関数実行モード

var func_return = null  //プログラム内のreturnの値を収納する

function run(){
    //init
    input_code = ""
    tokens = []
    ast = []
    pare_runfunc = false
    var_list_val = []
    var_list_name = []
    func_list_num = []
    func_list_name = []
    func_args_run = []
    if_mode = false
    func_mode = false
    

    input_code = String(read_code())

    document.getElementById("output").innerHTML = ""
    //input_code = document.getElementById("editor").textContent

    lexer() //字句解析

    tokens = add_funcrun() //関数を実行する関数のようなものを追加する

    console.log("debug tokens :")
    console.log(tokens) //debug

    ast = parser_generator()

    console.log("debug ast :")
    console.log(ast) //debug

    mkfunc_list()

    console.log(func_list_name)
    console.log(func_list_num)

    cmd_run(ast)

    console.log(var_list_name)
    console.log(var_list_val)
    
}



/*read******************************/
//コードを読み込む
function read_code(){
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

            console.log("debug")
            console.log(ret_list)

            //imgのaltを無理やりとってくる

            for(var j = 0;j < ret_list.length;j++){

                var div = document.createElement('div');
                div.innerHTML = ret_list[j]; //html要素に変換
                document.body.appendChild(div); //bodyに追加

                if(div.getElementsByTagName("img").length != 0){ //img （命令）なら
                    var ret_alt = div.getElementsByTagName("img")[0].getAttribute('alt') //altを取得

                }else if(div.getElementsByTagName("br").length != 0){ //brなら改行
                    var ret_alt = "\n"

                }else{
                    var ret_alt = div.textContent //img(命令)以外はテキストを読む
                }
                document.body.removeChild(div); //bodyから削除
    
                console.log(ret_alt) //alt

                ret_code += ret_alt

            }
            ret_code += "\n" //divの終わりに改行 (つまり、divとbrで改行)

            //ヒュー終わった

        }else{ //なかったらそのまま読んで追加
            ret_code += code_element[i].textContent+"\n"
        }
    }

    ret_code = ret_code.replace(/&nbsp;/g," ") //&nbsp;を空白に変換
    
    console.log("ret code")
    console.log(ret_code)
    return ret_code
}
/****************************************/



function lexer(){

    tokens = []
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
        if(input_code[i] != '"' && input_code[i] != "\n"){

            //空白がstringだったら保存、空白がstringじゃなかったら保存しない
            if(input_code[i].replace(/\s+/g, "").length != 0){  //editorから入力された文字が空白かどうかを判定できないバグを修正
                if(string_token == false){
                    command_tmp += input_code[i]
                }
            }
            if(string_token == true){
                command_tmp += input_code[i]
            }
        }

        //命令の終わりだった場合コマンドをtokensに保存する
        if(input_code[i] == ")" && command_rec == true){
            tokens.push(command_tmp)
            command_rec = false
            command_tmp = ""
        }

        //改行だったら区切る
        if(input_code[i] == "\n"){
            if(command_tmp != ""){
                tokens.push(command_tmp)
            }
            command_tmp = ""
        }
    }

    //コマンドが余っていたらtokensに追加する
    if(command_tmp != ""){
        tokens.push(command_tmp)
   }
}


//関数の先頭に関数実行を意味する "(funcrun)" をつける & 関数を実行できるようにする (pare)~(pare_end)のバグ修正
function add_funcrun(){
    var def_function = ["(none)","(equal)","(plus)","(minus)","(times)","(division)","(percent)",
    "(pare)","(pare_end)","(dot)",
    "(function)",
    "(command_end)",
    "(if)","(loop)",
    "(greater)","(smaller)",
    "(comment)"] //デフォルトの関数,予約語

    var tokens_ret = []

    var token_before = ""  //ひとつ前の命令

    for(var i = 0;i < tokens.length;i++){
        if(def_function.indexOf(tokens[i]) == -1 && token_before != "(function)"){ //登録されていない関数なら
            if(tokens[i][0] == "(" && tokens[i][tokens[i].length-1] == ")"){
                tokens_ret.push("(funcrun)")
            }
        }

        tokens_ret.push(tokens[i])

        //(pare)~(pare_end)の中に何の値も入っていなかったら(none)を追加
        if(tokens[i] == "(pare)" && tokens[i+1] == "(pare_end)"){
            tokens_ret.push("(none)")
        }

        token_before = tokens[i]
    }

    return tokens_ret
}


//パーサージェネレーター
function parser_generator(){
    ast = []

    while(true){
        if(tokens.length != 0){
            console.log(tokens)
            ast.push(parser(tokens,p=0))
        }else{
            break;
        }
    }
    return ast
}


//参考 > ttps://3iz.jp/
//パーサーを作る
function parser(t,p=0){

    //ifやfunctionなどの例外の処理

    //(memo)とりあえず(pare)と(pare_end)の中の優先順位を上げたい
    if(t[0] == "(pare)"){ //関数の括弧 "("
        var left_pare = t.shift();
        var op_pare = parser(t,0)
        console.log(op_pare)
    }
    if(t[0] == "(pare_end)"){  //関数の括弧 ")"

        var right_pare = t.shift()

        var cmd_contents = []

        if(!pare_runfunc){ //if文やfunction定義の時は "{"のように内容の始まりとみなす
            //opに[{命令},{命令},{..}]のような感じに追加していく
            while(true){ //複数の命令があったときに対応している
                if(t[0] == "(command_end)"){
                    break;
                }else{
                    cmd_contents.push(parser(t,0))
                }
            }

        }else{
            return {left:left_pare,op:op_pare,right:right_pare}
        }
    }
    if(t[0] == "(command_end)"){ // "}" のような役割を持ってるif文の終わりやfunction宣言の終りなどに使われる
        var cmd_right = t.shift()
        return {left:{left:left_pare,op:op_pare,right:right_pare},op:cmd_contents,right:cmd_right}
    }

    //[(function)] [関数名] [(pare)(pare_end)...(command_end)] と言う形式にしたいので普通の命令と違う形式をとる
    if(t[0] == "(function)"){
        pare_runfunc = false //関数呼び出しではないので(command_end)までをしまう
        var left_func = t.shift()
        var op_func = t.shift()
        var right_func = parser(t,0)
        var left_tmp =  {left:left_func,op:op_func,right:right_func}
    }else
    if(t[0] == "(funcrun)"){ //関数実行
        pare_runfunc = true
        var left_func = t.shift()
        var op_func = t.shift()
        var right_func = parser(t,0)
        var left_tmp =  {left:left_func,op:op_func,right:right_func}
    }else
    if(t[0] == "(comment)"){ //コメント
        pare_runfunc = true
        var left_func = t.shift()
        var op_func = t.shift()
        var left_tmp =  {left:left_func,op:op_func,right:"(none)"}
    }


    //loop if return のast (基本的に文法が似てる or 同じなので一つにした)
    //
    //[(loop)] [(pare) loop number (pare_end)...(command_end)] [(none)] loop文です
    //[if] [(pare)(pare_end)...(command_end)] [(none)] if文はこんな感じ
    //(none)は何も意味を持たない
    if(t[0] == "(if)" || t[0] == "(loop)"){
        pare_runfunc = false
        var left_if = t.shift()
        var op_if = parser(t,0)
        left_tmp = {left:left_if,op:op_if,right:"(none)"}
    }



    if(p==rules.length) {//この文字列が文法規則になかったら  
        return t.shift();
    } 

    var ops = rules[p].ops //今の優先順位の文字列を取り出す

    if(left_tmp){
        var left = left_tmp
    }else{
        var left = parser(t,p+1);
    }

    //パーサーのコアと言っても過言ではないところ
    while(ops.includes(t[0])){ //この文字列の優先順位がpだったら
        var op = t.shift();
        var right = parser(t,p+1)
        left = {left:left,op:op,right:right}
    }

    tokens = t

    return left 
}


function mkfunc_list(){

    for(var i = 0;i < ast.length;i++){
        if(ast[i].left == "(function)"){ //これが関数なら
            func_list_num.push(i) //この位置と関数を関連付ける
            func_list_name.push(ast[i].op)
        }
    }
}


//命令実行のメインの部分
//予約語の機能、関数の機能を定義している
function cmd_run(cmd){
    if(Array.isArray(cmd)){ //入力されたastはArrayか、そうじゃないか判断する
        for(var i = 0;i < cmd.length;i++){   //Arrayの場合は命令がたくさん詰まっているのでその命令をすべて実行する
            console.log(cmd[i])
            if(cmd[i].op == "(return)"){ //return なら速攻返す
                console.log("debug return")
                func_return = cmd_run(cmd[i])
                return 0; 
            }else{ //普通は順番に実行する
                cmd_run(cmd[i]) 
            }
        }
    }else if(typeof(cmd) == "object"){ //jsonだった場合、普通にleft,op,rightを読み込んで実行

        switch(cmd.op){ //真ん中に命令があるか確かめる   四則演算など
            case "(equal)": //変数宣言

                if(if_mode){ //if_mode=trueなら(equal)を比較とみなす
                    if(cmd_run(cmd.left) == cmd_run(cmd.right)){ // left = right
                       return true //trueを返す
                    }else{
                        return false
                    }
                }else if(cmd.left != "(none)"){ //変数の名前がnoneじゃない and if_mode=falseなら 変数宣言
                    //console.log(cmd_run(cmd.right))  //debug ※関数の返り値を変数にしまうときに 2回実行してしまうのでコメントアウトしておく

                    if(var_list_name.includes(cmd.left)){ //今の変数があったら(宣言されていたら)
                        var_list_val[var_list_name.indexOf(cmd.left)] = str_to_val(cmd_run(cmd.right)) //その変数に対応する場所に変数の値をしまう
                    }else{
                        var_list_name.push(cmd.left) //変数を宣言する
                        var_list_val.push(str_to_val(cmd_run(cmd.right)))
                    }
                }
                break;
            case "(plus)":
                if(!isNaN(cmd_run(cmd.left)) && !isNaN(cmd_run(cmd.right))){
                    return Number(cmd_run(cmd.left)) + Number(cmd_run(cmd.right)) //もし数字ならそのまま計算して返す
                }else{ //文字同士なら、文字をつなぐ
                    return cmd_run(cmd.left) + cmd_run(cmd.right)
                }
            case "(minus)":
                return Number(cmd_run(cmd.left)) - Number(cmd_run(cmd.right))
            case "(times)":
                return Number(cmd_run(cmd.left)) * Number(cmd_run(cmd.right))
            case "(division)":
                return Number(cmd_run(cmd.left)) / Number(cmd_run(cmd.right))
            case "(percent)":
                return Number(cmd_run(cmd.left)) % Number(cmd_run(cmd.right))


                
            case "(dot)": //引数やリストの値を区切るときに使う "," の役割をする
                var dot_left = str_to_val(cmd_run(cmd.left))
                var dot_right = str_to_val(cmd_run(cmd.right))

                if(Array.isArray(dot_left)){ //Arrayなら
                    dot_left.push(dot_right) //値をぶち込む
                    return dot_left
                }else{
                    return [dot_left,dot_right]
                }
                
            case "(greater)": // ">" if文比較

                if(cmd_run(cmd.left) > cmd_run(cmd.right)){
                    return true
                }else{
                    return false
                }
                break;
            case "(smaller)": // "<" if文比較

                if(cmd_run(cmd.left) < cmd_run(cmd.right)){
                    return true
                }else{
                    return false
                }
                break;
        
            default:
                break;
        }


        switch(cmd.left){
            
            case "(funcrun)": //関数実行
                var func_args = cmd_run(cmd.right["op"])
                if(!Array.isArray(func_args)){ //Arrayじゃないなら無理やりArrayにする
                    func_args = [str_to_val(func_args)]
                }
                console.log(func_args)

                return funcrun(cmd.op,func_args)
                break;
            
            case "(if)":
                if_mode = true //(equal)を比較記号とみなす
                var if_jud = cmd_run(cmd.op["left"]["op"])
                if_mode = false

                console.log(if_jud)

                if(if_jud){  //trueなら実行
                    cmd_run(cmd.op["op"])
                }else{
                    return 0
                }

                break;

            case "(loop)":
                var nam = cmd_run(cmd.op["left"]["op"])
                if(!isNaN(nam)){
                    for(var i = 0;i < nam;i++){
                        cmd_run(cmd.op["op"])
                    }
                }
                break;
            
            case "(function)":
                if(func_mode){ //関数実行モード
                    var input_list = cmd_run(cmd.right["left"]["op"]) //引数を代入する変数の名前

                    if(!Array.isArray(input_list)){ //Arrayじゃないなら無理やりArrayにする
                        input_list = [input_list]
                    }

                    for(var i = 0;i < input_list.length;i++){  // '"' をつける
                        input_list[i] = var_to_val(input_list[i])
                    }
                    console.log(input_list)
                    console.log(var_local_val)

                    for(var i = 0;i < var_local_val.length;i++){//ローカル変数を引数の数に合わせる
                        var_local_name.push(input_list[i])
                    }

                    
                    console.log("debug : local var")
                    console.log(var_local_name)
                    console.log(var_local_val)

                    cmd_run(cmd.right["op"])

                    //関数を実行し終わったらローカル変数を消す
                    var_local_name = []
                    var_local_val = []
                }

                break;

            default:
                break;
        }


    }else{
        return var_to_val(cmd)
    }

}

//strだったらクオーテーションを取って返す
//変数だったらその値を返す
function var_to_val(str){
    if(isNaN(str) && str != undefined && str != null){
        if(str[0] == '"' && str[str.length-1] == '"'){ //str型なら
            return str.replace(/"/g,"") //外して返す
        }
    }

    for(var i = 0;i < var_list_name.length;i++){ //これが変数かそうではないかを確かめる
        if(str == var_list_name[i]){ //変数だったらその変数の値を返す
            return var_list_val[i]                                                                                                                          
        }
    }

    //local var.
    for(var i = 0;i < var_local_name.length;i++){ //これが変数かそうではないかを確かめる
        if(str == var_local_name[i]){ //変数だったらその変数の値を返す
            return var_local_val[i]                                                                                                                          
        }
    }

    //何でもなかったらそのまま
    return str
}

//strにダブルクオーテーションをつける
function str_to_val(str){
    console.log("debug str")
    console.log(str)
    if(str == ""){
        return ""
    }
    if(!isNaN(str)){ //数字だったら
        return Number(str)
    }
    if(typeof(str) == "string"){
        return '"'+str+'"'
    }

    return str
}


function funcrun(func,args){ //関数を実行する

    output_area = document.getElementById("output") 

    switch(func){

        //デフォルトの関数の場合
        case "(print)":
            
            var print_text = String(var_to_val(args[0]))
            console.log("debug : "+args[0])
            console.log("output_print_function : "+print_text)  //ダブルクオーテーションを外すとかして、表示する
            output_area.innerHTML+= print_text+"<br>"
            break;

        case "(input)":
            var print_text = String(var_to_val(args[0]))
            console.log("debug : "+args[0])
            console.log("output_print_function : "+print_text)  //ダブルクオーテーションを外すとかして、表示する
            output_area.textContent += print_text+">"

            var input_text = prompt(print_text)

            output_area.innerHTML += input_text+"<br>"

            return str_to_val(input_text)
            break;

        case "(return)":
            return var_to_val(args[0]) //リターンするだけの関数
            break;
        
        //プログラム内で作られた関数の場合
        default:

            var_local_val = args  //ローカル変数を引数にする
            func_mode = true //関数実行中
            for(var i = 0;i < func_list_name.length;i++){ //関数を人ずつ探す
                if(func_list_name[i] == func){ //この名前の関数が見つかったなら

                    cmd_run(ast[func_list_num[i]])  //関数を実行

                    console.log(func_return) //debug : func_return

                    func_mode = false

                    if(func_return != undefined){ //undefinedでなければreturnの値を返す
                        return func_return
                    }else{  //でなければnull
                        return "(null)"
                    }

                    break;

                }
            }

            break;
    }
}