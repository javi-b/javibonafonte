$(document).ready(Main);

// global constants and variables

const vocab_names = ["hsk1", "hsk2", "hsk3", "hello_grammar"];

let vocab_groups = []; // list of vocab groups
let vocab_groups_progress; // number of correct answers for each group
let enabled_vocab_groups = new Set(); // set of indexes of enabled groups

let vocab_pool = []; // list of currently available vocab units
let vocab_i = 0; // index of current vocab unit in the vocab pool
let num_corrects = 0, num_wrongs = 0;

let session_started = false;
let session_finished = false;

let correct_audio = new Audio("audio/correct.wav");
let incorrect_audio = new Audio("audio/incorrect.wav");

/**
 * Main function.
 */
function Main() {

    LoadVocabFiles();

    vocab_groups_progress = new Array(vocab_names.length);
    vocab_groups_progress.fill(0);

    $(".side-box-hide").click(SwapSideBoxStatus);
    $(".group-checkbox").click(SelectVocabGroup);
    $("#input").on("input", OnInputChange)
    $("#next").click(OnNext);
}

/**
 * Loads vocab CSV files into objects.
 */
function LoadVocabFiles() {

    for (let i = 0; i < vocab_names.length; i++) {
        $.ajax({
            type: "GET",
            url: "vocab/" + vocab_names[i] + ".csv",
            dataType: "text",
            success: function(csv) {

                vocab_group = $.csv.toObjects(csv);
                vocab_group.forEach(AddAccentPinyin);

                const name =
                    this.url.replace("vocab/", "").replace(".csv", "");
                const index = vocab_names.indexOf(name);

                vocab_groups[index] = vocab_group;
            }
        });
    }
}

/**
 * Adds accent pinyin string to vocab unit.
 */
