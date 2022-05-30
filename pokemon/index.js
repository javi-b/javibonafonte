$(document).ready(Main);

// global constants and variables

const pokeapi_url = "https://pokeapi.co/api/v2/";
const pogoapi_url = "https://pogoapi.net/api/v1/";
const pokemongo1_url = "https://pokemon-go1.p.rapidapi.com/";
const pokemongo1_key = "a7236470dbmsheefb2d24399d84cp118c40jsn1f6c231dcf33";
const gifs_url = "https://play.pokemonshowdown.com/sprites/ani/";
const shiny_gifs_url =
    "https://play.pokemonshowdown.com/sprites/ani-shiny/";

const cpm_lvl40 = 0.7903; // cp multiplier at level 40

// api jsons objects
let pokemon_names, pokemon_types, pokemon_stats, pokemon_moves, max_cp,
        fast_moves, charged_moves, damage_window_starts;

/**
 * Main function.
 */
function Main() {

    $("#input").focus();

    // pokeapi
    /*
    HttpGetAsync(pokeapi_url + "pokemon/palkia", function(response) {
        const obj = JSON.parse(response);
        console.log(obj.name);
    });
    */

    // pogoapi
    HttpGetAsync(pogoapi_url + "pokemon_names.json",
            function(response) { pokemon_names = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "pokemon_types.json",
            function(response) { pokemon_types = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "pokemon_stats.json",
            function(response) { pokemon_stats = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "current_pokemon_moves.json",
            function(response) { pokemon_moves = JSON.parse(response); });
    HttpGetAsync(pogoapi_url + "pokemon_max_cp.json",
            function(response) { max_cp = JSON.parse(response); });
    //HttpGetAsync(pogoapi_url + "pvp_fast_moves.json",
            //function(response) { fast_moves = JSON.parse(response); });
    //HttpGetAsync(pogoapi_url + "pvp_charged_moves.json",
            //function(response) { charged_moves = JSON.parse(response); });
    HttpGetAsyncPokemongo1(pokemongo1_url + "fast_moves.json" ,
            function(response) { fast_moves = JSON.parse(response); });
    HttpGetAsyncPokemongo1(pokemongo1_url + "charged_moves.json" ,
            function(response) { charged_moves = JSON.parse(response); });

    $.ajax({
        type: "GET",
        url: "damage_window_starts.json",
        dataType: "text",
        success: function(json) { damage_window_starts = JSON.parse(json); }
    });

    // event handlers
    $("#pokemon-img").click(SwapPokemonImg);
    $("#maingames-btn").click(function() { SelectGame(false); });
    $("#pokemongo-btn").click(function() { SelectGame(true); });
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
 * Callback function for when a pokemon name is input by the user.
 */
function OnSubmitPokemon() {

    LoadPokemon($("#input").val().toLowerCase().replace(/\W/g, ""));
}

/**
 * Loads a pokemon page.
 */
function LoadPokemon(pokemon_name) {

    // gets the pokemon id from the name and returns if it doesn't find it
    const pokemon_id = GetPokemonId(pokemon_name);
    if (pokemon_id == 0)
        return;

    $("#input").val("");

    $("#pokemon-img").attr("src", gifs_url + pokemon_name + ".gif");
    $("#pokemon-name").css("display", "initial");
    $("#pokemon-name").text("#" + pokemon_id + " "
            + pokemon_names[pokemon_id].name);

    // if the buttons container (and other elements) are hidden...
    if ($("#buttons-container").css("display") == "none") {
        $("#buttons-container").css("display", "initial");
        $("#pokemongo").css("display", "initial");
    }

    LoadPokemongo(pokemon_id);
    LoadMaingames(pokemon_id);
}

/**
 * Gets the pokemon id from a specific pokemon name. Returns 0 if it
 * doesn't find it.
 */
function GetPokemonId(pokemon_name) {

    if (!pokemon_names)
        return;

    let pokemon_id = 0;
    Object.keys(pokemon_names).forEach(function (key) {
        if (pokemon_names[key].name.toLowerCase().replace(/\W/g, "")
                == pokemon_name) {
            pokemon_id = key;
        }
    });

    return pokemon_id;
}

/**
 * Loads one pokemon data for the Pokemon GO section.
 */
function LoadPokemongo(pokemon_id) {

    $("#max-cp").text("Max CP at lvl 40: " + GetMaxCP(pokemon_id));
    LoadPokemongoTable(pokemon_id);
}

/**
 * Loads the table in the Pokemon Go section including information about
 * the possible move combinations and their stats (dps, tod, dps3tdo).
 */
function LoadPokemongoTable(pokemon_id) {

    if (!pokemon_types || !pokemon_stats)
        return;

    const types = pokemon_types.find(entry =>
            entry.pokemon_id == pokemon_id).type;
    const stats = pokemon_stats.find(entry =>
            entry.pokemon_id == pokemon_id);
    const atk = (stats.base_attack + 15) * cpm_lvl40;
    const def = (stats.base_defense + 15) * cpm_lvl40;
    const hp = (stats.base_stamina + 15) * cpm_lvl40;

    const moves = GetPokemongoMoves(pokemon_id);
    if (moves.length != 2)
        return;

    const fms = moves[0];
    const cms = moves[1];

    // removes previous table rows
    $("#pokemongo-table tr:not(.table-header)").remove();

    // appends new table rows

    for (fm of fms) {
        for (cm of cms) {

            const dps = GetDPS(types, atk, def, hp, fm, cm);
            const tdo = GetTDO(dps, hp, def);
            const dps3tdo = Math.pow(dps, 3) * tdo / 1000;

            const tr = $("<tr></tr>");
            const td_fm = $("<td>" + fm + "</td>");
            const td_cm = $("<td>" + cm + "</td>");
            const td_dps = $("<td>" + dps.toFixed(3) + "</td>");
            const td_tdo = $("<td>" + tdo.toFixed(1) + "</td>");
            const td_dps3tdo = $("<td>" + dps3tdo.toFixed(1) + "</td>");

            tr.append(td_fm);
            tr.append(td_cm);
            tr.append(td_dps);
            tr.append(td_tdo);
            tr.append(td_dps3tdo);

            $("#pokemongo-table").append(tr);
        }
    }
}

/**
 * Gets array of two arrays. The specified Pokemon's fast moves and charged
 * moves. If the pokemon is not found, returns an empty array.
 */
function GetPokemongoMoves(pokemon_id) {

    if (!pokemon_moves)
        return [];

    //const entries = pokemon_moves.filter(
            //entry => entry.pokemon_id == pokemon_id);
    const entry = pokemon_moves.find(entry =>
            entry.pokemon_id == pokemon_id && entry.form == "Normal");

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

    if (!fast_moves || !charged_moves || !damage_window_starts)
        return 0;

    const fm_obj = fast_moves.find(entry => entry.name == fm);
    const cm_obj = charged_moves.find(entry => entry.name == cm);

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
        const dws_obj = damage_window_starts.find(entry =>entry.name == cm);
        if (dws_obj) {
            const dws = dws_obj.damage_window_start;
            cm_eps = (-cm_obj.energy_delta + 0.5 * fm_obj.energy_delta
                    + 0.5 * y * dws) / (cm_obj.duration / 1000);
        } else {
            console.log("Couldn't find DamageWindowStart for Charged Move"
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
 * Gets a pokemon max CP at level 40 in Pokemon GO.
 */
function GetMaxCP(pokemon_id) {

    if (!max_cp)
        return 0;

    //const entries = pokemon_moves.filter(
            //entry => entry.pokemon_id == pokemon_id);
    const entry = max_cp.find(entry =>
            entry.pokemon_id == pokemon_id && entry.form == "Normal");

    return (entry) ? entry.max_cp : 0;
}

/**
 * Loads one pokemon data for the Main Games section.
 */
function LoadMaingames(pokemon_id) {

}

/**
 * Swaps the pokemon image for its shiny form.
 */
function SwapPokemonImg() {

    let src = $("#pokemon-img").attr("src");
    if (src.includes("/ani-shiny/"))
        src = src.replace("/ani-shiny/", "/ani/");
    else
        src = src.replace("/ani/", "/ani-shiny/");
    $("#pokemon-img").attr("src", src);
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
        $("#pokemongo").css("display", "none");
        $("#maingames").css("display", "initial");
    }
}
