$(document).ready(Main);

let hsk1;

let i = 0;
let progress = 0;

/**
 * Main function.
 */
function Main() {

    LoadVocabFiles();
    $("#start").click(OnStart);
    $("#next").click(OnNext);
    //$(".prgr-title").click(SelectVocabGroup);
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
    $("#input").css("display", "block");
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

    progress++;
    SetVocabGroupProgress("hsk1", progress / hsk1.length);

    let correct = answer == hsk1[i].hanyu;

    $("#correctness").css("color", (correct) ? "initial" : "DarkRed");
    $("#correctness").text((correct) ? "正确！" : "不正确");
    $("#correctness").css("display", "initial");
    $("#input").prop("disabled", true);

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

    $("#correctness").css("display", "none");
    $("#input").val("");
    $("#input").prop("disabled", false);
    $("#input").focus();

    $("#good-answer").css("display", "none");
    $("#next").css("display", "none");
}

/**
 * Sets vocab group progress value. Value is a number between 0 an 1.
 */
function SetVocabGroupProgress(group_name, value) {

    // only keeps going if its a valid value between 0 and 1
    if (value < 0 || value > 1)
        return;

    let pct = value * 100;

    // sets vocab group progress bar value
    let prgr_val = $(".prgr-val." + group_name)[0];
    let width = 100 - pct;
    $(prgr_val).css("width", width + "%");

    // sets vocab group progress bar label
    let prgr_label = $(".prgr-label." + group_name)[0];
    $(prgr_label).text(pct + "%");
}

/**
 * Selects vocab group.
 */
function SelectVocabGroup() {

    let classes = $(this).attr("class").split(/\s+/);
    let vocab_name = classes[1];
    console.log(vocab_name);
}
