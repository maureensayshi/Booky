document.querySelector(".btn_menu").onclick = function(){
    document.querySelector(".menu").style.display = "flex";
    document.querySelector(".btn_menu").style.visibility = "hidden";    
};

document.querySelector(".close-menu").onclick= function(){
    document.querySelector(".menu").style.display = "none";
    document.querySelector(".btn_menu").style.visibility = "";
};

document.multiselect("#testSelect1");