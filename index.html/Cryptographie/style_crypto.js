const right_panel_button = document.getElementById("toggle-right");
right_panel_button.addEventListener('click', right_panel_display);
document.getElementById("text_right").style.display = "none";
const title = document.getElementById("toggle-right").innerText; // title h1 of the page
document.getElementById("toggle-right").innerText = title + " ▼"; // text is hidden by default

let is_right_panel_open = false;

function right_panel_display(){
    if (!is_right_panel_open) {
        document.getElementById("text_right").style.display = "inline";
        document.getElementById("toggle-right").innerText = title + " ▲";
        is_right_panel_open = true;
    } else {
        document.getElementById("text_right").style.display = "none";
        document.getElementById("toggle-right").innerText = title + " ▼";
        is_right_panel_open = false;
    }
}