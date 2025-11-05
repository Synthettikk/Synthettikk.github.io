import Rotor from "./rotor.js";
import Reflector from "./reflector.js";
import Keyboard from "./keyboard.js";
import Plugboard from "./plugboard.js"
import Enigma from "./enigma.js";


//boutons
const cipher_button = document.getElementById("cipher_button");
const decipher_button = document.getElementById("decipher_button");

cipher_button.addEventListener('click', init_enigma_cipher);


// keyboard
const keyboard = new Keyboard();

function init_enigma_cipher() {
    // initialisation des rotors et du reflector
    const global_parameters = get_global_parameters();
    // initialisation du message
    const clear = document.getElementById("clear").value;
    let encrypted = '';
    const message = {clear: clear, encrypted: encrypted};
    const check_parameters = parameters_are_ok(document.getElementById("plugboard").value);
    // on vérifie les parametres
    if (check_parameters.boolean === false){
        document.getElementById("encrypted").value = check_parameters.error_message;
        return;
    }
    const parameters = get_parameters(global_parameters);
    const ENIGMA = new Enigma(parameters.reflector, parameters.rotor1, parameters.rotor2, parameters.rotor3, parameters.plugboard, keyboard);
    // choix de la clé (position de départ des rotors)
    ENIGMA.set_key(parameters.key);
    // choix des rings
    ENIGMA.set_rings(parameters.rings);

    // cipher
    document.getElementById("encrypted").value = cipher(message, ENIGMA);
}
    
function cipher(message, ENIGMA) {
    // on commence par passer le message clair en maj (car on travaille que sur des majs)
    const clear = message.clear.toUpperCase();
    let incr = 0;
    for(let i = 0; i < clear.length; i++) {
        if(incr === 5){ // rajoute un espace toutes les 5 lettres
            message.encrypted += ' ';
            incr = 0;
        }
        if(alphabet.indexOf(clear[i]) !== -1){ // on chiffre que les lettres de l'alphabet, les autres caracteres degagent
            message.encrypted += ENIGMA.encipher(clear[i]);
            incr += 1;
        }
    }
    return message.encrypted;
}

function parameters_are_ok(plugboard) { // on regarde surtout le plugboard, les autres sont forcément ok sauf si on modifie les var dans le code html
    //plugboard (doit etre des pairs de lettres)
    plugboard = plugboard.replace(/  +/g, ' '); // enleve les espaces en trop
    plugboard = plugboard.toUpperCase();
    let trueOrFalse;
    let error;
    for(let index = 0; index < plugboard.length; index += 1){
        if ((index + 1) % 3 === 0 && plugboard[index] !== ' ') { // tous les 3 on a un espace
            trueOrFalse = false;
            error = 'Erreur: Le plugboard doit uniquement contenir des pairs de lettres. Par exemple \'AB CD EF GH IJ KL MN OP\'.';
            return {boolean: trueOrFalse, error_message:error};
        }
        if ((index + 1) % 3 !== 0 && alphabet.indexOf(plugboard[index]) === -1){ // les caracteres entre les espaces doivent etre 2 lettres
            trueOrFalse = false;
            error = 'Erreur: Le plugboard doit uniquement contenir des pairs de lettres. Par exemple \'AB CD EF GH IJ KL MN OP\'.';
            return {boolean: trueOrFalse, error_message:error};
        }
    }
    if (alphabet.indexOf(plugboard[plugboard.length - 2]) === -1){ // il faut que l'avant dernier caract soit une lettre
        trueOrFalse = false;
        error = 'Erreur: Le plugboard doit uniquement contenir des pairs de lettres. Par exemple \'AB CD EF GH IJ KL MN OP\'.';
        return {boolean: trueOrFalse, error_message:error};
    }
    // regarde si deux des rotors choisis sont identiques
    if(document.getElementById("rotor1").value === document.getElementById("rotor2").value || document.getElementById("rotor2").value === document.getElementById("rotor3").value || document.getElementById("rotor3").value === document.getElementById("rotor1").value){
        trueOrFalse = false;
        error = 'Erreur: Les rotors doivent être deux à deux distincts.'
        return {boolean: trueOrFalse, error_message:error};
    }
    trueOrFalse = true;
    error = '';
    return {boolean: trueOrFalse, error_message:error};
}

function structure_pairs_pb(plugboard_value) { // à ce stade on suppose que plugboard_value vérifie les cdt: str de pairs de lettres avec espaces
    let pairs = [];
    while (plugboard_value.length > 0){
        const pair = plugboard_value.slice(0, 2);
        plugboard_value = plugboard_value.slice(3);
        pairs.push(pair);
    }
    return pairs;
}

function get_global_parameters(){
    // initialisation des reflectors
    const A = new Reflector("EJMZALYXVBWFCRQUONTSPIKHGD");
    const B = new Reflector("YRUHQSLDPXNGOKMIEBFZCWVJAT");
    const C = new Reflector("FVPJIAOYEDRZXWGCTKUQSBNMHL");
    const reflectors = [A, B, C];
    // initialisation des rotors
    const I = new Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q");
    const II = new Rotor("AJDKSIRUXBLHWTMCQGZNPYFVOE", "E");
    const III = new Rotor("BDFHJLCPRTXVZNYEIWGAKMUSQO", "V");
    const IV = new Rotor("ESOVPZJAYQUIRHXLNFTGKDCMWB", "J");
    const V = new Rotor("VZBRGITYUPSDNHLXAWMJQOFECK", "Z");
    const rotors = [I,II, III, IV, V];
    return {reflectors: reflectors, rotors: rotors};
}

function get_parameters(global_parameters){
    const pb_str = document.getElementById("plugboard").value;
    const key = pos_letter_rotor1 + pos_letter_rotor2 + pos_letter_rotor3;
    const rings = [ring_number_rotor1 + 1, ring_number_rotor2 + 1, ring_number_rotor3 + 1];
    const pairs = structure_pairs_pb(pb_str);
    const plugb = new Plugboard(pairs);
    const reflector = global_parameters.reflectors[document.getElementById('reflector').value];
    const rotor1 = global_parameters.rotors[document.getElementById("rotor1").value];
    const rotor2 = global_parameters.rotors[document.getElementById("rotor2").value];
    const rotor3 = global_parameters.rotors[document.getElementById("rotor3").value];
    return {plugboard: plugb, key: key, rings: rings, reflector: reflector, rotor1: rotor1, rotor2: rotor2, rotor3: rotor3};
}