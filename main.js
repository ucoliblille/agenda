
/**
 *
 * @param {HTMLElement} el
 */
function isPartOfPopup(el){
    if(el.classList.contains("pop-up")){
        return true;
    } else if(el.parentElement){
        return isPartOfPopup(el.parentElement);
    }
    return false;
}
function main(){
    initCalendar();
    initTool();
    for (let close of document.getElementsByClassName("close-popup")) {
        close.addEventListener("click", e => {
            if(isPartOfPopup(close)) {
                e.stopPropagation();
                toggleVisibilite(close.parentElement, false);
            }
        });
    }
    document.getRootNode().addEventListener("click", e => {
        if(!isPartOfPopup(e.target)) {
            e.stopPropagation();
            for (let popup of document.getElementsByClassName("pop-up")) {
                toggleVisibilite(popup, false);
            }
        }
    })
}
const toggleVisibilite = (el, visible = false) => {
    if (el === undefined) return;
    if(visible){
        el.classList.toggle("visible", true);
        el.classList.remove("hidden")
    } else {
        el.classList.toggle("hidden", true);
        el.classList.remove("visible")
    }
}
