/**
 * Author: Javi Bonafonte
 *
 * APIs used:
 * - https://pokeapi.co/docs/v2
 * - https://rapidapi.com/chewett/api/pokemon-go1/details
 * - https://pogoapi.net/documentation/
 *
 * TODO:
 * - More forms...
 * - Add pogo stats, not just CP
 */

$(document).ready(Main);

// global constants and variables

const pokeapi_url = "https://pokeapi.co/api/v2/";
const pogoapi_url = "https://pogoapi.net/api/v1/";
const pokemongo1_url = "https://pokemon-go1.p.rapidapi.com/";
const pokemongo1_key = "a7236470dbmsheefb2d24399d84cp118c40jsn1f6c231dcf33";

const pokemon_resources_url =
    "https://raw.githubusercontent.com/javi-b/pokemon-resources/main/";
const gifs_url = pokemon_resources_url + "ani/";
const shiny_gifs_url = pokemon_resources_url + "ani-shiny/";
const gifs_url_2 = "https://play.pokemonshowdown.com/sprites/ani/";
const shiny_gifs_url_2 =
    "https://play.pokemonshowdown.com/sprites/ani-shiny/";

const cpm_lvl40 = 0.7903; // cp multiplier at level 40

// local files json objects
let local_alolan, local_galarian, local_mega, local_dws;
// pokeapi current pokemon
let pokeapi_current;
// pogoapi json objects
let pogoapi_names, pogoapi_max_id, pogoapi_types, pogoapi_evolutions,
        pogoapi_stats, pogoapi_moves, pogoapi_max_cp, pogoapi_released,
        pogoapi_alolan, pogoapi_galarian, pogoapi_shadow, pogoapi_mega;
