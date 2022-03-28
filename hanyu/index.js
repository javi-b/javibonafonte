$(document).ready(Main);

// global constants and variables

const vocab_names = ["hsk1", "hsk2"];

let vocab_groups = []; // list of vocab groups
let vocab_groups_progress; // number of correct answers for each group
let enabled_vocab_groups = new Set(); // set of indexes of enabled groups

let vocab_pool = []; // list of currently available vocab units
let vocab_i = 0; // index of current vocab unit in the vocab pool

let session_started = false;
let session_finished = false;

/**
 * Main function.
 */
function Main() {

    LoadVocabHTML();
    LoadVocabFiles();

    vocab_groups_progress = new Array(vocab_names.length);
    vocab_groups_progress.fill(0);

    $("#start").click(OnStart);
    $("#next").click(OnNext);
    $(".group-title").click(SelectVocabGroup);
}

/**
 * Loads HTML elements related to every vocab group.
 */
function LoadVocabHTML() {

    let div = $("#vocab-controls");

    for (const name of vocab_names) {

        const p = $("<p></p>");
        const prgr_title = $('<span class="group-title ' + name + '">'
                + name + '</span>');
        const prgr = $('<span class=prgr><span class="prgr-val ' + name
                + '"></span></span>');
        const prgr_label = $('<span class="prgr-label ' + name
                + '">0%</span>');

        p.append(prgr_title);
        p.append(prgr);
        p.append(prgr_label)
        div.append(p);
    }
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
                vocab_groups.push(vocab_group);
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

    $("#english").text(vocab_pool[vocab_i].english);
    $("#input").css("display", "block");
    $("#input").focus();
    $("#start").prop("disabled", true);

    let group_titles = $(".group-title");
    for (let group_title of group_titles) {
        $(group_title).css("cursor", "default");
        $(group_title).css("text-decoration", "none");
    }

    session_started = true; // session_started flag
}

/**
 * Callback function for when answer is submitted.
 */
function OnSubmitAnswer() {

    const answer = $("#input").val();
    const correct = answer == vocab_pool[vocab_i].hanyu;
    const group_i = vocab_pool[vocab_i].group_i;

    // if answer correct and session hasn't finished,
    // updates vocab group's progress
    if (correct && !session_finished) {
        vocab_groups_progress[group_i]++;
        SetVocabGroupProgress(group_i, vocab_groups_progress[group_i]);
    }

    // updates html

    $("#correctness").css("color", (correct) ? "initial" : "DarkRed");
    $("#correctness").text((correct) ? "正确！" : "错误");
    $("#correctness").css("display", "initial");
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
        for (const group_i of enabled_vocab_groups)
            vocab_pool.push.apply(vocab_pool, vocab_groups[group_i]);
    }

    // gets new vocab unit index
    vocab_i = Math.floor(Math.random() * vocab_pool.length);

    // updates html

    $("#english").text(vocab_pool[vocab_i].english);

    $("#correctness").css("display", "none");
    $("#input").val("");
    $("#input").prop("disabled", false);
    $("#input").focus();

    $("#good-answer").css("display", "none");
    $("#next").css("display", "none");
}

/**
 * Sets vocab group progress value. Value is the number of vocab units
 * answered correctly.
 */
function SetVocabGroupProgress(group_i, value) {

    let pct = value / vocab_groups[group_i].length * 100;

    // only keeps going if its a valid value between 0 and 100
    if (pct < 0 || pct > 100)
        return;

    // sets vocab group progress bar value
    let prgr_val = $(".prgr-val." + vocab_names[group_i])[0];
    let width = 100 - pct;
    $(prgr_val).css("width", width + "%");

    // sets vocab group progress bar label
    let prgr_label = $(".prgr-label." + vocab_names[group_i])[0];
    $(prgr_label).text(pct.toFixed(0) + "%");
}

/**
 * Selects vocab group.
 */
function SelectVocabGroup() {

    // if the session already started, return immediatly
    if (session_started)
        return;

    const classes = $(this).attr("class").split(/\s+/);
    const vocab_name = classes[1];
    const vocab_group_i = vocab_names.indexOf(vocab_name);

    if (enabled_vocab_groups.has(vocab_group_i)) {
        enabled_vocab_groups.delete(vocab_group_i);
        $(this).css("font-weight", "normal");
    } else {
        enabled_vocab_groups.add(vocab_group_i);
        $(this).css("font-weight", "bold");
    }

    // updates list of selected vocab groups
    let str = "";
    if (enabled_vocab_groups.size > 0) {
        str += "( ";
        let i = 0;
        for (const group_i of enabled_vocab_groups) {
            str += vocab_names[group_i];
            if (i < enabled_vocab_groups.size - 1)
                str += ", ";
            i++;
        }
        str += " )";
    }
    $("#groups-list").text(str);

    // updates whether start button is disabled
    $("#start").prop("disabled",
            (enabled_vocab_groups.size == 0) ? true : false);
}
