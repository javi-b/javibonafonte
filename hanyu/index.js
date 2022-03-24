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
            hsk1.forEach(AddAccentPinyin);
            $("#start").prop("disabled", false);
        }
    });
}

/**
 * Adds accent pinyin string to vocab unit.
 */
function AddAccentPinyin(vocab_item) {

    let pinyin_words = vocab_item.pinyin.split(" ");
    vocab_item.accent_pinyin = "";

    for (let i = 0; i < pinyin_words.length; i++) {
        accent_pinyin = GetAccentPinyin(pinyin_words[i]);
        if (i > 0)
            vocab_item.accent_pinyin = vocab_item.accent_pinyin + " ";
        vocab_item.accent_pinyin = vocab_item.accent_pinyin + accent_pinyin;
    }
}

/**
 * Gets the accent pinyin version of a specific pinyin word.
 */
function GetAccentPinyin(pinyin_word) {

    const vowels = ["a", "o", "e", "i", "u", "v"];
    const accent_vowels = [
        "ā", "á", "ǎ", "à",
        "ō", "ó", "ǒ", "ò",
        "ē", "é", "ě", "è",
        "ī", "í", "ǐ", "ì",
        "ū", "ú", "ǔ", "ù",
        "ū", "ǘ", "ǚ", "ǜ"
    ];

    let word = pinyin_word.slice(0, -1);
    let tone_i = pinyin_word.slice(-1) - 1;

    if (tone_i == -1) // if the word has no tone, returns the word clean
        return word;

    let vowel_i = -1;
    for (let i = 0; i < vowels.length; i++) {
        if (word.indexOf(vowels[i]) > -1) {
            vowel_i = i;
            break;
        }
    }

    if (vowel_i == -1) // if no vowel is found, returns the word clean
        return word;

    return (word.replace(vowels[vowel_i],
            accent_vowels[tone_i + vowel_i * 4]));
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
    $("#correctness").text((correct) ? "正确！" : "错误");
    $("#correctness").css("display", "initial");
    $("#input").prop("disabled", true);

    $("#good-answer").css("display", "block");
    $("#hanyu").text(hsk1[i].hanyu);
    $("#pinyin").text(hsk1[i].accent_pinyin);

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
    $(prgr_label).text(pct.toFixed(0) + "%");
}

/**
 * Selects vocab group.
 */
function SelectVocabGroup() {

    let classes = $(this).attr("class").split(/\s+/);
    let vocab_name = classes[1];
    console.log(vocab_name);
}
