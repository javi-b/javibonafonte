/**
 * Author: Javi Bonafonte
 *
 * TODO:
 * - More forms... Minior, Necorzma, Magearma
 * - Missing shinies: Yungoos, Castform forms (pokemonshowdown)
 */

$(document).ready(Main);

// global constants and variables

const JB_URL = "https://raw.githubusercontent.com/javi-b/pokemon-resources/main/";
const GIFS_URL = JB_URL + "graphics/ani/";
const SHINY_GIFS_URL = JB_URL + "graphics/ani-shiny/";
const POGO_PNGS_URL = JB_URL + "graphics/pogo-256/"
const SHINY_POGO_PNGS_URL = JB_URL + "graphics/pogo-shiny-256/"
const ICONS_URL = JB_URL + "graphics/pokemonicons-sheet.png";

const LOADING_MAX_VAL = 5; // max number of files that need to be loaded
let loading_val = 0; // number of files loaded so far
let finished_loading = false; // whether page finished loading all files

// jb json objects
let jb_names, jb_mega, jb_pkm, jb_max_id, jb_fm, jb_cm;

// settings constants and variables
const METRICS = new Set();
METRICS.add("ER");
METRICS.add("EER");
METRICS.add("TER");
let settings_metric = "EER";
let settings_default_level = 40;

// whether pokemon go table moves are currenlty being loaded asyncronously,
// so no new pokemon should be loaded for now
// FIXME this is a workaround, what should actually be done is that,
//       if a new pokemon is loaded, moves being added to the previous one
//       asyncronously, should be cancelled
let loading_pogo_moves = false;

// search input selected suggestion index
let selected_suggestion_i = -1;

/**
 * Main function.
 */
