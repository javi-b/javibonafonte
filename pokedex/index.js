/**
 * Author: Javi Bonafonte
 *
 * APIs used:
 * - https://pokeapi.co/docs/v2
 * - https://rapidapi.com/chewett/api/pokemon-go1/details
 * - https://pogoapi.net/documentation/
 *
 * TODO:
 * - Hisuian forms
 * - More forms... Arceus, Silvally, Minior, Necorzma, Magearma
 * - Add pogo stats, not just CP
 * - Missing shinies: Yungoos, Castform forms (pokemonshowdown)
 */

$(document).ready(Main);

// global constants and variables

const pokeapi_url = "https://pokeapi.co/api/v2/";
const pogoapi_url = "https://pogoapi.net/api/v1/";
const pokemongo1_url = "https://pokemon-go1.p.rapidapi.com/";
const pokemongo1_key = "a7236470dbmsheefb2d24399d84cp118c40jsn1f6c231dcf33";
const game_master_url = "https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json"

const pokemon_resources_url =
    "https://raw.githubusercontent.com/javi-b/pokemon-resources/main/";
const gifs_url = pokemon_resources_url + "ani/";
const shiny_gifs_url = pokemon_resources_url + "ani-shiny/";
const pogo_pngs_url = pokemon_resources_url + "pogo-256/"
const shiny_pogo_pngs_url = pokemon_resources_url + "pogo-shiny-256/"
const icons_url = pokemon_resources_url + "pokemonicons-sheet.png";

const cpm_lvl40 = 0.7903; // cp multiplier at level 40

const loading_max_val = 13; // mx number of files that need to be loaded
let loading_val = 0; // number of files loaded so far
let finished_loading = false; // whether page finished loading all files

// local files json objects
let local_alolan, local_galarian, local_mega, local_dws;
// pokeapi current pokemon
let pokeapi_current;
// pogoapi json objects
let pogoapi_names, pogoapi_max_id, pogoapi_types, pogoapi_evolutions,
        pogoapi_stats, pogoapi_moves, pogoapi_max_cp, pogoapi_released,
        pogoapi_alolan, pogoapi_galarian, pogoapi_shadow, pogoapi_mega,
        pogoapi_fms, pogoapi_cms, pogoapi_rarity;
// pokemongo1 json objects
let pkmgo1_fm, pkmgo1_cm;
// game master json object
let game_master;