// pokemongo1 json objects
let pkmgo1_fm, pkmgo1_cm;

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
    LocalGetAsync("data/alolan_pokemon.json",
        function(response) { local_alolan = JSON.parse(response) });
    LocalGetAsync("data/galarian_pokemon.json",
        function(response) { local_galarian = JSON.parse(response) });
    LocalGetAsync("data/mega_pokemon.json",
        function(response) { local_mega = JSON.parse(response) });
    LocalGetAsync("data/damage_window_starts.json",
        function(response) { local_dws = JSON.parse(response) });

    // pogoapi
    HttpGetAsync(pogoapi_url + "pokemon_names.json",
            function(response) {
                pogoapi_names = JSON.parse(response);
                // FIXME provisionally capped to 898
                //pogoapi_max_id = pogoapi_names[Object.keys(pogoapi_names)
                    //[Object.keys(pogoapi_names).length - 1]].id;
                pogoapi_max_id = 898;
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
    HttpGetAsync(pogoapi_url + "pokemon_max_cp.json",
            function(response) { pogoapi_max_cp = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "released_pokemon.json",
            function(response) {
                pogoapi_released = JSON.parse(response); });
    //HttpGetAsync(pogoapi_url + "pvp_fast_moves.json",
            //function(response) { fast_moves = JSON.parse(response); });
    //HttpGetAsync(pogoapi_url + "pvp_charged_moves.json",
            //function(response) { charged_moves = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "alolan_pokemon.json",
            function(response) { pogoapi_alolan = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "galarian_pokemon.json",
            function(response) {
                pogoapi_galarian = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "shadow_pokemon.json",
            function(response) { pogoapi_shadow = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "mega_pokemon.json",
            function(response) { pogoapi_mega = JSON.parse(response); });

    // pokemongo1
    HttpGetAsyncPokemongo1(pokemongo1_url + "fast_moves.json",
            function(response) { pkmgo1_fm = JSON.parse(response); });
    HttpGetAsyncPokemongo1(pokemongo1_url + "charged_moves.json",
            function(response) { pkmgo1_cm = JSON.parse(response); });

    // event handlers
    $("#maingames-btn").click(function() { SelectGame(false); });
    $("#pokemongo-btn").click(function() { SelectGame(true); });
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
        if (xml_http.readyState == 4 && xml_http.status == 200)
            callback(xml_http.response);
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
        if (xml_http.readyState == 4 && xml_http.status == 200)
            callback(xml_http.response);
    }
    xml_http.open("GET", url, true); // true for asynchronous
    xml_http.setRequestHeader("X-RapidAPI-Host",
            "pokemon-go1.p.rapidapi.com");
    xml_http.setRequestHeader("X-RapidAPI-Key", pokemongo1_key);
    xml_http.send(null);
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
                LoadPokemon(Clean(name));
            } else {
                LoadPokemon(Clean($("#input").val()));
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

    if (!selected_suggestion_changed)
        return;

    // if selected suggestion changed...

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
 */
function OnInputBlur(e) {

    let suggestions = $("#suggestions");

    // empties suggestions
    suggestions.empty();

    // sets borders
    suggestions.css("border", "none");
    suggestions.css("border-top", "1px solid var(--col-main)");
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

            // checks for ids
            if (String(entry.id).startsWith(clean_input)) {
                suggestions.append("<p>#<b>" + clean_input
                        + "</b>" + String(entry.id).slice(input_len)
                        + " " + entry.name + "</p>");
                if (suggestions.children().length >= 10)
                    break;
            }

            // checks for # + ids
            const hash_id = "#" + String(entry.id);
            if (hash_id.startsWith(clean_input)) {
                suggestions.append("<p><b>" + clean_input
                        + "</b>" + hash_id.slice(input_len)
                        + " " + entry.name + "</p>");
                if (suggestions.children().length >= 10)
                    break;
            }

            // checks for names
            if (entry.name.toLowerCase().startsWith(clean_input)) {
                suggestions.append("<p>#" + entry.id
                        + " <b>" + input + "</b>"
                        + entry.name.slice(input_len) + "</p>");
                if (suggestions.children().length >= 10)
                    break;
            }
        }

        // sets borders
        if (suggestions.children().length > 0) {
            suggestions.css("border", "1px solid var(--col-main)");
        } else {
            suggestions.css("border", "none");
            suggestions.css("border-top", "1px solid var(--col-main)");
        }

    } else {

        // sets borders
        suggestions.css("border", "none");
        suggestions.css("border-top", "1px solid var(--col-main)");
    }
}

/**
 * Loads a pokemon page.
 */
function LoadPokemon(clean_input, form = "def", mega = false,
        mega_y = false) {

    // checks if all json objects are available
    if (!local_alolan || !local_galarian || !local_mega || !local_dws
            || !pogoapi_names || !pogoapi_types || !pogoapi_evolutions
            || !pogoapi_stats || !pogoapi_moves || !pogoapi_max_cp
            || !pogoapi_released || !pogoapi_alolan || !pogoapi_galarian
            || !pogoapi_shadow || !pogoapi_mega
            || !pkmgo1_fm || !pkmgo1_cm) {
        console.log("Couldn't load the pokemon because some json file "
                + "couldn't be loaded in time.");
        return;
    }

    // gets the pokemon id from the input and returns if it doesn't find it
    const pokemon_id = GetPokemonId(clean_input);
    if (pokemon_id == 0)
        return;

    // sets the form
    if (form == "def")
        form = GetPokemonDefaultForm(pokemon_id);

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

    const can_be_mega = local_mega[pokemon_id];

    if (can_be_mega) {
        if (pokemon_id == 6 || pokemon_id == 150) { // charizard and mewtwo
            $("#additional-containers").append(GetPokemonContainer(
                    pokemon_id, mega && !mega_y, "Normal", true, false));
            $("#additional-containers").append(GetPokemonContainer(
                    pokemon_id, mega && mega_y, "Normal", true, true));
        } else {
            $("#additional-containers").append(
                GetPokemonContainer(pokemon_id, mega, "Normal", true));
        }
    }

    const additional_forms = forms.slice(1);

    for (f of additional_forms) {
        $("#additional-containers").append(
            GetPokemonContainer(pokemon_id, form == f, f));
    }

    // if the buttons container (and other elements) are hidden...
    if ($("#buttons-container").css("display") == "none"
            || $("#pokemongo").css("display") == "none") {
        $("#buttons-container").css("display", "initial");
        $("#pokemongo").css("display", "initial");
    }

    LoadPokemongo(pokemon_id, form, mega, mega_y);
    LoadMaingames(pokemon_id);
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
            $("<img class=loading src=../imgs/loading.gif></img>"));
    img_container_div.append($("<img class=pokemon-img "
            + "onload ='HideLoading(this)' onclick='SwapShiny(this)' src="
            + img_src + "></img>"));
    pokemon_container_div.append(img_container_div);

    // pokemon name p
    const pokemon_name_p = $("<p class='pokemon-name pokefont unselectable'"
            + "onclick='LoadPokemon(" + pokemon_id + ", \"" + form
            + "\", " + mega + ", " + mega_y + ")'>#" + pokemon_id
            + ((mega) ? " Mega " : " ") + pokemon_name
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
function LoadPokemongo(pokemon_id, form, mega, mega_y = false) {

    const pogoapi_mega_obj = pogoapi_mega.find(entry =>
        entry.pokemon_id == pokemon_id);
    const released = pogoapi_released[pokemon_id]
            && !(form == "Alola" && !pogoapi_alolan[pokemon_id])
            && !(form == "Galarian" && !pogoapi_galarian[pokemon_id])
            && !(mega && !pogoapi_mega_obj);

    // if this pokemon is not released in pokemon go yet...
    if (!released) {
        $("#not-released").css("display", "initial");
        $("#released").css("display", "none");
        return;
    }

    $("#not-released").css("display", "none");
    $("#released").css("display", "initial");

    const stats = GetLvl40MaxStats(pokemon_id, form, mega, mega_y);
    LoadPokemongoMaxCP(pokemon_id, form, mega, mega_y, stats);
    LoadPokemongoTable(pokemon_id, form, mega, mega_y, stats);
}

/**
 * Gets the Pokemon GO stats of a specific pokemon when it is level 40
 * and it has the maximum IV points.
 */
function GetLvl40MaxStats(pokemon_id, form, mega, mega_y) {

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

    stats.atk = (stats.base_attack + 15) * cpm;
    stats.def = (stats.base_defense + 15) * cpm;
    stats.hp = (stats.base_stamina + 15) * cpm;

    return stats;
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
    setTimeout(function() {
        $("#max-cp").text("CP ");
        const bold_num = $("<b>" + max_cp_40 + "</b>");
        $("#max-cp").append(bold_num);
    }, 10);
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
 * the possible move combinations and their stats (dps, tod, dps3tdo).
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
    if (moves.length != 2)
        return;

    const fms = moves[0];
    const cms = moves[1];

    // appends new table rows

    for (fm of fms) {
        for (cm of cms) {

            const dps = GetDPS(types, atk, def, hp, fm, cm);
            const dps_sh = GetDPS(types, atk_sh, def_sh, hp, fm, cm);
            const tdo = GetTDO(dps, hp, def);
            const tdo_sh = GetTDO(dps_sh, hp, def_sh);
            const dps3tdo = Math.pow(dps, 3) * tdo / 1000;
            const dps3tdo_sh = Math.pow(dps_sh, 3) * tdo_sh / 1000;

            const tr = $("<tr></tr>");
            const td_fm = $("<td>" + fm + "</td>");
            const td_cm = $("<td>" + cm + "</td>");
            const td_dps = $("<td>" + dps.toFixed(3) + "</td>");
            const td_dps_sh = $("<td>"
                    + ((can_be_shadow) ? dps_sh.toFixed(3) : "-")
                    + "</td>");
            const td_tdo = $("<td>" + tdo.toFixed(1) + "</td>");
            const td_tdo_sh = $("<td>"
                    + ((can_be_shadow) ? tdo_sh.toFixed(1) : "-")
                    + "</td>");
            const td_dps3tdo = $("<td>" + dps3tdo.toFixed(1) + "</td>");
            const td_dps3tdo_sh = $("<td>"
                    + ((can_be_shadow) ? dps3tdo_sh.toFixed(1) : "-")
                    + "</td>");

            tr.append(td_fm);
            tr.append(td_cm);
            tr.append(td_dps);
            tr.append(td_dps_sh);
            tr.append(td_tdo);
            tr.append(td_tdo_sh);
            tr.append(td_dps3tdo);
            tr.append(td_dps3tdo_sh);

            $("#pokemongo-table").append(tr);
        }
    }
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

    return (entry) ? [entry.fast_moves, entry.charged_moves] : [];
}

/**
 * Gets the comprehensive DPS of a pokemon of some type(s) and with some
 * stats using a specific fast move and charged move.
 *
 * Formula credit to https://gamepress.gg .
 * https://gamepress.gg/pokemongo/damage-mechanics
 * https://gamepress.gg/pokemongo/how-calculate-comprehensive-dps
 */
function GetDPS(types, atk, def, hp, fm, cm) {

    const fm_obj = pkmgo1_fm.find(entry => entry.name == fm);
    const cm_obj = pkmgo1_cm.find(entry => entry.name == cm);

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
 * Loads one pokemon data for the Main Games section.
 */
function LoadMaingames(pokemon_id) {

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
 * Swaps the pokemon image for its shiny form.
 */
function SwapShiny(element) {

    const pokemon_container = $(element).parent().parent();
    const shiny_img =
        pokemon_container.children(".shiny-img-div").children("img");

    let src = $(element).attr("src");

    if (src.includes("/ani-shiny/")) {
        src = src.replace("/ani-shiny/", "/ani/");
        shiny_img.css("display", "none");
    } else {
        src = src.replace("/ani/", "/ani-shiny/");
        shiny_img.css("display", "initial");
    }

    $(element).attr("src", src);
}

/**
 * Swaps the Pokemon GO and Main Series sections of the page.
 */
function SelectGame(pokemongo) {

    if (pokemongo) {
        $("#maingames-btn").prop("disabled", false);
        $("#pokemongo-btn").prop("disabled", true);
        $("#maingames").css("display", "none");
        $("#pokemongo").css("display", "initial");
    } else {
        $("#maingames-btn").prop("disabled", true);
        $("#pokemongo-btn").prop("disabled", false);
        $("#maingames").css("display", "initial");
        $("#pokemongo").css("display", "none");
    }
}

/**
 * Makes string clean, all lowercases and only alphanumeric characters.
 */
function Clean(string) {

    return string.toLowerCase().replace(/\W/g, "");
}
