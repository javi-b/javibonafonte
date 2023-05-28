/**
 * Author: Javi Bonafonte
 */

// set of types constant
const POKEMON_TYPES = new Set();
POKEMON_TYPES.add("Normal");        POKEMON_TYPES.add("Fire");
POKEMON_TYPES.add("Water");         POKEMON_TYPES.add("Grass");
POKEMON_TYPES.add("Electric");      POKEMON_TYPES.add("Ice");
POKEMON_TYPES.add("Fighting");      POKEMON_TYPES.add("Poison");
POKEMON_TYPES.add("Ground");        POKEMON_TYPES.add("Flying");
POKEMON_TYPES.add("Psychic");       POKEMON_TYPES.add("Bug");
POKEMON_TYPES.add("Rock");          POKEMON_TYPES.add("Ghost");
POKEMON_TYPES.add("Dragon");        POKEMON_TYPES.add("Dark");
POKEMON_TYPES.add("Steel");         POKEMON_TYPES.add("Fairy");

/**
 * Gets array of strings of a specific pokemon forms.
 */
function GetPokemonForms(pokemon_id) {

    switch (pokemon_id) {
        case 19: // Rattata
        case 20: // Raticate
        case 26: // Raichu
        case 27: // Sandshrew
        case 28: // Sandslash
        case 37: // Vulpix
        case 38: // Ninetales
        case 50: // Diglett
        case 51: // Dugtrio
        case 53: // Persian
        case 74: // Geodude
        case 75: // Graveler
        case 76: // Golem
        case 88: // Grimer
        case 89: // Muk
        case 103: // Exeggutor
        case 105: // Marowak
            return [ "Normal", "Alola" ];
        case 77: // Ponyta
        case 78: // Rapidash
        case 79: // Slowpoke
        case 80: // Slowbro
        case 83: // Farfetch'd
        case 110: // Weezing
        case 122: // Mr. Mime
        case 144: // Articuno
        case 145: // Zapdos
        case 146: // Moltres
        case 199: // Slowking
        case 222: // Corsola
        case 263: // Zigzagoon
        case 264: // Linoone
        case 554: // Darumaka
        case 562: // Yamask
        case 618: // Stunfisk
            return [ "Normal", "Galarian" ];
        case 52: // Meowth
            return [ "Normal", "Alola", "Galarian" ];
        case 58: // Growlithe
        case 59: // Arcanine
        case 100: // Voltorb
        case 101: // Electrode
        case 157: // Typhlosion
        case 211: // Qwillfish
        case 215: // Sneasel
        case 503: // Samurott
        case 549: // Lilligat
        case 570: // Zorua
        case 571: // Zoroark
        case 628: // Braviary
        case 705: // Sliggoo
        case 706: // Goodra
        case 713: // Avalugg
        case 724: // Decidueye
            return [ "Normal", "Hisuian" ];
        case 351: // Castform
            return [ "Normal", "Sunny", "Rainy", "Snowy" ];
        case 386: // Deoxys
            return [ "Normal", "Attack", "Defense", "Speed" ];
        case 412: // Burmy
        case 413: // Wormadam
            return [ "Plant", "Sandy", "Trash" ];
        case 421: // Cherrim
            return [ "Overcast", "Sunny" ];
        case 422: // Shellos
        case 423: // Gastrodon
            return [ "West_sea", "East_sea" ];
        case 479: // Rotom
            return [ "Normal", "Heat", "Wash", "Frost", "Fan", "Mow" ]
        case 487: // Giratina
            return [ "Altered", "Origin" ];
        case 492: // Shaymin
            return [ "Land", "Sky" ];
        case 550: // Basculin
            return [ "Red_striped", "Blue_striped"];
        case 555: // Darmanitan
            return [ "Standard", "Zen",
                "Galarian_standard", "Galarian_zen" ];
        case 585: // Deerling
        case 586: // Sawsbuck
            return [ "Spring", "Summer", "Autumn", "Winter" ];
        case 592: // Frillish
        case 593: // Jellicent
            return [ "Normal", "Female" ];
        case 641: // Tornadus
        case 642: // Thundurus
        case 645: // Landorus
        case 905: // Enamorus
            return [ "Incarnate", "Therian" ];
        case 646: // Kyurem
            return [ "Normal", "White", "Black" ];
        case 647: // Keldeo
            return [ "Ordinary", "Resolute" ];
        case 648: // Meloetta
            return [ "Aria", "Pirouette" ];
        case 649: // Genesect
            return [ "Normal", "Shock", "Burn", "Chill", "Douse" ];
        //case 664: // Scatterbug
        //case 665: // Spewpa
        case 666: // Vivillon
            return [ "Meadow", "Archipelago", "Continental", "Elegant",
                "Fancy", "Garden", "High_plains", "Icy_snow", "Jungle",
                "Marine", "Modern", "Monsoon", "Ocean", "Poke_ball",
                "Polar", "River", "Sandstorm", "Savanna", "Sun", "Tundra" ];
        case 668: // Pyroar
            return [ "Normal", "Female" ];
        case 669: // Flabebe
        case 670: // Floette
        case 671: // Florges
            return [ "Red", "Yellow", "Orange", "Blue", "White" ];
        case 676: // Furfrou
            return [ "Natural", "Heart", "Star", "Diamond", "Debutante",
                "Matron", "Dandy", "La_reine", "Kabuki", "Pharaoh" ];
        case 678: // Meowstic
            return [ "Normal", "Female" ];
        case 710: // Pumpkaboo
        case 711: // Gourgeist
            return [ "Average", "Small", "Large", "Super" ];
        case 720: // Hoopa
            return [ "Confined", "Unbound" ];
        case 741: // Oricorio
            return [ "Baile", "Pompom", "Pau", "Sensu" ];
        case 745: // Lycanroc
            return [ "Midday", "Midnight", "Dusk" ];
        case 746: // Wishiwashi
            return [ "Solo", "School" ];
        case 774: // Minior
            return [ "Red" ]; // TODO not added to pokmeon go yet
        case 778: // Mimikyu
            return [ "Disguised", "Busted" ];
        case 849: // Toxtricity
            return [ "Amped", "Low_key" ];
        case 854: // Sinistea
        case 855: // Polteageist
            return [ "Phony", "Antique" ];
        case 862: // Obstagoon
        case 863: // Perrserker
        case 865: // Sirfetch'd
        case 866: // Mr. Rime
        case 867: // Runerigus
            return [ "Galarian" ];
        case 875: // Eiscue
            return [ "Ice", "Noice" ];
        case 876: // Indeedee
            return [ "Male", "Female" ];
        case 877: // Morpeko
            return [ "Full_belly", "Hangry" ];
        case 888: // Zacian
            return [ "Hero" , "Crowned_sword" ];
        case 889: // Zamazenta
            return [ "Hero" , "Crowned_shield" ];
        case 890: // Eternatus
            return [ "Normal", "Eternamax" ];
        case 892: // Urshifu
            return [ "Single_strike", "Rapid_strike" ];
        case 898: // Calyrex
            return [ "Normal", "Ice_rider", "Shadow_rider" ];
        default:
            return [ "Normal" ];
    }
}

