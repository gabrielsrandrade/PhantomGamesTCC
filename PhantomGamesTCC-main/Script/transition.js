let front = true;

function transition(){

const login = 
document.getElementsById("login");

const cadastro = 
document.getElementsById("cadastro");

    if (front){
    login.style.zIndex = '2';
    cadastro.style.zIndex = '1';
    } else{
    login.style.zIndex = '1';
    cadastro.style.zIndex = '2';
    }
front = !front;
}