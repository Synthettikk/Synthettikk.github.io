//boutons
const cipher_button = document.getElementById("cipher_button");
const decipher_button = document.getElementById("decipher_button");


cipher_button.addEventListener('click', init_affine_cipher);
decipher_button.addEventListener('click', init_affine_decipher);


// en JS, % ne renvoit pas un modulo
function mod(number, divisor) {
    return ((number % divisor + divisor) % divisor);
}

// trouve l'inverse de a dans Z/nZ (a doit etre premier avec n pour etre inversible sinon boucle inf car pas d'inverse, verification peut etre faite par l'algo d'euclide). La méthode générale serait de trouver une relation de bézout mais pour un petit n (modulo) ca suffit
function modulo_inv(a, n) {
    let inv_a = 1;
    while(mod((inv_a * a), n) !== 1){
        inv_a += 1;
    };
    return inv_a;
}

function Euclide_algo(a, b) { //renvoit le pgcd de a et b (a et b entiers) sans détruire a et b
    let a1 = a;
    let b1 = b;
    let b2;
    while (b1 !== 0) {
        b2 = mod(a1, b1);
        a1 = b1;
        b1 = b2;
    }
    return a1;
}

function init_affine_cipher() {
    const clear = document.getElementById("clear").value;
    let encrypted = '';
    const message = {clear: clear, encrypted: encrypted};
    const parameters = get_parameters();
    if (affine_cipher_parameters_are_ok(parameters)) {
        document.getElementById("encrypted").value = affine_cipher(message, parameters);
    } else {
        document.getElementById("encrypted").value = "Erreur: les coefficients A et B doivent être entiers.";;
    }
}

function init_affine_decipher() {
    let clear = '';
    const encrypted = document.getElementById("encrypted").value;
    const message = {clear: clear, encrypted: encrypted};
    const parameters = get_parameters();
    if (affine_decipher_parameters_are_ok(parameters)) {
        document.getElementById("clear").value = affine_decipher(message, parameters);
    } else {
        document.getElementById("clear").value = "Erreur: les coefficients A et B doivent être entiers et le coefficient A doit être premier avec la taille de l'alphabet. ";
    }
}

function get_parameters() {
    const a = document.getElementById("lead_coef").valueAsNumber;
    const b = document.getElementById("gap_origin").valueAsNumber;
    const alphabet = document.getElementById("alphabet").value;
    return {a: a, b: b, alphabet: alphabet};
}

function affine_cipher_parameters_are_ok(parameters) { // a et b doivent etre entiers sinon renvoit une erreur
    if (Number.isInteger(parameters.a) === false || Number.isInteger(parameters.b) === false) {
        return false;
    }
    return true;
}

function affine_decipher_parameters_are_ok(parameters) { // a et b doivent etre entiers sinon renvoit une erreur
    if (affine_cipher_parameters_are_ok(parameters) === false || Euclide_algo(parameters.a, parameters.alphabet.length) !== 1) {
        return false;
    }
    return true;
}

function affine_cipher(message, parameters){ //x' = ax + b mod(nb-lettres-alphabet), x' le message chiffré, x le message d'origine
    for(let letter_index = 0; letter_index < message.clear.length; letter_index += 1){
        const clear_letter_position = parameters.alphabet.indexOf(message.clear[letter_index]);
        if (clear_letter_position === -1) { // les caracts qui ne sont pas dans l'alphabet sont laissés inchangés
            message.encrypted += message.clear[letter_index];
        } else {
            const crypted_letter_position = mod((parameters.a * clear_letter_position + parameters.b), parameters.alphabet.length); //26 = alphabet.length
            message.encrypted += parameters.alphabet[crypted_letter_position];
        }
    }
    return message.encrypted;
}

function affine_decipher(message, parameters){ //x = (x' - b)a^-1 mod(nb-lettres-alphabet), x' le message chiffré, x le message d'origine
    for(let letter_index = 0; letter_index < message.encrypted.length; letter_index += 1){
        const crypted_letter_position = parameters.alphabet.indexOf(message.encrypted[letter_index]);
        if (crypted_letter_position === -1) { // les caracts qui ne sont pas dans l'alphabet sont laissés inchangés
            message.clear += message.encrypted[letter_index];
        } else {
            const clear_letter_position = mod(((crypted_letter_position - parameters.b) * modulo_inv(parameters.a, parameters.alphabet.length)), parameters.alphabet.length);
            message.clear += parameters.alphabet[clear_letter_position];
        }
    }
    return message.clear;
}



