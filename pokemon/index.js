$(document).ready(Main);

// global constants and variables

const pokeapi_url = "https://pokeapi.co/api/v2/";
const pogoapi_url = "https://pogoapi.net/api/v1/";
const gifs_url = "https://play.pokemonshowdown.com/sprites/ani/";

let pokemon_names, pokemon_moves;

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
    HttpGetAsync(pogoapi_url + "current_pokemon_moves.json",
            function(response) { pokemon_moves = JSON.parse(response); });
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
 * Callback function for when a pokemon name is input by the user.
 */
function OnSubmitPokemon() {

    const pokemon_name = $("#input").val().toLowerCase();

    // gets the pokemon id from the name and returns if it doesn't find it
    const pokemon_id = GetPokemonId(pokemon_name);
    if (pokemon_id == 0)
        return;

    $("#input").val("");

    $("#pokemon-img").attr("src", gifs_url
            + pokemon_name.replace(/\s/g, "") + ".gif");
    $("#pokemon-name").css("display", "initial");
    $("#pokemon-name").text("#" + pokemon_id + " "
            + pokemon_names[pokemon_id].name);

    //console.log(GetPokemonMoves(pokemon_id));
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
        if (pokemon_names[key].name.toLowerCase() == pokemon_name)
            pokemon_id = key;
    });

    return pokemon_id;
}

/**
 * Gets array of two arrays. The specified Pokemon's fast moves and charged
 * moves. If the pokemon is not found, returns an empty array.
 */
function GetPokemonMoves(pokemon_id) {

    if (!pokemon_moves)
        return;

    //const entries = pokemon_moves.filter(
            //entry => entry.pokemon_id == pokemon_id);
    const entry = pokemon_moves.find(entry =>
            entry.pokemon_id == pokemon_id && entry.form == "Normal");

    return (entry) ? [entry.fast_moves, entry.charged_moves] : [];
}

/**
 *
 */
function GetDps(pokemon_id, fm, cm) {

}
