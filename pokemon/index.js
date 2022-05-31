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

// pokeapi current pokemon
let pokeapi_current;
// pogoapi json objects
let pogoapi_names, pogoapi_max_id, pogoapi_types, pogoapi_evolutions,
        pogoapi_stats, pogoapi_moves, pogoapi_max_cp;
// pokemongo1 json objects
let pkmgo1_fm, pkmgo1_cm;
// local files jsno objects
let local_dws;

/**
 * Main function.
 */
function Main() {

    $("#input").focus();

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
    HttpGetAsync(pogoapi_url + "pokemon_max_cp.json",
            function(response) { pogoapi_max_cp = JSON.parse(response); });
    //HttpGetAsync(pogoapi_url + "pvp_fast_moves.json",
            //function(response) { fast_moves = JSON.parse(response); });
    //HttpGetAsync(pogoapi_url + "pvp_charged_moves.json",
            //function(response) { charged_moves = JSON.parse(response); });

    // pokemongo1
    HttpGetAsyncPokemongo1(pokemongo1_url + "fast_moves.json" ,
            function(response) { pkmgo1_fm = JSON.parse(response); });
    HttpGetAsyncPokemongo1(pokemongo1_url + "charged_moves.json" ,
            function(response) { pkmgo1_cm = JSON.parse(response); });

    // local
    $.ajax({
        type: "GET",
        url: "damage_window_starts.json",
        dataType: "text",
        success: function(json) { local_dws = JSON.parse(json); }
    });

    // event handlers
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
function LoadPokemon(clean_input) {

    // checks if all json objects are available
    if (!pogoapi_names || !pogoapi_types || !pogoapi_evolutions
            || !pogoapi_stats || !pogoapi_moves || !pogoapi_max_cp
            || !pkmgo1_fm || !pkmgo1_cm || !local_dws) {
        console.log("Couldn't load the pokemon because some json file "
                + "couldn't be loaded.");
        return;
    }

    // gets the pokemon id from the input and returns if it doesn't find it
    const pokemon_id = GetPokemonId(clean_input);
    if (pokemon_id == 0)
        return;

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

    // sets main pokemon container
    $("#main-container").append(GetPokemonContainer(pokemon_id));

    // sets previous and next pokemon containers
    for (i = 1; i <= 2; i++) {
        if (parseInt(pokemon_id) - i > 0) {
            $("#previous-containers").prepend(
                    GetPokemonContainer(parseInt(pokemon_id) - i));
        }
        if (parseInt(pokemon_id) + i <= pogoapi_max_id) {
            $("#next-containers").append(
                    GetPokemonContainer(parseInt(pokemon_id) + i));
        }
    }

    // if the buttons container (and other elements) are hidden...
    if ($("#buttons-container").css("display") == "none") {
        $("#buttons-container").css("display", "initial");
        $("#pokemongo").css("display", "initial");
    }

    LoadPokemongo(pokemon_id);
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
            return clean_input;
    }

    // checks for a name
    let pokemon_id = 0;
    Object.keys(pogoapi_names).forEach(function (key) {
        if (pogoapi_names[key].name.toLowerCase().replace(/\W/g, "")
                == clean_input) {
            pokemon_id = key;
        }
    });

    // if still didn't find anything
    if (pokemon_id == 0) {

        // checks for stupid nidoran
        if (clean_input == "nidoranf")
            return 29;
        else if (clean_input == "nidoranm")
            return 32;
    }

    return pokemon_id;
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
function GetPokemonContainer(pokemon_id) {

    const pokemon_name = pogoapi_names[pokemon_id].name;
    let clean_name = pokemon_name.toLowerCase().replace(/\W/g, "");
    // checks for stupid nidoran
    if (pokemon_id == 29)
        clean_name = "nidoranf";
    else if (pokemon_id == 32)
        clean_name = "nidoranm";

    const pokemon_container_div = $("<div></div>");

    const shiny_img =
        $("<div class=shiny-img-div><img src=imgs/shiny.png></img></div>");
    let img_container_div = $("<div class=img-container></div>");
    img_container_div.append($("<img onclick='SwapShiny(this)' src="
            + gifs_url + clean_name + ".gif></img>"));
    const pokemon_name_p = $("<p class='pokemon-name pokefont unselectable'"
            + "onclick='LoadPokemon(" + pokemon_id + ")'>#" + pokemon_id
            + " " + pokemon_name + "</p>");
    const pokemon_types_div = $("<div class=pokemon-types></div>");
    const types = pogoapi_types.find(entry =>
            entry.pokemon_id == pokemon_id).type;
    for (type of types) {
        pokemon_types_div.append($("<img src=imgs/" + type.toLowerCase()
                + ".gif></img>"));
    }

    pokemon_container_div.append(shiny_img);
    pokemon_container_div.append(img_container_div);
    pokemon_container_div.append(pokemon_name_p);
    pokemon_container_div.append(pokemon_types_div);

    return pokemon_container_div;
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

    const types = pogoapi_types.find(entry =>
            entry.pokemon_id == pokemon_id).type;
    const stats = pogoapi_stats.find(entry =>
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

    //const entries = pogoapi_moves.filter(
            //entry => entry.pokemon_id == pokemon_id);
    const entry = pogoapi_moves.find(entry =>
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
        const dws_obj = local_dws.find(entry =>entry.name == cm);
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

    const entry = pogoapi_max_cp.find(entry =>
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
        $("#pokemongo").css("display", "none");
        $("#maingames").css("display", "initial");
    }
}
