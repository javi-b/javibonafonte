/**
 * Author: Javi Bonafonte
 */

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
        case 641: // Tornadus
        case 642: // Thundurus
        case 645: // Landorus
        case 905: // Enamorus
            return [ "Incarnate", "Therian" ];
        case 647: // Keldeo
            return [ "Ordinary", "Resolute" ];
        case 648: // Meloetta
            return [ "Aria", "Pirouette" ];
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

    if (mega)
        img_src_name += "-mega"

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
                case 678: // Meowstic
                    return "Male";
            }
            break;
        case "Alola":
            return "Alolan Form";
        case "Plant":
        case "Sandy":
        case "Trash":
            return form + " Cloak";
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
        case "Red":
        case "Yellow":
        case "Orange":
        case "Blue":
        case "White":
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