// settings constants and variables
const METRICS = new Set();
METRICS.add("ER");
METRICS.add("EER");
METRICS.add("TER");
let settings_metric = "EER";

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

    // local
    /*
    LocalGetAsync("data/alolan_pokemon.json",
        function(response) {
            local_alolan = JSON.parse(response);
            IncreaseLoadingVal();
        });
    LocalGetAsync("data/galarian_pokemon.json",
        function(response) {
            local_galarian = JSON.parse(response);
            IncreaseLoadingVal();
        });
    */
    LocalGetAsync("data/mega_pokemon.json",
        function(response) {
            local_mega = JSON.parse(response);
            IncreaseLoadingVal();
        });
    LocalGetAsync("data/damage_window_starts.json",
        function(response) {
            local_dws = JSON.parse(response);
            IncreaseLoadingVal();
        });

    // pogoapi
    HttpGetAsync(pogoapi_url + "pokemon_names.json",
            function(response) {
                pogoapi_names = JSON.parse(response);
                pogoapi_max_id = pogoapi_names[Object.keys(pogoapi_names)
                    [Object.keys(pogoapi_names).length - 1]].id;
            });
    HttpGetAsync(pogoapi_url + "pokemon_types.json",
            function(response) { pogoapi_types = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "pokemon_evolutions.json",
            function(response) {
                pogoapi_evolutions = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "pokemon_stats.json",
            function(response) { pogoapi_stats = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "current_pokemon_moves.json",
            function(response) { pogoapi_moves = JSON.parse(response); });
    /*
    HttpGetAsync(pogoapi_url + "pokemon_max_cp.json",
            function(response) { pogoapi_max_cp = JSON.parse(response); });
    */
    HttpGetAsync(pogoapi_url + "released_pokemon.json",
            function(response) {pogoapi_released = JSON.parse(response);});
    /*
    HttpGetAsync(pogoapi_url + "pvp_fast_moves.json",
            function(response) { fast_moves = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "pvp_charged_moves.json",
            function(response) { charged_moves = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "alolan_pokemon.json",
            function(response) { pogoapi_alolan = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "galarian_pokemon.json",
            function(response) {pogoapi_galarian = JSON.parse(response);});
    */
    HttpGetAsync(pogoapi_url + "shadow_pokemon.json",
            function(response) { pogoapi_shadow = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "mega_pokemon.json",
            function(response) { pogoapi_mega = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "fast_moves.json",
            function(response) { pogoapi_fms = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "charged_moves.json",
            function(response) { pogoapi_cms = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "pokemon_rarity.json",
            function(response) { pogoapi_rarity = JSON.parse(response); });

    // pokemongo1
    /*
    HttpGetAsyncPokemongo1(pokemongo1_url + "fast_moves.json",
            function(response) { pkmgo1_fm = JSON.parse(response); });
    HttpGetAsyncPokemongo1(pokemongo1_url + "charged_moves.json",
            function(response) { pkmgo1_cm = JSON.parse(response); });
    */

    // game master
    /*
    HttpGetAsync(game_master_url,
            function(response) { game_master = JSON.parse(response); });
    */

    // event handlers

    // when going back or forward in the browser history
    window.onpopstate = function() { CheckURLAndAct(); }

    $("#settings-hide").click(SwapSettingsStatus);
    $("#metric-er").click(function() { SetMetric("ER"); });
    $("#metric-eer").click(function() { SetMetric("EER"); });
    $("#metric-ter").click(function() { SetMetric("TER"); });

    $("#ivs-form").submit(function(e) {
        UpdatePokemonIVsAndURL();
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
 * Local asyncronous GET request.
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
 * Syncronous HTTP GET request. Returns the response.
 */
function HttpGet(url) {

    let xml_http = new XMLHttpRequest();
    xml_http.open( "GET", url, false ); // false for synchronous request
    xml_http.send(null);

    return xml_http.response;
}

/**
 * Ayncronous HTTP GET request to a specific url and with a specific
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
 * Asyncronous HTTP GET request to a url from the Pokemongo1 API. It uses
 * the key.
 */
function HttpGetAsyncPokemongo1(url, callback) {

    let xml_http = new XMLHttpRequest();
    //xml_http.withCredentials = true;
    xml_http.onreadystatechange = function() {
        if (xml_http.readyState == 4 && xml_http.status == 200) {
            callback(xml_http.response);
            IncreaseLoadingVal();
        }
    }
    xml_http.open("GET", url, true); // true for asynchronous
    xml_http.setRequestHeader("X-RapidAPI-Host",
            "pokemon-go1.p.rapidapi.com");
    xml_http.setRequestHeader("X-RapidAPI-Key", pokemongo1_key);
    xml_http.send(null);
}

/**
 * Increases value that represents number of files loaded so far
 * and updates its html loading bar on the page.
 */
function IncreaseLoadingVal() {

    loading_val++;
    let pct = 100 * loading_val / loading_max_val;
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

    // sets settings text weight
    $("#metric-er").css("font-weight", "normal");
    $("#metric-eer").css("font-weight", "normal");
    $("#metric-ter").css("font-weight", "normal");
    switch (settings_metric) {
        case "ER":
            $("#metric-er").css("font-weight", "bold");
            break;
        case "EER":
            $("#metric-eer").css("font-weight", "bold");
            break;
        case "TER":
            $("#metric-ter").css("font-weight", "bold");
            break;
    }

    // sets pokemongo table header
    $("#table-metric-header").html(settings_metric);
    $("#table-metric-header-sh").html(settings_metric + "<br>(Shadow)");

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
    if (!pogoapi_names)
        return;

    selected_suggestion_i = -1;

    const input = $("#input").val();
    const clean_input = input.toLowerCase();
    const input_len = clean_input.length;
    let suggestions = $("#suggestions");

    suggestions.empty();

    if (input_len > 0) {

        const pogoapi_names_keys = Object.keys(pogoapi_names);
        for (key of pogoapi_names_keys) {

            const entry = pogoapi_names[key];

            if (entry.id > pogoapi_max_id)
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
        LoadPokemon(pkm, form, mega, mega_y, ivs);

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
        mega_y = false, ivs = null) {

    if (!finished_loading || loading_pogo_moves)
        return false;

    LoadPokemon(clean_input, form, mega, mega_y, ivs);

    let url = "?p=" + clean_input;

    if (form != "def")
        url += "&f=" + form;
    if (mega)
        url += "&m";
    if (mega_y)
        url += "&y";
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
        mega_y = false, ivs = null) {

    if (!finished_loading || loading_pogo_moves)
        return;

    // gets the pokemon id from the input and returns if it doesn't find it
    const pokemon_id = GetPokemonId(clean_input);
    if (pokemon_id == 0)
        return;

    // sets the page title
    const pokemon_name = pogoapi_names[pokemon_id].name;
    document.title = "#" + pokemon_id + " " + pokemon_name
            + " - Palkia's Pokédex";

    // sets the default form
    if (form == "def")
        form = GetPokemonDefaultForm(pokemon_id);

    // sets the default ivs
    if (ivs == null)
        ivs = { atk: 15, def: 15, hp: 15 };

    // sets ivs inputs values
    $("#input-atk").val(ivs.atk);
    $("#input-def").val(ivs.def);
    $("#input-hp").val(ivs.hp);

    // pokeapi
    /*
    HttpGetAsync(pokeapi_url + "pokemon/" + pokemon_id,
            function(response) {
                pokeapi_current = JSON.parse(response);
                LoadPokeapiSpecificElements();
            });
            */

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
        if (next_pokemon_id <= pogoapi_max_id) {
            $("#next-containers").append(
                GetPokemonContainer(next_pokemon_id, false,
                    GetPokemonDefaultForm(next_pokemon_id)));
        }
    }

    // sets additional pokemon containers

    let additional_cs = $("#additional-containers");

    const can_be_mega = local_mega[pokemon_id];

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

    LoadPokemongo(pokemon_id, form, mega, mega_y, ivs);
}

/**
 * Function that is triggered after the pokeapi data has been succesfully
 * received and, then, it is possible to load the elements that depend on
 * it.
 */
function LoadPokeapiSpecificElements() {

    console.log(pokeapi_current);
}

/**
 * Gets the pokemon id from a clean input (lowerscore alphanumeric).
 * The input could be the id itself or the pokemon name.
 * Returns 0 if it doesn't find it.
 */
function GetPokemonId(clean_input) {

    // chekcs for an id
    if (/^\d+$/.test(clean_input)) { // if input is an intger
        if (clean_input >= 1 && clean_input <= pogoapi_max_id)
            return parseInt(clean_input);
    }

    // checks for a name
    let pokemon_id = 0;
    Object.keys(pogoapi_names).forEach(function (key) {
        if (Clean(pogoapi_names[key].name) == clean_input)
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

    if (pokemon_id > pogoapi_max_id)
        return 0;

    return parseInt(pokemon_id);
}

/**
 * Gets array of specific pokemon types. Take into account form and whether
 * is mega.
 */
function GetPokemonTypes(pokemon_id, form, mega, mega_y) {

    types = [];

    if (mega) {
        // mega

        const can_be_mega_y = pokemon_id == 6 || pokemon_id == 150; 
        let types_entry;

        if (can_be_mega_y) {
            const form = (mega_y) ? "Y" : "X";
            types_entry = pogoapi_mega.find(entry =>
                    entry.pokemon_id == pokemon_id && entry.form == form);
        } else {
            types_entry = pogoapi_mega.find(entry =>
                    entry.pokemon_id == pokemon_id);
        }

        if (types_entry)
            types = types_entry.type;

    } else {
        // non mega

        const types_entry = pogoapi_types.find(entry =>
                entry.pokemon_id == pokemon_id && entry.form == form);
        if (types_entry)
            types = types_entry.type;
    }

    return types;
}

/**
 * Gets array of ids from pokemon that are next evolutions of the
 * specified. This function is recursive, that is why the pokemon specified
 * is also returned in the array.
 */
function GetNextEvolutions(pokemon_id) {

    evolutions_ids = [ pokemon_id ];

    const evolutions_entry = pogoapi_evolutions.find(entry =>
            entry.pokemon_id == pokemon_id);

    if (evolutions_entry) {
        for (evolution of evolutions_entry.evolutions) {
            evolutions_ids = evolutions_ids.concat(
                    GetNextEvolutions(evolution.pokemon_id));
        }
    }

    return evolutions_ids;
}

/**
 * Gets array of ids from pokemon that are previous evolutions of the
 * specified. This function is recursive, that is why the pokemon specified
 * is also returned in the array.
 */
function GetPreviousEvolutions(pokemon_id) {

    evolutions_ids = [ pokemon_id ];

    pogoapi_evolutions.forEach(function(entry) {
        for (evolution of entry.evolutions) {
            if (evolution.pokemon_id == pokemon_id) {
                evolutions_ids = evolutions_ids.concat(
                        GetPreviousEvolutions(entry.pokemon_id));
                break;
            }
        }
    });

    return evolutions_ids;
}

/**
 * Gets a pokemon container div element set up with a specified pokemon.
 */
function GetPokemonContainer(pokemon_id, is_selected, form = "Normal",
        mega = false, mega_y = false) {

    const pokemon_name = pogoapi_names[pokemon_id].name;
    const clean_name = Clean(pokemon_name);
    const img_src_name = GetPokemonImgSrcName(pokemon_id, clean_name, form,
            mega, mega_y);
    const img_src = gifs_url + img_src_name + ".gif";
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
    const types = GetPokemonTypes(pokemon_id, form, mega, mega_y);
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
function LoadPokemongo(pokemon_id, form, mega, mega_y, ivs) {

    let released = pogoapi_released[pokemon_id];
    if (form != GetPokemonDefaultForm(pokemon_id)) {
        const pogoapi_form_moves_obj = pogoapi_moves.find(entry =>
                entry.pokemon_id == pokemon_id && entry.form == form);
        released = released && pogoapi_form_moves_obj;
    }
    if (mega) {
        const pogoapi_mega_obj = pogoapi_mega.find(entry =>
            entry.pokemon_id == pokemon_id);
        released = released && pogoapi_mega_obj;
    }

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

    const stats = GetLvl40Stats(pokemon_id, form, mega, mega_y, ivs);
    LoadPokemongoMaxCP(pokemon_id, form, mega, mega_y, stats);
    UpdatesPokemongoMaxCPText(ivs);
    LoadPokemongoTable(pokemon_id, form, mega, mega_y, stats);
}

/**
 * Gets the Pokemon GO stats of a specific pokemon when it is level 40
 * and it has some specific IV points.
 */
function GetLvl40Stats(pokemon_id, form, mega, mega_y, ivs) {

    let stats;

    if (mega && mega_y) { // mega y
        stats = pogoapi_mega.find(entry =>
                entry.pokemon_id == pokemon_id && entry.form == "Y").stats;
    } else if (mega) { // mega x or normal mega
        stats = pogoapi_mega.find(entry =>
                entry.pokemon_id == pokemon_id).stats;
    } else { // any form non mega
        stats = pogoapi_stats.find(entry =>
                entry.pokemon_id == pokemon_id && entry.form == form);
        if (!stats) {
            stats = pogoapi_stats.find(entry =>
                entry.pokemon_id == pokemon_id);
        }
    }

    let cpm = cpm_lvl40;
    if (mega) {
        const cpm_override = pogoapi_mega.find(entry =>
                entry.pokemon_id == pokemon_id).cp_multiplier_override;
        if (cpm_override)
            cpm = cpm_override;
    }

    stats.atk = (stats.base_attack + ivs.atk) * cpm;
    stats.def = (stats.base_defense + ivs.def) * cpm;
    stats.hp = (stats.base_stamina + ivs.hp) * cpm;

    return stats;
}

/**
 * Gets the Pokemon GO stats of a specific pokemon when it is level 40
 * and it has the maximum IV points.
 */
function GetLvl40MaxStats(pokemon_id, form, mega, mega_y) {

    const ivs = { atk: 15, def: 15, hp: 15 };
    return GetLvl40Stats(pokemon_id, form, mega, mega_y, ivs);
}

/**
 * Loads the section containing the maximum CP of the selected pokemon when
 * it is level 40.
 */
function LoadPokemongoMaxCP(pokemon_id, form, mega, mega_y, stats) {

    const max_cp_40 = GetCP(stats);
    let prgr_pct = max_cp_40 * 100 / 5000;
    if (prgr_pct > 100)
        prgr_pct = 100;

    const width = 100 - prgr_pct;
    $(".prgr-val").css("width", width + "%");
    $("#max-cp").text("CP ");
    const bold_num = $("<b>" + max_cp_40 + "</b>");
    $("#max-cp").append(bold_num);
}

/**
 * Updates the text for pokemon max cp to match the IVs being used to
 * calculate it.
 */
function UpdatesPokemongoMaxCPText(ivs) {

    const pct = Math.round(100 * (ivs.atk + ivs.def + ivs.hp) / 45);
    $("#cp-text").text("with IVs " + ivs.atk + "/" + ivs.def + "/" + ivs.hp
            + " (" + pct + "%) at level 40");
}

/**
 * Gets a pokemon CP in Pokemon GO with a specific set of stats.
 */
function GetCP(stats) {

    let max_cp = Math.floor(stats.atk * Math.pow(stats.def, 0.5)
                * Math.pow(stats.hp, 0.5) / 10);

    return ((max_cp >= 10) ? max_cp : 10);
}

/**
 * Loads the table in the Pokemon Go section including information about
 * the possible move combinations and their stats (dps, tdo, er).
 */
function LoadPokemongoTable(pokemon_id, form, mega, mega_y, stats) {

    // whether can be shadow
    const can_be_shadow = pogoapi_shadow[pokemon_id] && !mega;

    // types
    const types = GetPokemonTypes(pokemon_id, form, mega, mega_y);

    const atk = stats.atk;
    const def = stats.def;
    const hp = stats.hp;

    // shadow stats
    let atk_sh = atk * 6 / 5;
    let def_sh = def * 5 / 6;

    // removes previous table rows
    $("#pokemongo-table tr:not(.table-header)").remove();

    const moves = GetPokemongoMoves(pokemon_id, form);
    if (moves.length != 4)
        return;

    const fms = moves[0];
    const cms = moves[1];
    const elite_fms = moves[2];
    const elite_cms = moves[3];

    const all_fms = fms.concat(elite_fms);
    const all_cms = cms.concat(elite_cms);

    // appends new table rows asyncronously (so that Mew loads fast)
    // each chunk of moves combinations with a specific fast move
    // is appeneded in a different frame

    /**
     * Appends all the rows containing a specific fast move.
     * Receives the index of the fast move and
     * the callback function for when all chunks have been appended.
     */
    function AppendFMChunk(fm_i, callback) {

        const fm = all_fms[fm_i];
        const fm_is_elite = elite_fms.includes(fm);

        // gets the fast move object
        const fm_obj = pogoapi_fms.find(entry => entry.name == fm);
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
            const cm_obj = pogoapi_cms.find(entry => entry.name == cm);
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
 * Gets array of two arrays. The specified Pokemon's fast moves and charged
 * moves. If the pokemon is not found, returns an empty array.
 */
function GetPokemongoMoves(pokemon_id, form) {

    //const entries = pogoapi_moves.filter(
            //entry => entry.pokemon_id == pokemon_id);
    const entry = pogoapi_moves.find(entry =>
            entry.pokemon_id == pokemon_id && entry.form == form);

    return ((entry)
            ? [entry.fast_moves, entry.charged_moves,
                entry.elite_fast_moves, entry.elite_charged_moves]
            : []);
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
        const dws_obj = local_dws.find(entry =>
                Clean(entry.name) == Clean(cm));
        if (dws_obj) {
            const dws = dws_obj.damage_window_start;
            cm_eps = (-cm_obj.energy_delta + 0.5 * fm_obj.energy_delta
                    + 0.5 * y * dws) / (cm_obj.duration / 1000);
        } else {
            console.log("Couldn't find DamageWindowStart for Charged Move "
                    + cm);
        }
    }

    // simple cycle DPS
    const dps0 = (fm_dps * cm_eps + cm_dps * fm_eps) / (cm_eps + fm_eps);
    // comprehensive DPS
    const dps = dps0 + ((cm_dps - fm_dps) / (cm_eps + fm_eps))
            * (0.5 - x / hp) * y;

    return dps;
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

    if (src.includes(gifs_url)) {
        // loads pogo-256 image
        let next_src = src.replace(gifs_url, pogo_pngs_url);
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

    if (src.includes(gifs_url)) {
        src = src.replace(gifs_url, shiny_gifs_url);
        shiny_img.css("display", "initial");

    } else if (src.includes(shiny_gifs_url)) {
        src = src.replace(shiny_gifs_url, gifs_url);
        shiny_img.css("display", "none");

    } else if (src.includes(pogo_pngs_url)) {
        src = src.replace(pogo_pngs_url,shiny_pogo_pngs_url);
        shiny_img.css("display", "initial");

    } else if (src.includes(shiny_pogo_pngs_url)) {
        src = src.replace(shiny_pogo_pngs_url,pogo_pngs_url);
        shiny_img.css("display", "none");
    }

    $(element).attr("src", src);
}

/**
 * Callback function for when pokemon IVs are updated.
 * Reloads the pokemon page and the url with the new specified IVs.
 */
function UpdatePokemonIVsAndURL() {

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

        let ivs = {};
        ivs.atk = parseInt($("#input-atk").val());
        ivs.def = parseInt($("#input-def").val());
        ivs.hp = parseInt($("#input-hp").val());

        LoadPokemonAndUpdateURL(pkm, form, mega, mega_y, ivs);
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
    let search_mega =
        $("#strongest input[value='mega']:checkbox").is(":checked");
    let search_shadow =
        $("#strongest input[value='shadow']:checkbox").is(":checked");
    let search_legendary =
        $("#strongest input[value='legendary']:checkbox").is(":checked");
    let search_elite =
        $("#strongest input[value='elite']:checkbox").is(":checked");

    if (type) {
        SetTableOfStrongestOfOneType(search_mega, search_shadow,
                search_legendary, search_elite, type);
    } else {
        SetTableOfStrongestOfEachType(search_mega, search_shadow,
                search_legendary, search_elite);
    }
}

/**
 * Searches the strongest pokemon of each type and sets the strongest
 * pokemon table with the result.
 */
function SetTableOfStrongestOfEachType(search_mega, search_shadow,
        search_legendary, search_elite) {

    // map of strongest pokemon and moveset found so far for each type
    let str_pokemons = new Map();

    /**
     * Checks if the any of the strongest movesets of a specific pokemon
     * is stronger than any of the current strongest pokemon of each type.
     * If it is, updates the strongest pokemon map.
     */
    function CheckIfStronger(id, form, mega, mega_y, shadow) {

        const types_movesets = GetPokemonStrongestMovesets(id, form,
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
                    rat: moveset.rat, id: id, form: form,
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

    for (let id = 1; id <= pogoapi_max_id; id++) {

        // checks whether pokemon should be skipped
        if (!search_legendary) {
            const pogoapi_legendary_obj =
                pogoapi_rarity["Legendary"].find(entry =>
                    entry.pokemon_id == id);
            if (pogoapi_legendary_obj)
                continue;
            const pogoapi_mythic_obj =
                pogoapi_rarity["Mythic"].find(entry =>
                    entry.pokemon_id == id);
            if (pogoapi_mythic_obj)
                continue;
            const pogoapi_ultrabeast_obj =
                pogoapi_rarity["Ultra beast"].find(entry =>
                    entry.pokemon_id == id);
            if (pogoapi_ultrabeast_obj)
                continue;
        }

        const forms = GetPokemonForms(id);
        const def_form = forms[0];

        // default form
        CheckIfStronger(id, def_form, false, false, false);

        // other forms
        for (let form_i = 1; form_i < forms.length; form_i++)
            CheckIfStronger(id, forms[form_i], false, false, false);

        // mega(s)
        const can_be_mega = local_mega[id];
        if (search_mega && can_be_mega) {
            CheckIfStronger(id, def_form, true, false, false);
            if (id == 6 || id == 150) // charizard and mewtwo
                CheckIfStronger(id, def_form, true, true, false);
        }

        // shadow
        const can_be_shadow = pogoapi_shadow[id];
        if (search_shadow && can_be_shadow)
            CheckIfStronger(id, def_form, false, false, true);
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
function SetTableOfStrongestOfOneType(search_mega, search_shadow,
        search_legendary, search_elite, type) {

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
     */
    function CheckIfStrongEnough(id, form, mega, mega_y, shadow) {

        const types_movesets = GetPokemonStrongestMovesets(id, form,
                mega, mega_y, shadow, search_elite, type);
        if (!types_movesets.has(type))
            return;
        const moveset = types_movesets.get(type);

        let is_strong_enough = false;

        if (str_pokemons.length == 0) { // if array is empty...

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
                rat: moveset.rat, id: id, form: form,
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

    for (let id = 1; id <= pogoapi_max_id; id++) {

        // checks whether pokemon should be skipped
        if (!search_legendary) {
            const pogoapi_legendary_obj =
                pogoapi_rarity["Legendary"].find(entry =>
                    entry.pokemon_id == id);
            if (pogoapi_legendary_obj)
                continue;
            const pogoapi_mythic_obj =
                pogoapi_rarity["Mythic"].find(entry =>
                    entry.pokemon_id == id);
            if (pogoapi_mythic_obj)
                continue;
            const pogoapi_ultrabeast_obj =
                pogoapi_rarity["Ultra beast"].find(entry =>
                    entry.pokemon_id == id);
            if (pogoapi_ultrabeast_obj)
                continue;
        }

        const forms = GetPokemonForms(id);
        const def_form = forms[0];

        // default form
        CheckIfStrongEnough(id, def_form, false, false, false);

        // other forms
        for (let form_i = 1; form_i < forms.length; form_i++)
            CheckIfStrongEnough(id, forms[form_i], false, false, false);

        // mega(s)
        const can_be_mega = local_mega[id];
        if (search_mega && can_be_mega) {
            CheckIfStrongEnough(id, def_form, true, false, false);
            if (id == 6 || id == 150) // charizard and mewtwo
                CheckIfStrongEnough(id, def_form, true, true, false);
        }

        // shadow
        const can_be_shadow = pogoapi_shadow[id];
        if (search_shadow && can_be_shadow)
            CheckIfStrongEnough(id, def_form, false, false, true);
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
 */
function GetPokemonStrongestMovesets(pokemon_id, form, mega, mega_y,
        shadow, search_elite, search_type = null) {

    let types_movesets = new Map();

    // checks whether this pokemon is actually released,
    // and if not, returns empty

    let released = pogoapi_released[pokemon_id];
    if (form != GetPokemonDefaultForm(pokemon_id)) {
        const pogoapi_form_moves_obj = pogoapi_moves.find(entry =>
                entry.pokemon_id == pokemon_id && entry.form == form);
        released = released && pogoapi_form_moves_obj;
    }
    if (mega) {
        const pogoapi_mega_obj = pogoapi_mega.find(entry =>
            entry.pokemon_id == pokemon_id);
        released = released && pogoapi_mega_obj;
    }

    if (!released)
        return types_movesets;

    // gets the necessary data to make the rating calculations

    const types = GetPokemonTypes(pokemon_id, form, mega, mega_y);

    const stats = GetLvl40MaxStats(pokemon_id, form, mega, mega_y);
    const atk = (shadow) ? (stats.atk * 6 / 5) : stats.atk;
    const def = (shadow) ? (stats.def * 5 / 6) : stats.def;
    const hp = stats.hp;

    const moves = GetPokemongoMoves(pokemon_id, form);
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
        const fm_obj = pogoapi_fms.find(entry => entry.name == fm);
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
            const cm_obj = pogoapi_cms.find(entry => entry.name == cm);
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

            const name = pogoapi_names[p.id].name;
            const icon_x = (p.id % 12) * -40;
            const icon_y = Math.floor(p.id / 12) * -30;
            const can_be_mega_y = p.id == 6 || p.id == 150; 
            const primal = p.mega && (p.id == 382 || p.id == 383);
            const form_text = GetFormText(p.id, p.form);

            const tr = $("<tr></tr>");
            const td_name = "<td>"
                + "<a class='' onclick='LoadPokemonAndUpdateURL(" + p.id
                + ",\"" + p.form + "\"," + p.mega + "," + p.mega_y + ")'>"
                + "<span class=pokemon-icon style='background-image:url("
                + icons_url + ");background-position:" + icon_x + "px "
                + icon_y + "px'></span><b>"
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