function Main() {

    $("#input").bind("keydown", OnInputKeyDown);
    $("#input").bind("keyup", OnInputKeyUp);
    $("#input").bind("focus", OnInputFocus);
    $("#input").bind("blur", OnInputBlur);

    $("#input").focus();

    // jb
    HttpGetAsync(JB_URL + "pokemon_names.json",
        function(response) { jb_names = JSON.parse(response); });
    HttpGetAsync(JB_URL + "mega_pokemon.json",
        function(response) { jb_mega = JSON.parse(response); });
    HttpGetAsync(JB_URL + "pogo_pkm.json",
        function(response) {
            jb_pkm = JSON.parse(response);
            jb_max_id = jb_pkm.at(-1).id;
        });
    HttpGetAsync(JB_URL + "pogo_fm.json",
        function(response) { jb_fm = JSON.parse(response); });
    HttpGetAsync(JB_URL + "pogo_cm.json",
        function(response) { jb_cm = JSON.parse(response); });

    // event handlers

    // when going back or forward in the browser history
    window.onpopstate = function() { CheckURLAndAct(); }

    $("#settings-hide").click(SwapSettingsStatus);
    $("#metric-er").click(function() { SetMetric("ER"); });
    $("#metric-eer").click(function() { SetMetric("EER"); });
    $("#metric-ter").click(function() { SetMetric("TER"); });
    $("#lvl-40").click(function() { SetDefaultLevel(40); });
    $("#lvl-50").click(function() { SetDefaultLevel(50); });

    $("#stats-form").submit(function(e) {
        UpdatePokemonStatsAndURL();
        return false;
    });

    $("#strongest-link").click(function() {
        LoadStrongestAndUpdateURL();
        return false;
    });

    $("#strongest :checkbox").change(function() {
        //LoadStrongest();
        CheckURLAndAct();
    });
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
 * Asynchronous HTTP GET request to a specific url and with a specific
 * callback function.
 */
function HttpGetAsync(url, callback) {

    let xml_http = new XMLHttpRequest();
    xml_http.onreadystatechange = function() { 
        if (xml_http.readyState == 4 && xml_http.status == 200) {
            callback(xml_http.response);
            IncreaseLoadingVal();
        }
    }
    xml_http.open("GET", url, true); // true for asynchronous 
    xml_http.send(null);
}

/**
 * Increases value that represents number of files loaded so far
 * and updates its html loading bar on the page.
 */
function IncreaseLoadingVal() {

    loading_val++;
    let pct = 100 * loading_val / LOADING_MAX_VAL;
    $("#loading-bar").css("width", pct + "%");

    // if finished loading...
    if (pct >= 100) {
        finished_loading = true;
        setTimeout(function() {
            $("#loading-bar").css("display", "none");
        }, 100);
        CheckURLAndAct();
    }
}

/**
 * Swaps whether the settings list is being displayed or not.
 */
function SwapSettingsStatus() {

    const list = $("#settings-list");

    if (list.css("display") == "none") {
        list.css("display", "initial");
        $(this).text("[hide]");
    } else {
        list.css("display", "none");
        $(this).text("[show]");
    }
}

/**
 * Sets the metric setting and, if necessary, updates the page accordingly.
 */
function SetMetric(metric) {

    if (!METRICS.has(metric) || metric == settings_metric)
        return;

    // sets global variable
    settings_metric = metric;

    // sets settings options selected class
    $("#metric-er").removeClass("settings-opt-sel");
    $("#metric-eer").removeClass("settings-opt-sel");
    $("#metric-ter").removeClass("settings-opt-sel");
    switch (settings_metric) {
        case "ER":
            $("#metric-er").addClass("settings-opt-sel");
            break;
        case "EER":
            $("#metric-eer").addClass("settings-opt-sel");
            break;
        case "TER":
            $("#metric-ter").addClass("settings-opt-sel");
            break;
    }

    // sets pokemongo table header
    $("#table-metric-header").html(settings_metric);
    $("#table-metric-header-sh").html(settings_metric + "<br>(Shadow)");

    // reload page
    CheckURLAndAct();
}

/**
 * Sets the default level setting and, if necessary, updates the page accordingly.
 */
function SetDefaultLevel(level) {

    if (level != 40 && level != 50)
        return;

    // sets global variable
    settings_default_level = level;

    // sets settings options selected class
    $("#lvl-40").removeClass("settings-opt-sel");
    $("#lvl-50").removeClass("settings-opt-sel");
    switch (level) {
        case 40:
            $("#lvl-40").addClass("settings-opt-sel");
            break;
        case 50:
            $("#lvl-50").addClass("settings-opt-sel");
            break;
    }

    // reload page
    CheckURLAndAct();
}

/**
 * Callback function for KeyDown event in search input box.
 */
function OnInputKeyDown(e) {

    let selected_suggestion_changed = false;

    switch (e.keyCode) {

        case 9: // tab
            e.preventDefault();
            break;

        case 13: // enter
            e.preventDefault();
            if (selected_suggestion_i > -1) {
                const selected_text = $("#suggestions").children()
                        .eq(selected_suggestion_i)[0].textContent;
                const name =
                    selected_text.slice(selected_text.indexOf(" "));
                LoadPokemonAndUpdateURL(Clean(name));
            } else {
                LoadPokemonAndUpdateURL(Clean($("#input").val()));
            }
            break;

        case 38: // arrow up
            e.preventDefault();
            selected_suggestion_i--;
            selected_suggestion_changed = true;
            break;

        case 40: // arrow down
            e.preventDefault();
            selected_suggestion_i++;
            selected_suggestion_changed = true;
            break;
    }

    if (selected_suggestion_changed)
        UpdateSelectedSuggestion();
}

/**
 * Callback function for KeyUp event in search input box.
 */
function OnInputKeyUp(e) {

    if (e.keyCode == 38 || e.keyCode == 40)
        return;

    UpdateInputSuggestions();
}

/**
 * Callback function for Focus event in search input box.
 */
function OnInputFocus(e) {

    UpdateInputSuggestions();
}

/**
 * Callback function for Blur event in search input box.
 * The Blur event fires when an element has lost focus.
 */
function OnInputBlur(e) {

    let suggestions = $("#suggestions");

    // empties suggestions
    suggestions.empty();

    // sets borders
    suggestions.css("border", "none");
    suggestions.css("border-top", "1px solid var(--col-off)");
}

/**
 * Updates the search input suggestions.
 */
function UpdateInputSuggestions() {

    // checks whether json object is available
    if (!jb_names)
        return;

    selected_suggestion_i = -1;

    const input = $("#input").val();
    const clean_input = input.toLowerCase();
    const input_len = clean_input.length;
    let suggestions = $("#suggestions");

    suggestions.empty();

    if (input_len > 0) {

        const jb_names_key = Object.keys(jb_names);
        for (key of jb_names_key) {

            const entry = jb_names[key];

            if (entry.id > jb_max_id)
                continue;

            // whether input starts with a pokemon id
            const same_id = (String(entry.id).startsWith(clean_input));

            // whether input starts with a pokemon '#' + id
            const hash_id = "#" + String(entry.id);
            const same_hash_id = (hash_id.startsWith(clean_input));

            // whether input starts with a pokemon name
            const same_name =
                (entry.name.toLowerCase().startsWith(clean_input));

            // if the input matches any possible start...
            if (same_id || same_hash_id || same_name ) {

                // index of suggestion currently being added
                const sug_i = suggestions.children().length;

                let sug_p = $("<p></p>");
                sug_p.mouseover(function () {
                    selected_suggestion_i = sug_i;
                    UpdateSelectedSuggestion();
                });
                sug_p.mousedown(function () {
                    LoadPokemonAndUpdateURL(entry.id);
                });
            
                if (same_id) {
                    sug_p.html("#<b>" + clean_input + "</b>"
                            + String(entry.id).slice(input_len)
                            + " " + entry.name);

                } else if (same_hash_id) {
                    sug_p.html("<b>" + clean_input + "</b>"
                            + hash_id.slice(input_len) + " " + entry.name);

                } else if (same_name) {
                    sug_p.html("#" + entry.id + " <b>" + input + "</b>"
                            + entry.name.slice(input_len));
                }

                suggestions.append(sug_p);
                if (suggestions.children().length >= 10)
                    break;
            }
        }

        // sets borders
        if (suggestions.children().length > 0) {
            suggestions.css("border", "1px solid var(--col-off)");
        } else {
            suggestions.css("border", "none");
            suggestions.css("border-top", "1px solid var(--col-off)");
        }

    } else {

        // sets borders
        suggestions.css("border", "none");
        suggestions.css("border-top", "1px solid var(--col-off)");
    }
}

/**
 * Updates which suggestion is currently selected according to
 * the global variable 'selected_suggestion_i'.
 */
function UpdateSelectedSuggestion() {

    const suggestions = $("#suggestions").children();

    if (selected_suggestion_i < -1)
        selected_suggestion_i = -1;
    if (selected_suggestion_i >= suggestions.length)
        selected_suggestion_i = suggestions.length - 1;

    for (let i = 0; i < suggestions.length; i++) {
        if (i == selected_suggestion_i)
            suggestions.eq(i).addClass("selected-suggestion");
        else
            suggestions.eq(i).removeClass("selected-suggestion");
    }
}

/**
 * Checks whether the current url contains search parameters that dictate
 * what to do. If it finds something, it does it.
 */
function CheckURLAndAct() {

    const params = new URLSearchParams(location.search);

    // if url has pokemon params...
    if (params.has("p")) {

        const pkm = params.get("p");

        let form = "def";
        if (params.has("f"))
            form = params.get("f");

        let mega = false;
        if (params.has("m"))
            mega = true;

        let mega_y = false;
        if (params.has("y"))
            mega_y = true;

        let level = null;
        if (params.has("lvl"))
            level = Number(params.get("lvl"));

        let ivs = null;
        if (params.has("ivs")) {
            let ivs_str = params.get("ivs");
            ivs = {
                atk: parseInt(ivs_str.slice(0, 2)),
                def: parseInt(ivs_str.slice(2, 4)),
                hp: parseInt(ivs_str.slice(4, 6))
            };
            function IsValidIV(val) {
                return (Number.isInteger(val) && val >= 0 && val <= 15);
            }
            if (!IsValidIV(ivs.atk) || !IsValidIV(ivs.def)
                    || !IsValidIV(ivs.hp)) {
                ivs = null;
            }
        }

        // loads pokemon
        LoadPokemon(pkm, form, mega, mega_y, level, ivs);

        return;
    }

    // if url has 'strongest' param...
    if (params.has("strongest")) {

        // if url has 't' param...
        if (params.has("t")) {
            let type = params.get("t");
            type = type.charAt(0).toUpperCase()
                + type.slice(1).toLowerCase();
            if (POKEMON_TYPES.has(type)) { // if 't' param makes sense...
                // loads strongest of type
                LoadStrongest(type);
                return;
            }
        }

        // loads strongest
        LoadStrongest();

        return;
    }
}

/**
 * Calls the 'LoadPokemon' function and updates the url to match the
 * pokemon being loaded.
 */
function LoadPokemonAndUpdateURL(clean_input, form = "def", mega = false,
        mega_y = false, level = null, ivs = null) {

    if (!finished_loading || loading_pogo_moves)
        return false;

    LoadPokemon(clean_input, form, mega, mega_y, level, ivs);

    let url = "?p=" + clean_input;

    if (form != "def")
        url += "&f=" + form;
    if (mega)
        url += "&m";
    if (mega_y)
        url += "&y";
    if (level)
        url += "&lvl=" + String(level);
    if (ivs) {
        url += "&ivs="
            + String(ivs.atk).padStart(2, "0")
            + String(ivs.def).padStart(2, "0")
            + String(ivs.hp).padStart(2, "0");
    }

    window.history.pushState({}, "", url);

    return false;
}

/**
 * Loads a pokemon page.
 */
function LoadPokemon(clean_input, form = "def", mega = false,
        mega_y = false, level = null, ivs = null) {

    if (!finished_loading || loading_pogo_moves)
        return;

    // gets the pokemon id from the input and returns if it doesn't find it
    const pokemon_id = GetPokemonId(clean_input);
    if (pokemon_id == 0)
        return;

    // sets the page title
    const pokemon_name = jb_names[pokemon_id].name;
    document.title = "#" + pokemon_id + " " + pokemon_name
            + " - Palkia's Pokédex";

    // sets the default form
    if (form == "def")
        form = GetPokemonDefaultForm(pokemon_id);

    // sets the default level
    if (level == null)
        level = settings_default_level;
    
    // sets level input value
    $("#input-lvl").val(level);

    // sets the default ivs
    if (ivs == null)
        ivs = { atk: 15, def: 15, hp: 15 };

    // sets ivs inputs values
    $("#input-atk").val(ivs.atk);
    $("#input-def").val(ivs.def);
    $("#input-hp").val(ivs.hp);

    // empties the input
    $("#input").val("");

    // empties the pokemon containers
    $("#main-container").empty();
    $("#previous-containers").empty();
    $("#next-containers").empty();
    $("#additional-containers").empty();

    const forms = GetPokemonForms(pokemon_id);
    const def_form = forms[0];

    // sets main pokemon container
    $("#main-container").append(GetPokemonContainer(pokemon_id,
            (form == def_form && !mega), def_form));

    // sets previous and next pokemon containers
    for (i = 1; i <= 2; i++) {
        const prev_pokemon_id = parseInt(pokemon_id) - i;
        if (prev_pokemon_id > 0) {
            $("#previous-containers").prepend(
                GetPokemonContainer(prev_pokemon_id, false,
                    GetPokemonDefaultForm(prev_pokemon_id)));
        }
        const next_pokemon_id = parseInt(pokemon_id) + i;
        if (next_pokemon_id <= jb_max_id) {
            $("#next-containers").append(
                GetPokemonContainer(next_pokemon_id, false,
                    GetPokemonDefaultForm(next_pokemon_id)));
        }
    }

    // sets additional pokemon containers

    let additional_cs = $("#additional-containers");

    const can_be_mega = jb_mega[pokemon_id];

    if (can_be_mega) {
        if (pokemon_id == 6 || pokemon_id == 150) { // charizard and mewtwo
            additional_cs.append(GetPokemonContainer(
                    pokemon_id, mega && !mega_y, "Normal", true, false));
            additional_cs.append(GetPokemonContainer(
                    pokemon_id, mega && mega_y, "Normal", true, true));
        } else {
            additional_cs.append(
                GetPokemonContainer(pokemon_id, mega, "Normal", true));
        }
    }

    const additional_forms = forms.slice(1);

    for (f of additional_forms) {
        additional_cs.append(
            GetPokemonContainer(pokemon_id, form == f, f));
    }

    // deals with additional containers overflow
    if (additional_cs.children().length > 6)
        additional_cs.addClass("additional-containers-overflow");
    else
        additional_cs.removeClass("additional-containers-overflow");

    // displays what should be displayed
    if ($("#strongest").css("display") != "none")
        $("#strongest").css("display", "none");
    if ($("#pokedex").css("display") == "none")
        $("#pokedex").css("display", "block");
    if ($("#pokemongo").css("display") == "none")
        $("#pokemongo").css("display", "initial");

    LoadPokemongo(pokemon_id, form, mega, mega_y, level, ivs);
}

/**
 * Gets the pokemon id from a clean input (lowercase alphanumeric).
 * The input could be the id itself or the pokemon name.
 * Returns 0 if it doesn't find it.
 */
function GetPokemonId(clean_input) {

    // checks for an id
    if (/^\d+$/.test(clean_input)) { // if input is an integer
        if (clean_input >= 1 && clean_input <= jb_max_id)
            return parseInt(clean_input);
    }

    // checks for a name
    let pokemon_id = 0;
    Object.keys(jb_names).forEach(function (key) {
        if (Clean(jb_names[key].name) == clean_input)
            pokemon_id = key;
    });

    // if still didn't find anything
    if (pokemon_id == 0) {

        // checks for stupid nidoran
        if (clean_input == "nidoranf")
            return 29;
        else if (clean_input == "nidoranm")
            return 32;
    }

    if (pokemon_id > jb_max_id)
        return 0;

    return parseInt(pokemon_id);
}

/**
 * Gets array of specific pokemon types. Takes into account form and whether
 * is mega.
 */
function GetPokemonTypesFromId(pokemon_id, form, mega, mega_y) {

    let jb_pkm_obj = jb_pkm.find(entry =>
            entry.id == pokemon_id && entry.form == form);
    return (jb_pkm_obj) ? GetPokemonTypes(jb_pkm_obj, mega, mega_y) : [];
}

/**
 * Gets array of specific pokemon types.
 * 
 * Receives the pokemon's jb object as an argument.
 */
function GetPokemonTypes(jb_pkm_obj, mega, mega_y) {

    types = [];

    if (mega_y) {
        if (jb_pkm_obj.mega && jb_pkm_obj.mega[1])
            types = jb_pkm_obj.mega[1].types;
    } else if (mega) {
        if (jb_pkm_obj.mega && jb_pkm_obj.mega[0])
            types = jb_pkm_obj.mega[0].types;
    } else {
        types = jb_pkm_obj.types;
    }

    return types;
}

/**
 * Gets a pokemon container div element set up with a specified pokemon.
 */
function GetPokemonContainer(pokemon_id, is_selected, form = "Normal",
        mega = false, mega_y = false) {

    const pokemon_name = jb_names[pokemon_id].name;
    const clean_name = Clean(pokemon_name);
    const img_src_name = GetPokemonImgSrcName(pokemon_id, clean_name, form,
            mega, mega_y);
    const img_src = GIFS_URL + img_src_name + ".gif";
    const can_be_mega_y = pokemon_id == 6 || pokemon_id == 150; 
    const primal = mega && (pokemon_id == 382 || pokemon_id == 383);
    const form_text = GetFormText(pokemon_id, form);

    // container div
    const pokemon_container_div = $("<div></div>");

    // form text p
    if (form_text.length > 0) {
        const form_text_div = $("<div class='pokemon-form'>"
                + "<p class='pokefont unselectable small-text'>"
                + form_text + "</p></div>");
        pokemon_container_div.append(form_text_div);
    }

    // shiny img
    const shiny_img =
        $("<div class=shiny-img-div><img src=imgs/shiny.png></img></div>");
    pokemon_container_div.append(shiny_img);

    // img container div
    let img_container_div = $("<div class=img-container></div>");
    if (is_selected)
        img_container_div.css("border", "1px solid var(--col-main)");
    img_container_div.append(
            $("<img class=loading src=imgs/loading.gif></img>"));
    img_container_div.append($("<img class=pokemon-img "
            + "onload ='HideLoading(this)' onerror='TryNextSrc(this)'"
            + " onclick='SwapShiny(this)' src="
            + img_src + "></img>"));
    pokemon_container_div.append(img_container_div);

    // pokemon name p
    const pokemon_name_p= $("<p class='pokemon-name pokefont unselectable'"
            + "onclick='LoadPokemonAndUpdateURL(" + pokemon_id + ", \""
            + form + "\", " + mega + ", " + mega_y + ")'>#" + pokemon_id
            + ((primal) ? (" Primal ") : ((mega) ? " Mega " : " "))
            + pokemon_name
            + ((mega && can_be_mega_y) ? ((mega_y) ? " Y " : " X ") : "")
            + "</p>");
    pokemon_container_div.append(pokemon_name_p);

    // pokemon types
    const types = GetPokemonTypesFromId(pokemon_id, form, mega, mega_y);
    const pokemon_types_div = $("<div class=pokemon-types></div>");
    for (type of types) {
        pokemon_types_div.append($("<img src=imgs/types/"
                + type.toLowerCase() + ".gif></img>"));
    }
    pokemon_container_div.append(pokemon_types_div);

    return pokemon_container_div;
}

/**
 * Loads one pokemon data for the Pokemon GO section.
 */
function LoadPokemongo(pokemon_id, form, mega, mega_y, level, ivs) {

    let jb_pkm_obj = jb_pkm.find(entry =>
            entry.id == pokemon_id && entry.form == form);
    let released = true && jb_pkm_obj;
    if (mega)
        released = released && jb_pkm_obj.mega;
    if (mega_y)
        released = released && jb_pkm_obj.mega.length == 2;

    // if this pokemon is not released in pokemon go yet...
    if (!released) {
        $("#not-released").css("display", "initial");
        $("#released").css("display", "none");
        if ($("#legend").css("display") != "none")
            $("#legend").css("display", "none");
        return;
    }

    // if this pokemon is released in pokemon go...

    $("#not-released").css("display", "none");
    $("#released").css("display", "initial");
    if ($("#legend").css("display") == "none")
        $("#legend").css("display", "initial");

    const stats = GetPokemonStats(jb_pkm_obj, mega, mega_y, level, ivs);
    LoadPokemongoBaseStats(stats);
    LoadPokemongoCP(stats);
    UpdatePokemongoCPText(level, ivs);
    LoadPokemongoCounters(jb_pkm_obj, mega, mega_y);
    LoadPokemongoTable(jb_pkm_obj, mega, mega_y, stats);
}

/**
 * Gets the Pokemon GO stats of a specific pokemon when it is level 40
 * and it has some specific IV points.
 * 
 * Receives the pokemon's jb object as an argument.
 */
function GetPokemonStats(jb_pkm_obj, mega, mega_y, level, ivs) {

    let stats;

    if (mega && mega_y) // mega y
        stats = jb_pkm_obj.mega[1].stats;
    else if (mega) // mega x or normal mega
        stats = jb_pkm_obj.mega[0].stats;
    else // any form non mega
        stats = jb_pkm_obj.stats;

    let cpm = GetCPMForLevel(level);

    stats.atk = (stats.baseAttack + ivs.atk) * cpm;
    stats.def = (stats.baseDefense + ivs.def) * cpm;
    stats.hp = (stats.baseStamina + ivs.hp) * cpm;

    return stats;
}

/**
 * Gets the Pokemon GO stats of a specific pokemon when it is the level set by
 * the settings and it has the maximum IV points.
 * 
 * Receives the pokemon's jb object as an argument.
 */
function GetMaxStats(jb_pkm_obj, mega, mega_y) {

    const ivs = { atk: 15, def: 15, hp: 15 };
    return GetPokemonStats(jb_pkm_obj, mega, mega_y,
            settings_default_level, ivs);
}

/**
 * Loads the section containing the base stats of the selected pokemon.
 * 
 * The bar indicator is based on the base stat number, with the ceiling being the
 * base stat value from the pokemon with the strongest value for that particular
 * base stat.
 */
function LoadPokemongoBaseStats(stats) {

    const user_agent = window.navigator.userAgent;
    const is_apple = user_agent.includes("Macintosh")
        || user_agent.includes("iPhone") || user_agent.includes("iPad")
        || user_agent.includes("iPod");

    const atk_ceil = 345; // current top atk pkm: Deoxys - 345
    const def_ceil = 396; // current top def pkm: Shuckle - 396
    const hp_ceil = 496; // current top hp pkm: Blissey - 496

    const atk = stats.baseAttack;
    const def = stats.baseDefense;
    const hp = stats.baseStamina;

    let atk_html = "atk <abbr class=ascii-bar title=" + atk + ">";
    let def_html = "def <abbr class=ascii-bar title=" + def + ">";
    let hp_html = "hp <abbr class=ascii-bar title=" + hp + ">";

    const gray_ch = (is_apple) ? "▒" : "▓";

    for (let i = 1; i <= 5; i++) {
        atk_html += (i * atk_ceil / 6 < atk)
            ? "█"  : ((i * atk_ceil / 6 - atk_ceil / 12 < atk)
                ? gray_ch : "░");
        def_html += (i * def_ceil / 6 < def)
            ? "█"  : ((i * def_ceil / 6 - def_ceil / 12 < def)
                ? gray_ch : "░");
        hp_html += (i * hp_ceil / 6 < hp)
            ? "█"  : ((i * hp_ceil / 6 - hp_ceil / 12 < hp)
                ? gray_ch : "░");
    }

    atk_html += "</abbr>";
    def_html += "</abbr>";
    hp_html += "</abbr>";

    $("#base-stat-atk").html(atk_html);
    $("#base-stat-def").html(def_html);
    $("#base-stat-hp").html(hp_html);

    if (is_apple) {
        $(".ascii-bar").addClass("monospace");
        $(".ascii-bar").css("font-size", "15px");
    }
}

/**
 * Loads the progress bar CP of the selected pokemon with its specific stats.
 */
function LoadPokemongoCP(stats) {

    let cp = Math.floor(stats.atk * Math.pow(stats.def, 0.5)
                * Math.pow(stats.hp, 0.5) / 10);
    if (cp < 10)
        cp = 10;

    let prgr_pct = cp * 100 / 5000;
    if (prgr_pct > 100)
        prgr_pct = 100;

    const width = 100 - prgr_pct;
    $(".prgr-val").css("width", width + "%");
    $("#max-cp").text("CP ");
    const bold_num = $("<b>" + cp + "</b>");
    $("#max-cp").append(bold_num);
}

/**
 * Updates the text for pokemon max cp to match the level and IVs being used to
 * calculate it.
 */
function UpdatePokemongoCPText(level, ivs) {

    const pct = Math.round(100 * (ivs.atk + ivs.def + ivs.hp) / 45);
    $("#cp-text").text("with IVs " + ivs.atk + "/" + ivs.def + "/" + ivs.hp
            + " (" + pct + "%) at level " + level);
}

/**
 * Loads table in the Pokemon GO section sorting the pokemon types according to
 * their effectiveness against the selected pokemon. Note that types that are
 * neutral towards the selected pokemon aren't displayed.
 * 
 * Receives the pokemon's jb object as an argument.
 */
function LoadPokemongoCounters(jb_pkm_obj, mega, mega_y) {

    let types = jb_pkm_obj.types;
    if (mega) {
        if (mega_y)
            types = jb_pkm_obj.mega[1].types;
        else
            types = jb_pkm_obj.mega[0].types;
    }

    let counters_0391 = [];
    let counters_0625 = [];
    let counters_1 = [];
    let counters_160 = [];
    let counters_256 = [];

    for (let attacker_type of POKEMON_TYPES) {
        const type_effect = POKEMON_TYPES_EFFECT.get(attacker_type);
        let mult = 1;
        for (let type of types) {
            if (type_effect[0].includes(type))
                mult *= 0.391;
            else if (type_effect[1].includes(type))
                mult *= 0.625;
            else if (type_effect[2].includes(type))
                mult *= 1.60;
        }
        if (Math.abs(mult - 0.391) < 0.001)
            counters_0391.push(attacker_type);
        else if (Math.abs(mult - 0.625) < 0.001)
            counters_0625.push(attacker_type);
        else if (Math.abs(mult - 1.60) < 0.001)
            counters_160.push(attacker_type);
        else if (Math.abs(mult - 2.56) < 0.001)
            counters_256.push(attacker_type);
        else
            counters_1.push(attacker_type);
    }

    $("#counters-title").html("Types effectiveness against<br><b>"
            + jb_pkm_obj.name + "</b>");

    let counters_0391_html = "";
    for (let type of counters_0391) {
        counters_0391_html += "<a class='type-text bg-" + type
                + "' onclick='LoadStrongestAndUpdateURL(\"" + type
                + "\")'>" + type + "</a> ";
    }
    $("#counters-0391").html(counters_0391_html);

    let counters_0625_html = "";
    for (let type of counters_0625) {
        counters_0625_html += "<a class='type-text bg-" + type
                + "' onclick='LoadStrongestAndUpdateURL(\"" + type
                + "\")'>" + type + "</a> ";
    }
    $("#counters-0625").html(counters_0625_html);

    /*
    let counters_1_html = "";
    for (let type of counters_1) {
        counters_1_html += "<a class='type-text bg-" + type
                + "' onclick='LoadStrongestAndUpdateURL(\"" + type
                + "\")'>" + type + "</a> ";
    }
    $("#counters-1").html(counters_1_html);
    */

    let counters_160_html = "";
    for (let type of counters_160) {
        counters_160_html += "<a class='type-text bg-" + type
                + "' onclick='LoadStrongestAndUpdateURL(\"" + type
                + "\")'>" + type + "</a> ";
    }
    $("#counters-160").html(counters_160_html);

    let counters_256_html = "";
    for (let type of counters_256) {
        counters_256_html += "<a class='type-text bg-" + type
                + "' onclick='LoadStrongestAndUpdateURL(\"" + type
                + "\")'>" + type + "</a> ";
    }
    $("#counters-256").html(counters_256_html);
}

/**
 * Loads the table in the Pokemon Go section including information about
 * the possible move combinations and their ratings.
 * 
 * Receives the pokemon's jb object as an argument.
 */
function LoadPokemongoTable(jb_pkm_obj, mega, mega_y, stats) {

    // whether can be shadow
    const can_be_shadow = jb_pkm_obj.shadow && !mega;

    // types
    const types = GetPokemonTypes(jb_pkm_obj, mega, mega_y);

    const atk = stats.atk;
    const def = stats.def;
    const hp = stats.hp;

    // shadow stats
    let atk_sh = atk * 6 / 5;
    let def_sh = def * 5 / 6;

    // removes previous table rows
    $("#pokemongo-table tr:not(.table-header)").remove();

    const moves = GetPokemongoMoves(jb_pkm_obj);
    if (moves.length != 4)
        return;

    const fms = moves[0];
    const cms = moves[1];
    const elite_fms = moves[2];
    const elite_cms = moves[3];

    const all_fms = fms.concat(elite_fms);
    const all_cms = cms.concat(elite_cms);

    // appends new table rows asynchronously (so that Mew loads fast)
    // each chunk of moves combinations with a specific fast move
    // is appended in a different frame

    /**
     * Appends all the rows containing a specific fast move.
     * Receives the index of the fast move and the callback function
     * for when all chunks have been appended as arguments.
     */
    function AppendFMChunk(fm_i, callback) {

        const fm = all_fms[fm_i];
        const fm_is_elite = elite_fms.includes(fm);

        // gets the fast move object
        const fm_obj = jb_fm.find(entry => entry.name == fm);
        if (!fm_obj) {
            fm_i++;
            if (fm_i < all_fms.length)
                setTimeout(function() {AppendFMChunk(fm_i, callback);}, 0);
            else
                callback();
            return;
        }

        const fm_type = fm_obj.type;

        for (cm of all_cms) {

            const cm_is_elite = elite_cms.includes(cm);

            // gets the charged move object
            const cm_obj = jb_cm.find(entry => entry.name == cm);
            if (!cm_obj)
                continue;

            const cm_type = cm_obj.type;

            // calculates the data

            const dps = GetDPS(types, atk, def, hp, fm_obj, cm_obj);
            const dps_sh = GetDPS(types, atk_sh, def_sh, hp,fm_obj,cm_obj);
            const tdo = GetTDO(dps, hp, def);
            const tdo_sh = GetTDO(dps_sh, hp, def_sh);
            // metrics from Reddit user u/Elastic_Space
            let rat = 0;
            let rat_sh = 0;
            if (settings_metric == "ER") {
                const dps3tdo = Math.pow(dps, 3) * tdo;
                const dps3tdo_sh = Math.pow(dps_sh, 3) * tdo_sh;
                rat = Math.pow(dps3tdo, 1/4);
                rat_sh = Math.pow(dps3tdo_sh, 1/4);
            } else if (settings_metric == "EER") {
                rat = Math.pow(dps, 0.775) * Math.pow(tdo, 0.225);
                rat_sh = Math.pow(dps_sh, 0.775) * Math.pow(tdo_sh, 0.225);
            } else if (settings_metric == "TER") {
                rat = Math.pow(dps, 0.85) * Math.pow(tdo, 0.15);
                rat_sh = Math.pow(dps_sh, 0.85) * Math.pow(tdo_sh, 0.15);
            }

            // creates one row

            const tr = $("<tr></tr>");
            const td_fm = $("<td><span class='type-text bg-" + fm_type
                    + "'>" + fm + ((fm_is_elite) ? "*" : "")
                    + "</span></td>");
            const td_cm = $("<td><span class='type-text bg-" + cm_type
                    + "'>" + cm + ((cm_is_elite) ? "*" : "")
                    + "</span></td>");
            const td_dps = $("<td>" + dps.toFixed(3) + "</td>");
            const td_dps_sh = $("<td>"
                    + ((can_be_shadow) ? dps_sh.toFixed(3) : "-")
                    + "</td>");
            const td_tdo = $("<td>" + tdo.toFixed(1) + "</td>");
            const td_tdo_sh = $("<td>"
                    + ((can_be_shadow) ? tdo_sh.toFixed(1) : "-")
                    + "</td>");
            const td_rat = $("<td>" + rat.toFixed(2) + "</td>");
            const td_rat_sh = $("<td>"
                    + ((can_be_shadow) ? rat_sh.toFixed(2) : "-")
                    + "</td>");

            tr.append(td_fm);
            tr.append(td_cm);
            tr.append(td_dps);
            tr.append(td_dps_sh);
            tr.append(td_tdo);
            tr.append(td_tdo_sh);
            tr.append(td_rat);
            tr.append(td_rat_sh);

            $("#pokemongo-table").append(tr);
        }

        // appends the next fast move chunk, if there is more
        fm_i++;
        if (fm_i < all_fms.length)
            setTimeout(function() {AppendFMChunk(fm_i, callback);}, 0);
        else
            callback();
    }

    loading_pogo_moves = true;
    // appends the first fast move chunk
    AppendFMChunk(0, function() {
        SortPokemongoTable(6);
        loading_pogo_moves = false;
    });
}

/**
 * Gets array of four arrays. The specified Pokemon's fast moves, elite fast
 * moves, charged moves and elite charged moves.
 * 
 * Receives the pokemon's jb object as an argument.
 */
function GetPokemongoMoves(jb_pkm_obj) {

    if (!jb_pkm_obj.fm && !jb_pkm_obj.cm)
        return [];
    return [jb_pkm_obj.fm, jb_pkm_obj.cm,
            (jb_pkm_obj.elite_fm) ? jb_pkm_obj.elite_fm : [],
            (jb_pkm_obj.elite_cm) ? jb_pkm_obj.elite_cm : []];
}

/**
 * Gets the comprehensive DPS of a pokemon of some type(s) and with some
 * stats using a specific fast move and charged move.
 *
 * Formula credit to https://gamepress.gg .
 * https://gamepress.gg/pokemongo/damage-mechanics
 * https://gamepress.gg/pokemongo/how-calculate-comprehensive-dps
 */
function GetDPS(types, atk, def, hp, fm_obj, cm_obj) {

    if (!fm_obj || !cm_obj)
        return 0;

    // formula constants
    const enemy_def = 160;
    const x = 0.5 * -cm_obj.energy_delta + 0.5 * fm_obj.energy_delta;
    const y = 900 / def;

    // fast move variables
    const fm_dmg_mult = (types.includes(fm_obj.type)) ? 1.2 : 1;
    const fm_dmg = 0.5 * fm_obj.power * (atk / enemy_def) * fm_dmg_mult
            + 0.5;
    const fm_dps = fm_dmg / (fm_obj.duration / 1000);
    const fm_eps = fm_obj.energy_delta / (fm_obj.duration / 1000);

    // charged move variables
    const cm_dmg_mult = (types.includes(cm_obj.type)) ? 1.2 : 1;
    const cm_dmg = 0.5 * cm_obj.power * (atk / enemy_def) * cm_dmg_mult
            + 0.5;
    const cm_dps = cm_dmg / (cm_obj.duration / 1000);
    let cm_eps = -cm_obj.energy_delta / (cm_obj.duration / 1000);
    // penalty to one-bar charged moves (they use more energy (cm_eps))
    if (cm_obj.energy_delta == -100) {
        const dws = cm_obj.damage_window_start / 1000; // dws in seconds
        cm_eps = (-cm_obj.energy_delta + 0.5 * fm_obj.energy_delta
                + 0.5 * y * dws) / (cm_obj.duration / 1000);
    }

    // simple cycle DPS
    const dps0 = (fm_dps * cm_eps + cm_dps * fm_eps) / (cm_eps + fm_eps);
    // comprehensive DPS
    const dps = dps0 + ((cm_dps - fm_dps) / (cm_eps + fm_eps))
            * (0.5 - x / hp) * y;

    return ((dps < 0) ? 0 : dps);
}

/**
 * Gets the TDO of a pokemon using one of its DPS and its HP and DEF.
 *
 * Formula credit to https://gamepress.gg .
 * https://gamepress.gg/pokemongo/how-calculate-comprehensive-dps
 */
function GetTDO(dps, hp, def) {

    const y = 900 / def;
    return (dps * (hp / y));
}

/**
 * Sorts the pokemon go moves combinations table rows according to the
 * values from a specific column.
 */
function SortPokemongoTable(column_i) {

    let table = $("#pokemongo-table")[0];

    // updates downside triangles
    let triangles = $(".th-triangle");
    for (triangle of triangles)
        triangle.remove();
    cells = table.rows[0].cells;
    for (let cell_i = 0; cell_i < cells.length; cell_i++) {
        let cell = $(cells[cell_i]);
        if (cell_i == column_i) {
            let triangle = $("<span class=th-triangle> ▾</span>");
            cell.append(triangle);
        } else if (cell.hasClass("sortable")) {
            let triangle = $("<span class=th-triangle> ▿</span>");
            cell.append(triangle);
        }
    }

    // sorts rows
    let rows_array = Array.from(table.rows).slice(1);
    rows_array = MergeSortPokemongoTable(rows_array, column_i);
    for (let i = 0; i < rows_array.length; i++)
        table.append(rows_array[i]);
}

/**
 * Applies the merge sort algorithm to the pokemon go table rows.
 * Sorts according to the values from a specific column.
 */
function MergeSortPokemongoTable(rows, column_i) {

    if (rows.length <= 1)
        return rows;

    const n = (rows.length / 2);
    let a = MergeSortPokemongoTable(rows.slice(0, n), column_i);
    let b = MergeSortPokemongoTable(rows.slice(n), column_i);

    return MergeRows(a, b, column_i);
}

/**
 * Part of the merge sort algorithm for the pokemon go table rows.
 * Sorts and merges two arrays of rows according to the values
 * from a specific column. Returns the single resulting array.
 */
function MergeRows(a, b, column_i) {

    function GetRowValue(row) {
        return parseFloat(
                row.getElementsByTagName("TD")[column_i]
                .innerHTML.toLowerCase());
    }

    let c = [];

    while (a.length > 0 && b.length > 0) {
        if (GetRowValue(a[0]) >= GetRowValue(b[0])) {
            c.push(a[0]);
            a.shift();
        } else {
            c.push(b[0]);
            b.shift();
        }
    }

    while (a.length > 0) {
        c.push(a[0]);
        a.shift();
    }

    while (b.length > 0) {
        c.push(b[0]);
        b.shift();
    }

    return c;
}

/**
 * Receives the pokemon image that just loaded as an argument.
 * Hides the placeholder loading image and shows the loaded pokemon image.
 */
function HideLoading(element) {

    const loading = $(element).parent().children(".loading");
    loading.css("display", "none");
    $(element).css("display", "initial");
}

/**
 * When a pokemon image source couldn't be loaded, this function tries the 
 * next option.
 * Eventually it will just load the 'notfound' image and stop trying.
 */
function TryNextSrc(element) {

    const src = $(element).attr("src");

    if (src.includes(GIFS_URL)) {
        // loads pogo-256 image
        let next_src = src.replace(GIFS_URL, POGO_PNGS_URL);
        next_src = next_src.replace(".gif", ".png");
        $(element).attr("src", next_src);
        $(element).css("width", "140px");
        $(element).css("height", "140px");

    } else {
        // loads notfound image and stops trying (disables error callback)
        const next_src = "imgs/notfound.png";
        $(element).attr("src", next_src);
        $(element).css("width", "96px");
        $(element).css("height", "96px");
        $(element).css("cursor", "default");
        $(element).off("onerror");
    }
}

/**
 * Swaps the pokemon image for its shiny form.
 */
function SwapShiny(element) {

    const pokemon_container = $(element).parent().parent();
    const shiny_img =
        pokemon_container.children(".shiny-img-div").children("img");

    let src = $(element).attr("src");

    if (src.includes(GIFS_URL)) {
        src = src.replace(GIFS_URL, SHINY_GIFS_URL);
        shiny_img.css("display", "initial");

    } else if (src.includes(SHINY_GIFS_URL)) {
        src = src.replace(SHINY_GIFS_URL, GIFS_URL);
        shiny_img.css("display", "none");

    } else if (src.includes(POGO_PNGS_URL)) {
        src = src.replace(POGO_PNGS_URL, SHINY_POGO_PNGS_URL);
        shiny_img.css("display", "initial");

    } else if (src.includes(SHINY_POGO_PNGS_URL)) {
        src = src.replace(SHINY_POGO_PNGS_URL, POGO_PNGS_URL);
        shiny_img.css("display", "none");
    }

    $(element).attr("src", src);
}

/**
 * Callback function for when pokemon stats are updated (level or/and IVs).
 * Reloads the pokemon page and the url with the new specified stats.
 */
function UpdatePokemonStatsAndURL() {

    const params = new URLSearchParams(location.search);

    // if url has pokemon params...
    if (params.has("p")) {

        const pkm = params.get("p");

        let form = "def";
        if (params.has("f"))
            form = params.get("f");

        let mega = false;
        if (params.has("m"))
            mega = true;

        let mega_y = false;
        if (params.has("y"))
            mega_y = true;

        let level = Number($("#input-lvl").val());

        let ivs = {};
        ivs.atk = parseInt($("#input-atk").val());
        ivs.def = parseInt($("#input-def").val());
        ivs.hp = parseInt($("#input-hp").val());

        LoadPokemonAndUpdateURL(pkm, form, mega, mega_y, level, ivs);
    }
}

/**
 * Calls the 'LoadStrongest' function and updates the url accordingly.
 */
function LoadStrongestAndUpdateURL(type = null) {

    if (!finished_loading)
        return false;

    LoadStrongest(type);

    let url = "?strongest";
    if (type)
        url += "&t=" + type;

    window.history.pushState({}, "", url);
}

/**
 * Loads the list of the strongest pokemon for each type in pokemon go.
 */
function LoadStrongest(type = null) {

    if (!finished_loading)
        return;

    // displays what should be displayed 
    if ($("#pokemongo").css("display") != "none")
        $("#pokemongo").css("display", "none");
    if ($("#pokedex").css("display") != "none")
        $("#pokedex").css("display", "none");
    if ($("#strongest").css("display") == "none")
        $("#strongest").css("display", "initial");
    if ($("#legend").css("display") == "none")
        $("#legend").css("display", "initial");

    // sets links
    let links_types = $("#strongest-links-types");
    links_types.empty();
    for (const type of POKEMON_TYPES) {
        links_types.append("<li><a class='type-text bg-" + type
                + "' onclick='LoadStrongestAndUpdateURL(\"" + type
                + "\")'>" + type + "</a></li>");
    }

    // sets titles
    let title = "";
    if (type)
        title = "Strongest Pokémon of " + type + " type";
    else
        title = "Strongest Pokémon of each type";
    document.title = title + " - Palkia's Pokédex"; // page title
    $("#strongest-title").text(title); // table title

    // removes previous table rows
    $("#strongest-table tr:not(.table-header)").remove();

    // gets checkboxes filters
    let search_unreleased =
        $("#strongest input[value='unreleased']:checkbox").is(":checked");
    let search_mega =
        $("#strongest input[value='mega']:checkbox").is(":checked");
    let search_shadow =
        $("#strongest input[value='shadow']:checkbox").is(":checked");
    let search_legendary =
        $("#strongest input[value='legendary']:checkbox").is(":checked");
    let search_elite =
        $("#strongest input[value='elite']:checkbox").is(":checked");

    if (type) {
        SetTableOfStrongestOfOneType(search_unreleased, search_mega,
                search_shadow, search_legendary, search_elite, type);
    } else {
        SetTableOfStrongestOfEachType(search_unreleased, search_mega,
                search_shadow, search_legendary, search_elite);
    }
}

/**
 * Searches the strongest pokemon of each type and sets the strongest
 * pokemon table with the result.
 */
function SetTableOfStrongestOfEachType(search_unreleased, search_mega,
        search_shadow, search_legendary, search_elite) {

    // map of strongest pokemon and moveset found so far for each type
    let str_pokemons = new Map();

    /**
     * Checks if the any of the strongest movesets of a specific pokemon
     * is stronger than any of the current strongest pokemon of each type.
     * If it is, updates the strongest pokemon map.
     * 
     * Receives the pokemon's jb object as an argument.
     */
    function CheckIfStronger(jb_pkm_obj, mega, mega_y, shadow) {

        const types_movesets = GetPokemonStrongestMovesets(jb_pkm_obj,
                mega, mega_y, shadow, search_elite);

        for (const type of POKEMON_TYPES) {

            // checks that pokemon has a moveset solely of this type
            if (!types_movesets.has(type))
                continue;

            const moveset = types_movesets.get(type);
            let is_stronger = false;

            if (!str_pokemons.has(type)) { // if no strong pkm yet...

                if (moveset.rat > 0)
                    is_stronger = true;

            } else { // if some strong pkm already...

                // if finds something better than worst in array...
                if (moveset.rat > str_pokemons.get(type).rat)
                    is_stronger = true;
            }

            if (is_stronger) {

                // adds pokemon to array of strongest
                const str_pokemon = {
                    rat: moveset.rat, id: jb_pkm_obj.id,
                    name: jb_pkm_obj.name, form: jb_pkm_obj.form,
                    mega: mega, mega_y: mega_y, shadow: shadow,
                    fm: moveset.fm, fm_is_elite: moveset.fm_is_elite,
                    cm: moveset.cm, cm_is_elite: moveset.cm_is_elite,
                    moves_type: moveset.moves_type
                };
                str_pokemons.set(type, str_pokemon);
            }
        }
    }

    // searches for pokemons...

    for (let id = 1; id <= jb_max_id; id++) {

        const forms = GetPokemonForms(id);
        const def_form = forms[0];

        let jb_pkm_obj = jb_pkm.find(entry =>
                entry.id == id && entry.form == def_form);

        // checks whether pokemon should be skipped
        // (not released or legendary when not allowed)
        if (!jb_pkm_obj || !search_unreleased && !jb_pkm_obj.released
                || !search_legendary && jb_pkm_obj.class) {
            continue;
        }

        const can_be_shadow = jb_pkm_obj.shadow;
        const can_be_mega = jb_pkm_obj.mega;

        // default form
        CheckIfStronger(jb_pkm_obj, false, false, false);

        // shadow (except not released when it shouldn't)
        if (search_shadow && can_be_shadow
                && !(!search_unreleased && !jb_pkm_obj.shadow_released)) {
            CheckIfStronger(jb_pkm_obj, false, false, true);
        }

        // mega(s)
        if (search_mega && can_be_mega) {
            CheckIfStronger(jb_pkm_obj, true, false, false);
            if (id == 6 || id == 150) // charizard and mewtwo
                CheckIfStronger(jb_pkm_obj, true, true, false);
        }

        // other forms
        for (let form_i = 1; form_i < forms.length; form_i++) {

            jb_pkm_obj = jb_pkm.find(entry =>
                    entry.id == id && entry.form == forms[form_i]);

            // checks whether pokemon should be skipped (form not released)
            if (!jb_pkm_obj || !search_unreleased && !jb_pkm_obj.released)
                continue;

            CheckIfStronger(jb_pkm_obj, false, false, false);
            // other forms and shadow (except not released when it shouldn't)
            if (search_shadow && can_be_shadow
                    && !(!search_unreleased && !jb_pkm_obj.shadow_released)) {
                CheckIfStronger(jb_pkm_obj, false, false, true);
            }
        }
    }

    // converts map into array
    let str_pokemons_array = [];
    for (const type of POKEMON_TYPES) {
        if (str_pokemons.has(type))
            str_pokemons_array.push(str_pokemons.get(type));
    }

    // sets table from array
    SetStrongestTableFromArray(str_pokemons_array);
}

/**
 * Searches the strongest pokemon of a specific type and sets the strongest
 * pokemon table with the result.
 * 
 * The number of rows in the table is set to match the table with one
 * pokemon of each type, therefore, there are as many rows as pkm types.
 */
function SetTableOfStrongestOfOneType(search_unreleased, search_mega,
        search_shadow, search_legendary, search_elite, type) {

    const num_rows = POKEMON_TYPES.size;

    // array of strongest pokemon and moveset found so far
    let str_pokemons = [];

    /**
     * Checks if the strongest moveset of a specific pokemon and type is
     * stronger than any of the current strongest pokemons. If it is,
     * updates the strongest pokemons array.
     *
     * The array is sorted every time so that it is always the weakest
     * pokemon in it that gets replaced.
     * 
     * Receives the pokemon's jb object as an argument.
     */
    function CheckIfStrongEnough(jb_pkm_obj, mega, mega_y, shadow) {

        const types_movesets = GetPokemonStrongestMovesets(jb_pkm_obj,
                mega, mega_y, shadow, search_elite, type);
        if (!types_movesets.has(type))
            return;
        const moveset = types_movesets.get(type);

        let is_strong_enough = false;

        if (str_pokemons.length < num_rows) { // if array isn't full...

            if (moveset.rat > 0)
                is_strong_enough = true;

        } else { // if array isn't empty...

            // if finds something better than worst in array...
            if (moveset.rat > str_pokemons[0].rat)
                is_strong_enough = true;

        }

        if (is_strong_enough) {

            // adds pokemon to array of strongest
            const str_pokemon = {
                rat: moveset.rat, id: jb_pkm_obj.id,
                name: jb_pkm_obj.name, form: jb_pkm_obj.form,
                mega: mega, mega_y: mega_y, shadow: shadow,
                fm: moveset.fm, fm_is_elite: moveset.fm_is_elite,
                cm: moveset.cm, cm_is_elite: moveset.cm_is_elite,
                moves_type: moveset.moves_type
            };

            if (str_pokemons.length < num_rows)
                str_pokemons.push(str_pokemon);
            else
                str_pokemons[0] = str_pokemon;


            // sorts array
           str_pokemons.sort(function compareFn(a , b) {
               return ((a.rat > b.rat) || - (a.rat < b.rat));
           });
        }
    }

    // searches for pokemons...

    for (let id = 1; id <= jb_max_id; id++) {

        const forms = GetPokemonForms(id);
        const def_form = forms[0];

        let jb_pkm_obj = jb_pkm.find(entry =>
                entry.id == id && entry.form == def_form);

        // checks whether pokemon should be skipped
        // (not released or legendary when not allowed)
        if (!jb_pkm_obj || !search_unreleased && !jb_pkm_obj.released
                || !search_legendary && jb_pkm_obj.class) {
            continue;
        }

        const can_be_shadow = jb_pkm_obj.shadow;
        const can_be_mega = jb_pkm_obj.mega;

        // default form
        CheckIfStrongEnough(jb_pkm_obj, false, false, false);

        // shadow (except not released when it shouldn't)
        if (search_shadow && can_be_shadow
                && !(!search_unreleased && !jb_pkm_obj.shadow_released)) {
            CheckIfStrongEnough(jb_pkm_obj, false, false, true);
        }

        // mega(s)
        if (search_mega && can_be_mega) {
            CheckIfStrongEnough(jb_pkm_obj, true, false, false);
            if (id == 6 || id == 150) // charizard and mewtwo
                CheckIfStrongEnough(jb_pkm_obj, true, true, false);
        }

        // other forms
        for (let form_i = 1; form_i < forms.length; form_i++) {

            jb_pkm_obj = jb_pkm.find(entry =>
                    entry.id == id && entry.form == forms[form_i]);

            // checks whether pokemon should be skipped (form not released)
            if (!jb_pkm_obj || !search_unreleased && !jb_pkm_obj.released)
                continue;

            CheckIfStrongEnough(jb_pkm_obj, false, false, false);
            // other forms and shadow (except not released when it shouldn't)
            if (search_shadow && can_be_shadow
                    && !(!search_unreleased && !jb_pkm_obj.shadow_released)) {
                CheckIfStrongEnough(jb_pkm_obj, false, false, true);
            }
        }
    }

    // reverses strongest pokemon array
    str_pokemons.reverse();

    // sets table from array
    SetStrongestTableFromArray(str_pokemons, num_rows);
}

/**
 * Gets map of a specific pokemon's strongest movesets for each type.
 * If the 'search_type' param is specified, only tries to find movesets
 * of that type.
 * 
 * Receives the pokemon's jb object as an argument.
 */
function GetPokemonStrongestMovesets(jb_pkm_obj, mega, mega_y, shadow,
        search_elite, search_type = null) {

    let types_movesets = new Map();

    // checks whether this pokemon is actually released,
    // and if not, returns empty

    let released = true && jb_pkm_obj;
    if (mega)
        released = released && jb_pkm_obj.mega;
    if (mega_y)
        released = released && jb_pkm_obj.mega.length == 2;

    if (!released)
        return types_movesets;

    // gets the necessary data to make the rating calculations

    const types = GetPokemonTypes(jb_pkm_obj, mega, mega_y);

    const stats = GetMaxStats(jb_pkm_obj, mega, mega_y);
    const atk = (shadow) ? (stats.atk * 6 / 5) : stats.atk;
    const def = (shadow) ? (stats.def * 5 / 6) : stats.def;
    const hp = stats.hp;

    const moves = GetPokemongoMoves(jb_pkm_obj);
    if (moves.length != 4)
        return types_movesets;

    const fms = moves[0];
    const cms = moves[1];
    const elite_fms = moves[2];
    const elite_cms = moves[3];

    const all_fms = fms.concat(elite_fms);
    const all_cms = cms.concat(elite_cms);

    // searches for the moveset

    for (fm of all_fms) {

        const fm_is_elite = elite_fms.includes(fm);

        if (!search_elite && fm_is_elite)
            continue;

        // gets the fast move object
        const fm_obj = jb_fm.find(entry => entry.name == fm);
        if (!fm_obj)
            continue;

        // checks that fm type matches the type searched
        // (is search type isn't specified, any type goes)
        if (search_type && fm_obj.type != search_type)
            continue;

        for (cm of all_cms) {

            const cm_is_elite = elite_cms.includes(cm);

            if (!search_elite && cm_is_elite)
                continue;

            // gets the charged move object
            const cm_obj = jb_cm.find(entry => entry.name == cm);
            if (!cm_obj)
                continue;

            // checks that cm type matches the type searched
            // (is search type isn't specified, any type goes)
            if (search_type && cm_obj.type != search_type)
                continue;

            // checks that both moves types are equal
            if (fm_obj.type != cm_obj.type)
                continue;

            const moves_type = fm_obj.type;

            // calculates the data

            const dps = GetDPS(types, atk, def, hp, fm_obj, cm_obj);
            const tdo = GetTDO(dps, hp, def);
            // metrics from Reddit user u/Elastic_Space
            let rat = 0;
            if (settings_metric == "ER") {
                const dps3tdo = Math.pow(dps, 3) * tdo;
                rat = Math.pow(dps3tdo, 1/4);
            } else if (settings_metric == "EER") {
                rat = Math.pow(dps, 0.775) * Math.pow(tdo, 0.225);
            } else if (settings_metric == "TER") {
                rat = Math.pow(dps, 0.85) * Math.pow(tdo, 0.15);
            }

            // checks whether this moveset is the strongest for this type
            // so far and, if it is, overrides the previous strongest
            if (!types_movesets.has(moves_type)
                    || rat > types_movesets.get(moves_type).rat) {
                const type_moveset = {
                    rat: rat, moves_type: moves_type,
                    fm: fm, fm_is_elite: fm_is_elite,
                    cm: cm, cm_is_elite: cm_is_elite
                };
                types_movesets.set(moves_type, type_moveset);
            }
        }
    }

    return types_movesets;
}

/**
 * Adds rows to the strongest pokemon table according to an array of
 * pokemon.
 *
 * If a number of rows is specified and there aren't enough pokemon, fills 
 * the remaining rows with "-". If the number of rows isn't specified,
 * there will be as many rows as pokemon in the array.
 */
function SetStrongestTableFromArray(str_pokemons, num_rows = null) {

    if (!num_rows)
        num_rows = str_pokemons.length;

    for (let row_i = 0; row_i < num_rows; row_i++) {

        if (row_i < str_pokemons.length) {

            const p = str_pokemons[row_i];

            const name = p.name;
            const coords = GetPokemonIconCoords(p.id, p.form, p.mega, p.mega_y);
            const can_be_mega_y = p.id == 6 || p.id == 150; 
            const primal = p.mega && (p.id == 382 || p.id == 383);
            const form_text = GetFormText(p.id, p.form);

            const tr = $("<tr></tr>");
            const td_name = "<td>"
                + "<a class='' onclick='LoadPokemonAndUpdateURL(" + p.id
                + ",\"" + p.form + "\"," + p.mega + "," + p.mega_y + ")'>"
                + "<span class=pokemon-icon style='background-image:url("
                + ICONS_URL + ");background-position:" + coords.x + "px "
                + coords.y + "px'></span><b>"
                + ((primal) ? ("Primal ") : ((p.mega) ? "Mega " : " "))
                + ((p.shadow)
                    ? "<span class=shadow-text>Shadow</span> " : "")
                + name
                + ((p.mega && can_be_mega_y)
                    ? ((p.mega_y) ? " Y" : " X") : "")
                + "</b></a>"
                + ((form_text.length > 0)
                    ? " <span class=small-text>(" + form_text + ")</span>" 
                    : "")
                + "</td>";
            const td_fm =
                "<td><span class='type-text bg-" + p.moves_type + "'>"
                + p.fm + ((p.fm_is_elite) ? "*" : "") + "</span></td>";
            const td_cm =
                "<td><span class='type-text bg-" + p.moves_type + "'>"
                + p.cm + ((p.cm_is_elite) ? "*" : "") + "</span></td>";
            const td_rat = "<td>" + settings_metric + " <b>"
                + p.rat.toFixed(2) + "</b></td>";

            tr.append(td_name);
            tr.append(td_fm);
            tr.append(td_cm);
            tr.append(td_rat);

            $("#strongest-table").append(tr);

        } else {

            const empty_row =
                "<tr><td>-</td><td>-</td><td>-</td><td>-</td></tr>"
            $("#strongest-table").append(empty_row);
        }
    }
}

/**
 * Makes string clean, all lowercases and only alphanumeric characters.
 */
function Clean(string) {

    return string.toLowerCase().replace(/\W/g, "");
}
