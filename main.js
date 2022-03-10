var url="https://frozelab.net/"
footer_html = ''
+'            <span class="logo">'
+'<ul>'
+'    <li>'
+'    <img src="'+url+'logo.svg" style="width:50px;">'
+'    <span style="padding-left:10px;font-size:2em;" class="t">Froze Lab</span>'
+'    </li>'
+'    <li>'
+'        https://lab.rihitsan.com/'
+'    </li>'
+'</ul>'
+'</span>'

footer_html_under = ''
+'<span class="menu">'
+'<ul>'
+'    <span style="color:#888888">accounts</span>'
+'    <li><a href="#">Github</a></li>'
+'    <li><a href="#">Twitter</a></li>'
+'    <li><a href="#">Discord</a></li>'
+'</ul>'
+'<ul>'
+'    <span style="color:#888888">Pages</span>'
+'    <li><a href="'+url+'">Home</a></li>'
+'    <li><a href="'+url+'project/">Project</a></li>'
+'    <li><a href="https://forms.gle/13LRRauS1vfLeGXq6">Contact</a></li>'
+'</ul>'
+'<ul>'
+'    <span style="color:#888888">Projects</span>'
+'    <li><a href="#">FrozeOS</a></li>'
+'    <li><a href="#">hogemoji script</a></li>'
+'    <li><a href="#">Github_profile_prompt</a></li>'
+'</ul>'
+'</span>'


if(document.getElementsByTagName("footer")[0] != null){
    document.getElementsByTagName("footer")[0].innerHTML = footer_html

    //スマホじゃない場合はメニューを追加する
    if(!navigator.userAgent.match(/iPhone|Android.+Mobile/)){
        document.getElementsByTagName("footer")[0].innerHTML += footer_html_under
    }
}

header_html = ''
+'<span class="content">'
+'<img src="'+url+'logo.svg" style="width:50px;">'
+'<span class="menu">'
+'    <a href="'+url+'">Home</a>'
+'    <a href="'+url+'project/">Project</a>'
+'    <a href="#">News</a>'
+'    <a href="https://forms.gle/13LRRauS1vfLeGXq6">Contact</a>'
+'</span>'
+'</span>'

if(document.getElementsByClassName("header")[0] != null){
    document.getElementsByClassName("header")[0].innerHTML = header_html
}