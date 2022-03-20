$(document).ready(Main);

let hsk1;

let i = 0;

/**
 * Main function.
 */
function Main() {

    LoadVocabFiles();
    $("#start").click(OnStart);
    $("#next").click(OnNext);
}

/**
 * Loads vocab CSV files into objects.
 */
function LoadVocabFiles() {

    $.ajax({
        type: "GET",  
        url: "vocab/hsk1.csv",
        dataType: "text",       
        success: function(csv) {
            hsk1 = $.csv.toObjects(csv);
            $("#start").prop("disabled", false);
        }
    });
}

/**
 * Callback function for when quiz starts.
 */
function OnStart() {

    $("#english").text(hsk1[i].english);
    $("#input").css("display", "initial");
    $("#input").focus();
    $("#start").prop("disabled", true);
}

/**
 * Callback function for when answer is submitted.
 */
function OnSubmitAnswer() {

    let answer = $("#input").val();

    // if the answer is empty, does nothing
    if (answer.length == 0)
        return;

    $("#input").prop("disabled", true);

    let correct = answer == hsk1[i].hanyu;

    $("#good-answer").css("display", "block");
    $("#hanyu").text(hsk1[i].hanyu);
    $("#pinyin").text(hsk1[i].pinyin);

    $("#next").css("display", "initial");
    $("#next").focus();
}

/**
 * Callback function for when next question is requested.
 */
function OnNext() {

    i = (i + 1) % (hsk1.length);

    $("#english").text(hsk1[i].english);

    $("#input").val("");
    $("#input").prop("disabled", false);
    $("#input").focus();

    $("#good-answer").css("display", "none");
    $("#next").css("display", "none");
}