/**
 * Gets string of a specific pokemon default form.
 */
function GetPokemonDefaultForm(pokemon_id) {

    return GetPokemonForms(pokemon_id)[0];
}

/**
 * Gets a specific pokemon's name used for its image source url.
 * The name varies depending on the pokemon's form and whether it's a mega.
 */
function GetPokemonImgSrcName(pokemon_id, clean_name, form, mega, mega_y) {

    // checks for stupid nidoran
    if (pokemon_id == 29)
        clean_name = "nidoranf";
    else if (pokemon_id == 32)
        clean_name = "nidoranm";

    let img_src_name = clean_name;

    if (form != GetPokemonDefaultForm(pokemon_id)) {

        switch (form) {
            case "Normal":
            case "Meadow":
                break;
            case "Galarian":
                img_src_name += "-galar";
                break;
            case "Sunny":
                if (pokemon_id == 421) // Cherrim
                    img_src_name += "-sunshine";
                else
                    img_src_name += "-sunny";
                break;
            case "East_sea":
                img_src_name += "-east";
                break;
            case "Galarian_standard":
                img_src_name += "-galar";
                break;
            case "Galarian_zen":
                img_src_name += "-galarzen";
                break;
            case "Female":
                img_src_name += "-f";
                break;
            case "Crowned_sword":
            case "Crowned_shield":
                img_src_name += "-crowned";
                break;
            case "Ice_rider":
                img_src_name += "-ice";
                break;
            case "Shadow_rider":
                img_src_name += "-shadow";
                break;
            default:
                img_src_name += "-";
                img_src_name += form.toLowerCase().replace(/_/g, "");
                break;
        }
    }

    if (mega) {
        if (pokemon_id == 382 || pokemon_id == 383) // Kyogre or Groudon
            img_src_name += "-primal";
        else
            img_src_name += "-mega";
    }

    const can_be_mega_y = pokemon_id == 6 || pokemon_id == 150; 
    if (mega && can_be_mega_y)
        img_src_name += ((mega_y) ? "y" : "x");

    return img_src_name;
}

