$(document).ready(Main);

// global constants and variables

let prev_highlighted_text_p;

/**
 * Main function.
 */
function Main() {

    LocalGetAsync("zibuyu.json",
        function(response) {
            let zibuyu = JSON.parse(response);
            PopulateBody(zibuyu);
        });

    $(".side-box-hide").click(SwapSideBoxStatus);
}

/**
 * Local asynchronous GET request.
 */
function LocalGetAsync(url, callback) {

    $.ajax({
        type: "GET",
        url: url,
        dataType: "text",
        success: callback
    });
}

/**
 * Populates body of website using the data from the 'zibuyu' json.
 */
function PopulateBody(zibuyu) {

    const length = zibuyu.length;
    let zibuyu_div = $("#zibuyu");

    let column_l_div, column_l_page, column_r_div, column_r_page;
    let page_num = 10;

    for (let i = 0; i < length; i++) {

        if (i % 2 == 0) { // left page
            column_l_div = $("<div class=column-l></div>");
            column_l_page = $("<div class=page></div>");
            column_l_div.append(column_l_page);
        } else {
            column_r_div = $("<div class=column-r></div>");
            column_r_page = $("<div class=page></div>");
            column_r_div.append(column_r_page);
        }

        let column = ((i % 2 == 0) ? column_l_div : column_r_div);
        let page = ((i % 2 == 0) ? column_l_page : column_r_page);

        // populates column
        for (let text of zibuyu[i]) {

            // for now, ignore sound texts
            if (text.style == "sound")
                continue;

            let hanyu = ((text.hanyu) ? text.hanyu : "");
            let pinyin = ((text.pinyin) ? text.pinyin : "");
            let text_p = $("<p class='"
                + ((text.style) ? " style-" + text.style + " " : "")
                + ((text.right) ? "right" : "") + "'>"
                + "<span class=hanyu>" + hanyu + "</span><br>"
                + "<span class=pinyin >" + pinyin + "</span></p>");
            text_p.on("mouseenter", function() {
                ShowEnglish(text.english);
                HighlightText(this);
            });

            if (i % 2 == 0) // left page
                page.append(text_p);
            else // right page
                page.append(text_p);
        }

        column.append("<p class='page-number small-text center off'>"
            + String(page_num).padStart(3, "0") + "</p>");

        if (i % 2 == 1 || i == length - 1) { // right page or last page
            let row_div = $("<div class=row></div>");
            row_div.append(column_l_div);
            if (i % 2 == 1)
                row_div.append(column_r_div);
            else
                row_div.append($("<div class='column-r pageless-column'></div>"));
            zibuyu_div.append(row_div);
        }

        page_num++;
    }
}

/**
 * Shows specific english string on the english div.
 */
function ShowEnglish(english_str) {

    if (english_str)
        $("#english").text(english_str);
    else
        $("#english").text("-");
}

/**
 * Highlights a specific text p and stops highlighting the previous one.
 */
function HighlightText(text_p) {

    if ($(prev_highlighted_text_p).hasClass("highlighted"))
        $(prev_highlighted_text_p).removeClass("highlighted");
    $(text_p).addClass("highlighted");
    prev_highlighted_text_p = text_p;
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
