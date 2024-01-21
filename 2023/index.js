$(document).ready(Main);

/**
 * Main function.
 */
function Main() {

    $(".side-box-hide").click(SwapSideBoxStatus);
}

/**
 * Swaps whether a side box list is being displayed or not.
 */
function SwapSideBoxStatus() {

    const list = $(this).parent().parent().children(".side-box-list");

    if (list.css("display") == "none") {
        list.css("display", "initial");
        $(this).text("[hide]");
    } else {
        list.css("display", "none");
        $(this).text("[show]");
    }
}