/**
 * Gets a specific form display text.
 */
function GetFormText(pokemon_id, form) {

    const is_galarian_but_not_only = (form == "Galarian"
            && GetPokemonDefaultForm(pokemon_id) != "Galarian");

    if (is_galarian_but_not_only)
        return "Galarian Form";

    if (pokemon_id == 774) // TODO Minior not handled yet
        return "";

    switch (form) {
        case "Normal":
            switch (pokemon_id) {
                case 351: // Castform
                    return "Normal Form";
                case 386: // Deoxys
                    return "Normal Forme";
                case 479: // Rotom
                    return "Rotom";
                case 592: // Frillish
                case 593: // Jellicent
                case 678: // Meowstic
                case 668: // Pyroar
                    return "Male";
                case 646: // Kyurem
                    return "Kyurem";
                case 649: // Genesect
                    return "Normal";
                case 890: // Eternatus
                    return "Eternatus";
            }
            break;
        case "Alola":
            return "Alolan Form";
        case "Plant":
        case "Sandy":
        case "Trash":
            return form + " Cloak";
        case "Hisuian":
        case "Rainy":
        case "Snowy":
        case "Overcast":
        case "Spring":
        case "Autumn":
        case "Winter":
        case "Summer":
        case "Ordinary":
        case "Resolute":
        case "Natural":
        case "Midday":
        case "Midnight":
        case "Dusk":
        case "Solo":
        case "School":
        case "Disguised":
        case "Busted":
        case "Amped":
        case "Phony":
        case "Antique":
            return form + " Form";
        case "Sunny":
            if (pokemon_id == 421) // Cherrim
                return "Sunshine Form";
            else
                return "Sunny Form";
        case "West_sea":
            return "West Sea";
        case "East_sea":
            return "East Sea";
        case "Heat":
        case "Wash":
        case "Frost":
        case "Fan":
        case "Mow":
            return form + " Rotom";
        case "Attack":
        case "Defense":
        case "Speed":
        case "Altered":
        case "Origin":
        case "Land":
        case "Sky":
        case "Incarnate":
        case "Therian":
        case "Aria":
        case "Pirouette":
            return form + " Forme";
        case "White":
            switch (pokemon_id) {
                case 646: // Kyurem
                    return "White Kyurem";
                case 669: // Flabebe
                case 670: // Floette
                case 671: // Florges
                    return "White Flower";
            }
            break;
        case "Black":
            return "Black Kyurem";
        case "Shock":
        case "Burn":
        case "Chill":
        case "Douse":
            return form + " Drive";
        case "Red_striped":
            return "Red-Striped";
        case "Blue_striped":
            return "Blue-Striped";
        case "Standard":
            return "Standard Mode";
        case "Zen":
            return "Zen Mode";
        case "Galarian_standard":
            return "Galarian Standard Mode";
        case "Galarian_zen":
            return "Galarian Zen Mode";
        case "Archipelago":
        case "Continental":
        case "Elegant":
        case "Fancy":
        case "Garden":
        case "Jungle":
        case "Marine":
        case "Meadow":
        case "Modern":
        case "Monsoon":
        case "Ocean":
        case "Polar":
        case "River":
        case "Sandstorm":
        case "Savanna":
        case "Sun":
        case "Tundra":
            return form + " Pattern";
        case "High_plains":
            return "High Plains Pattern";
        case "Icy_snow":
            return "Icy Snow Pattern";
        case "Poke_ball":
            return "Poké Ball Pattern";
        case "Red":
        case "Yellow":
        case "Orange":
        case "Blue":
            return form + " Flower";
        case "Heart":
        case "Star":
        case "Diamond":
        case "Debutante":
        case "Matron":
        case "Dandy":
        case "Kabuki":
        case "Pharaoh":
            return form + " Trim";
        case "La_reine":
            return "La Reine Trim";
        case "Average":
        case "Small":
        case "Large":
        case "Super":
            return form + " Size";
        case "Confined":
        case "Unbound":
            return "Hoopa " + form;
        case "Baile":
            return "Baile Style";
        case "Pompom":
            return "Pom-Pom Style";
        case "Pau":
            return "Pa'u Style";
        case "Sensu":
            return "Sensu Style";
        case "Low_key":
            return "Low Key Form";
        case "Ice":
        case "Noice":
            return form + " Face";
        case "Male":
        case "Female":
            return form;
        case "Full_belly":
            return "Full Belly Mode";
        case "Hangry":
            return "Hangry Mode";
        case "Hero":
            return "Hero of Many Battles";
        case "Crowned_sword":
            return "Crowned Sword";
        case "Crowned_shield":
            return "Crowned Shield";
        case "Eternamax":
            return "Eternamax Eternatus";
        case "Single_strike":
            return "Single Strike Style";
        case "Rapid_strike":
            return "Rapid Strike Style";
        case "Ice_rider":
            return "Ice Rider";
        case "Shadow_rider":
            return "Shadow Rider";
    }

    return "";
}