function AddAccentPinyin(vocab_unit) {

    let pinyin_words = vocab_unit.pinyin.split(" ");
    vocab_unit.accent_pinyin = "";

    for (let i = 0; i < pinyin_words.length; i++) {
        accent_pinyin = GetAccentPinyin(pinyin_words[i]);
        if (i > 0)
            vocab_unit.accent_pinyin = vocab_unit.accent_pinyin + " ";
        vocab_unit.accent_pinyin = vocab_unit.accent_pinyin + accent_pinyin;
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

    let has_tone_number = ["0","1","2","3","4"].some(char => pinyin_word.includes(char));
    let word = (has_tone_number) ? pinyin_word.slice(0, -1) : pinyin_word;
    let tone_i = (has_tone_number) ? pinyin_word.slice(-1) - 1 : -1;

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

    return (word.replace(vowels[vowel_i], accent_vowels[tone_i + vowel_i * 4]));
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

/**
 * Selects vocab group.
 */
function SelectVocabGroup() {

    // if the session already started, return immediately
    if (session_started)
        return;

    const vocab_group_i = vocab_names.indexOf($(this).prop("value"));
    if (enabled_vocab_groups.has(vocab_group_i))
        enabled_vocab_groups.delete(vocab_group_i);
    else
        enabled_vocab_groups.add(vocab_group_i);

    // updates whether start button is disabled
    $("#start").prop("disabled", (enabled_vocab_groups.size == 0) ? true : false);
}

/**
 * Callback function for when quiz starts.
 */
function OnStart() {

    // sets up the vocab pool
    for (let i = 0; i < vocab_names.length; i++) {
        if (!enabled_vocab_groups.has(i))
            continue;
        vocab_groups[i].forEach(function(vocab_unit) {
            vocab_unit.group_i = i;
        });
        vocab_pool.push.apply(vocab_pool, vocab_groups[i]);
    }

    // sets first vocab unit index
    vocab_i = Math.floor(Math.random() * vocab_pool.length);

    // sets html

    SetEnglish(vocab_i);
    SetCharsLeft(vocab_i);

    let group_checkboxes = $(".group-checkbox");
    for (let group_checkbox of group_checkboxes)
        $(group_checkbox).prop("disabled", true);

    SetVocabProgressHTML();

    $("#accuracy").css("display", "initial");
    $("#chars-left").css("display", "initial");
    $("#input").css("display", "block");
    $("#input").focus();
    $("#start").prop("disabled", true);

    session_started = true; // session_started flag
}

/**
 * Sets HTML elements related to the chosen vocab groups.
 */
function SetVocabProgressHTML() {

    let div = $("#vocab-progress");

    div.css("display", "initial");

    for (let i = 0; i < vocab_names.length; i++) {
        if (!enabled_vocab_groups.has(i))
            continue;

        let name = vocab_names[i];

        const p = $("<p></p>");
        const prgr_title = $('<span class=group-title>' + name + '</span>');
        const prgr = $('<span class=prgr><span class="prgr-val ' + name + '"></span></span>');
        const prgr_label = $('<span class="prgr-label ' + name + '">0%</span>');
        const prgr_small_label = $('<span class="prgr-small-label off ' + name + '"></span>');

        p.append(prgr_title);
        p.append(prgr);
        p.append(prgr_label);
        p.append(prgr_small_label);
        div.append(p);
    }
}

/**
 * Callback function for when input text changes.
 */
function OnInputChange() {

    // regex for hanyu characters, including punctuation
    const non_hanyu_pattern = /[^\u4E00-\u9FFF\u3400-\u4DBF\u3000-\u303F\uFF00-\uFFEF]+/;
    const input_text = $(this).val();

    if (!non_hanyu_pattern.test(input_text)) { // if input text contains only hanyu...
        // updates number of characters left
        let chars_left = vocab_pool[vocab_i].hanyu.length - $(this).val().length;
        if (chars_left == 0)
            $("#chars-left").text("");
        else
            $("#chars-left").text("(" + chars_left + ")");
    }
}

/**
 * Callback function for when answer is submitted.
 */
function OnSubmitAnswer() {

    const answer = $("#input").val();
    const correct = answer == vocab_pool[vocab_i].hanyu;
    const group_i = vocab_pool[vocab_i].group_i;

    // plays audio
    if (correct)
        correct_audio.play();
    else
        incorrect_audio.play();

    // updates number of correct or wrong answers
    if (correct)
        num_corrects++;
    else
        num_wrongs++;
    const accuracy_pct = num_corrects / (num_corrects + num_wrongs) * 100;

    // if session hasn't finished updates vocab group's progress
    if (!session_finished) {
        if (correct)
            vocab_groups_progress[group_i]++;
        SetVocabGroupProgress(group_i, vocab_groups_progress[group_i]);
    }

    // updates html

    if (accuracy_pct >= 80)
        $("#accuracy-value").css("color", "SteelBlue");
    else if (accuracy_pct >= 50)
        $("#accuracy-value").css("color", "OliveDrab");
    else
        $("#accuracy-value").css("color", "DarkRed");
    $("#accuracy-value").text(accuracy_pct.toFixed(2) + "%");
    $("#correctness").css("color", (correct) ? "SteelBlue" : "DarkRed");
    $("#correctness").text((correct) ? "正确！" : "错误");
    $("#correctness").css("display", "initial");
    $("#chars-left").css("display", "none");
    $("#input").prop("disabled", true);

    $("#good-answer").css("display", "block");
    $("#hanyu").text(vocab_pool[vocab_i].hanyu);
    $("#pinyin").text(vocab_pool[vocab_i].accent_pinyin);

    $("#next").css("display", "initial");
    $("#next").focus();

    // if the answer was correct and the session hasn't been finished yet..
    if (correct && !session_finished)
        vocab_pool.splice(vocab_i, 1); // removes vocab unit from pool
}

/**
 * Callback function for when next question is requested.
 */
function OnNext() {

    // if finished all vocab...
    if (vocab_pool.length == 0) {

        session_finished = true;

        // readds all vocab units to the vocab pool
        for (let group_i of enabled_vocab_groups)
            vocab_pool.push.apply(vocab_pool, vocab_groups[group_i]);
    }

    // gets new vocab unit index
    vocab_i = Math.floor(Math.random() * vocab_pool.length);

    // updates html

    SetEnglish(vocab_i);
    SetCharsLeft(vocab_i);

    $("#correctness").css("display", "none");
    $("#chars-left").css("display", "initial");
    $("#input").val("");
    $("#input").prop("disabled", false);
    $("#input").focus();

    $("#good-answer").css("display", "none");
    $("#next").css("display", "none");
}

/**
 * Sets the english text for the current vocab unit.
 */
function SetEnglish(vocab_i) {

    $("#english").html(vocab_pool[vocab_i].english);
}

/**
 * Sets the number of hanyu characters left for the current vocab unit.
 */
function SetCharsLeft(vocab_i) {

    let chars_left = vocab_pool[vocab_i].hanyu.length;
    $("#chars-left").text("(" + chars_left + ")");
}

/**
 * Sets vocab group progress value. Value is the number of vocab units
 * answered correctly.
 */
function SetVocabGroupProgress(group_i, value) {

    const pct = value / vocab_groups[group_i].length * 100;
    const left = vocab_groups[group_i].length - value;

    // only keeps going if its a valid value between 0 and 100
    if (pct < 0 || pct > 100)
        return;

    // sets vocab group progress bar value
    let prgr_val = $(".prgr-val." + vocab_names[group_i])[0];
    let width = 100 - pct;
    $(prgr_val).css("width", width + "%");

    // sets vocab group progress bar label and small label
    let label = $(".prgr-label." + vocab_names[group_i])[0];
    $(label).text(pct.toFixed(0) + "%");
    let small_label = $(".prgr-small-label." + vocab_names[group_i])[0];
    if (left > 0)
        $(small_label).text(" (" + left + " left)");
    else
        $(small_label).text("");
}
