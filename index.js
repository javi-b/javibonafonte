$(document).ready(Main);

/**
 * Main function.
 */
function Main() {

    // when hovering any element of class .popup-link and id #ppl-<...>,
    // it will interact with the element of class .popup and id #pp-<...>
    $(".popup-link").hover(function() {
        let ppl_id = "#" + this.id;
        let pp_id = "#pp-" + this.id.split("-")[1];
        ShowPopup(ppl_id, pp_id);
    }, function() {
        let pp_id = "#pp-" + this.id.split("-")[1];
        HidePopup(pp_id);
    });

    // starts looping the go text
    LoopGoText(0);
}

/**
 * Shows popup with specific id.
 */
function ShowPopup(ppl_id, pp_id) {

    let pos = $(ppl_id).position();
    let x = pos.left + $(ppl_id).width() + 10;
    let y = pos.top - 10;

    $(pp_id).css("left", x);
    $(pp_id).css("top", y);
    $(pp_id).css("display", "inline");
}

/**
 * Hides popup with specific id.
 */
function HidePopup(pp_id) {

    $(pp_id).css("display", "none");
}

/**
 * Loops Go text.
 */
function LoopGoText(i) {

    const go_texts = ["Go", "围棋", "囲碁", "바둑"];
    
    if (i < go_texts.length) {
        setTimeout(function() {
            $("#loop-go-text").html(go_texts[i]);
            LoopGoText(++i);
        }, 2000); // 1 second
    } else {
        LoopGoText(0);
    }
}