/**
 * Gets the x and y coordinates for a specific pokemon in the pokemon icons
 * spritesheet.
 */
function GetPokemonIconCoords(pokemon_id, form, mega, mega_y) {

    const NUM_COLS = 12, W = 40, H = 30;

    col = 0, row = 0;

    if (mega) {

        switch (pokemon_id) {
        case 3: // Venusaur
            col = 0, row = 105;
            break;
        case 6: // Charizard
            col = (mega_y) ? 2 : 1, row = 105;
            break;
        case 9: // Blastoise
            col = 3, row = 105;
            break;
        case 15: // Beedrill
            col = 4, row = 105;
            break;
        case 18: // Pidgeot
            col = 5, row = 105;
            break;
        case 65: // Alakazam
            col = 6, row = 105;
            break;
        case 80: // Slowbro
            col = 7, row = 105;
            break;
        case 94: // Gengar
            col = 8, row = 105;
            break;
        case 115: // Kangaskhan
            col = 9, row = 105;
            break;
        case 127: // Pinsir
            col = 10, row = 105;
            break;
        case 130: // Gyarados
            col = 11, row = 105;
            break;
        case 142: // Aerodactyl
            col = 0, row = 106;
            break;
        case 150: // Mewtwo
            col = (mega_y) ? 2 : 1, row = 106;
            break;
        case 181: // Ampharos
            col = 3, row = 106;
            break;
        case 208: // Steelix
            col = 4, row = 106;
            break;
        case 212: // Scizor
            col = 5, row = 106;
            break;
        case 214: // Heracross
            col = 6, row = 106;
            break;
        case 229: // Houndoom
            col = 7, row = 106;
            break;
        case 248: // Tyranitar
            col = 8, row = 106;
            break;
        case 254: // Sceptile
            col = 9, row = 106;
            break;
        case 257: // Blaziken
            col = 10, row = 106;
            break;
        case 260: // Swampert
            col = 11, row = 106;
            break;
        case 282: // Gardevoir
            col = 0, row = 107;
            break;
        case 302: // Sableye
            col = 1, row = 107;
            break;
        case 303: // Mawile
            col = 2, row = 107;
            break;
        case 306: // Aggron
            col = 3, row = 107;
            break;
        case 308: // Medicham
            col = 4, row = 107;
            break;
        case 310: // Manectric
            col = 5, row = 107;
            break;
        case 319: // Sharpedo
            col = 6, row = 107;
            break;
        case 323: // Camerupt
            col = 7, row = 107;
            break;
        case 334: // Altaria
            col = 8, row = 107;
            break;
        case 354: // Banette
            col = 9, row = 107;
            break;
        case 359: // Absol
            col = 10, row = 107;
            break;
        case 362: // Glalie
            col = 11, row = 107;
            break;
        case 373: // Salamence
            col = 0, row = 108;
            break;
        case 376: // Metagross
            col = 1, row = 108;
            break;
        case 380: // Latias
            col = 2, row = 108;
            break;
        case 381: // Latios
            col = 3, row = 108;
            break;
        case 382: // Kyogre
            col = 4, row = 108;
            break;
        case 383: // Groudon
            col = 5, row = 108;
            break;
        case 384: // Rayquaza
            col = 6, row = 108;
            break;
        case 428: // Lopunny
            col = 7, row = 108;
            break;
        case 445: // Garchomp
            col = 8, row = 108;
            break;
        case 448: // Lucario
            col = 9, row = 108;
            break;
        case 460: // Abomasnow
            col = 10, row = 108;
            break;
        case 475: // Gallade
            col = 11, row = 108;
            break;
        case 531: // Audino
            col = 0, row = 109;
            break;
        case 719: // Diancie
            col = 1, row = 109;
            break;
        }

    } else if (pokemon_id == 26 && form == "Alola") { // Raichu
        col = 1, row = 95;

    } else if (pokemon_id == 28 && form == "Alola") { // Sandslash
        col = 3, row = 95;

    } else if (pokemon_id == 51 && form == "Alola") { // Dugtrio
        col = 7, row = 95;

    } else if (pokemon_id == 59 && form == "Hisuian") { // Arcanine
        col = 3, row = 102;

    } else if (pokemon_id == 76 && form == "Alola") { // Golem
        col = 0, row = 96;

    } else if (pokemon_id == 78 && form == "Galarian") { // Rapidash
        col = 0, row = 99;

    } else if (pokemon_id == 80 && form == "Galarian") { // Slowbro
        col = 5, row = 101;

    } else if (pokemon_id == 89 && form == "Alola") { // Muk
        col = 2, row = 96;

    } else if (pokemon_id == 103 && form == "Alola") { // Exeggutor
        col = 3, row = 96;

    } else if (pokemon_id == 144 && form == "Galarian") { // Articuno
        col = 8, row = 101;
    } else if (pokemon_id == 145 && form == "Galarian") { // Zapdos
        col = 9, row = 101;
    } else if (pokemon_id == 146 && form == "Galarian") { // Moltres
        col = 10, row = 101;

    } else if (pokemon_id == 199 && form == "Galarian") { // Slowking
        col = 11, row = 101;

    } else if (pokemon_id == 211 && form == "Hisuian") { // Qwilfish
        col = 7, row = 102;

    } else if (pokemon_id == 423 && form == "East_sea") { // Gastrodon
        col = 11, row = 88;

    } else if (pokemon_id == 479 && form == "Heat") { // Rotom
        col = 2, row = 89;
    } else if (pokemon_id == 479 && form == "Wash") { // Rotom
        col = 4, row = 89;
    } else if (pokemon_id == 479 && form == "Frost") { // Rotom
        col = 1, row = 89;
    } else if (pokemon_id == 479 && form == "Fan") { // Rotom
        col = 0, row = 89;
    } else if (pokemon_id == 479 && form == "Mow") { // Rotom
        col = 3, row = 89;

    } else if (pokemon_id == 487 && form == "Origin") { // Giratina
        col = 5, row = 89;

    } else if (pokemon_id == 555 && form == "Zen") { // Darmanitan
            col = 9, row = 89;
    } else if (pokemon_id == 555 && form == "Galarian_standard") { // Darmanitan
            col = 8, row = 99;
    } else if (pokemon_id == 555 && form == "Galarian_zen") { // Darmanitan
            col = 9, row = 99;

    } else if (pokemon_id == 593 && form == "Female") { // Jellicent
        col = 5, row = 90;

    } else if (pokemon_id == 628 && form == "Hisuian") { // Braviary
        col = 1, row = 103;

    } else if (pokemon_id == 641 && form == "Therian") { // Tornadus
        col = 6, row = 90;
    } else if (pokemon_id == 642 && form == "Therian") { // Thundurus
        col = 7, row = 90;
    } else if (pokemon_id == 645 && form == "Therian") { // Landorus
        col = 8, row = 90;

    } else if (pokemon_id == 646 && form == "White") { // Kyurem
        col = 10, row = 90;
    } else if (pokemon_id == 646 && form == "Black") { // Kyurem
        col = 9, row = 90;

    } else if (pokemon_id == 647 && form == "Resolute") { // Keldeo
        col = 11, row = 90;

    } else if (pokemon_id == 648 && form == "Pirouette") { // Meloetta
        col = 0, row = 91;

    } else if (pokemon_id == 668 && form == "Female") { // Pyroar
        col = 8, row = 92;

    } else if (pokemon_id == 671 && form == "Yellow") { // Florges
        col = 9, row = 93;
    } else if (pokemon_id == 671 && form == "Orange") { // Florges
        col = 7, row = 93;
    } else if (pokemon_id == 671 && form == "Blue") { // Florges
        col = 6, row = 93;
    } else if (pokemon_id == 671 && form == "White") { // Florges
        col = 8, row = 93;

    } else if (pokemon_id == 713 && form == "Hisuian") { // Avalugg
        col = 4, row = 103;

    } else if (pokemon_id == 720 && form == "Unbound") { // Hoopa
        col = 10, row = 94;

    } else if (pokemon_id == 741 && form == "Pompom") { // Oricorio
        col = 8, row = 96;
    } else if (pokemon_id == 741 && form == "Pau") { // Oricorio
        col = 9, row = 96;
    } else if (pokemon_id == 741 && form == "Sensu") { // Oricorio
        col = 10, row = 96;

    } else if (pokemon_id == 745 && form == "Midnight") { // Lycanroc
        col = 11, row = 96;
    } else if (pokemon_id == 745 && form == "Dusk") { // Lycanroc
        col = 4, row = 98;

    } else if (pokemon_id == 888 && form == "Crowned_sword") { // Zacian
        col = 2, row = 101;
    } else if (pokemon_id == 889 && form == "Crowned_shield") { // Zamazenta
        col = 3, row = 101;

    } else {
        col = pokemon_id % NUM_COLS;
        row = Math.floor(pokemon_id / NUM_COLS);
    }

    return {x: col * -W, y: row * -H};
}
