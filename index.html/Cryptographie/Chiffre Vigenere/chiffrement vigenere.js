//boutons
const cipher_button = document.getElementById("cipher_button");
const decipher_button = document.getElementById("decipher_button");


cipher_button.addEventListener('click', init_vigenere_cipher);
decipher_button.addEventListener('click', init_vigenere_decipher);


// en JS, % ne renvoit pas un modulo
function mod(number, divisor) {
    return ((number % divisor + divisor) % divisor);
}

function init_vigenere_cipher() {
    const clear = document.getElementById("clear").value;
    let encrypted = '';
    const message = {clear: clear, encrypted: encrypted};
    const parameters = get_parameters();
    if (vigenere_cipher_decipher_parameters_are_ok(parameters)) {
        document.getElementById("encrypted").value = vigenere_cipher(message, parameters);
    } else {
        document.getElementById("encrypted").value = "Erreur: Les caractères de la clé doivent tous être dans l'alphabet.";
    }
}

function init_vigenere_decipher() {
    let clear = '';
    const encrypted = document.getElementById("encrypted").value;
    const message = {clear: clear, encrypted: encrypted};
    const parameters = get_parameters();
    if (vigenere_cipher_decipher_parameters_are_ok(parameters)) {
        document.getElementById("clear").value = vigenere_decipher(message, parameters);
    } else {
        document.getElementById("clear").value = "Erreur: Les caractères de la clé doivent tous être dans l'alphabet.";
    }
}

function get_parameters() {
    const alphabet = document.getElementById("alphabet").value;
    const key = document.getElementById("key").value;
    return {alphabet: alphabet, key: key};
}

function vigenere_cipher_decipher_parameters_are_ok(parameters) { // Les caractères de la clé doivent tous être dans l'alphabet sinon renvoit une erreur (ignore les espaces)
    for (let letter_index = 0; letter_index < parameters.key.length; letter_index += 1){
        if (parameters.alphabet.indexOf(parameters.key[letter_index]) === -1 && parameters.key[letter_index] !== ' ') return false;
    }
    parameters.key = parameters.key.replace(/ /g,''); // on vire les espaces sans faire peter d'erreur
    return true;
}

function vigenere_cipher(message, parameters){
    let key_index = 0;
    for (let letter_index = 0; letter_index < message.clear.length; letter_index += 1){
        const clear_letter_position = parameters.alphabet.indexOf(message.clear[letter_index]);
        if (clear_letter_position === -1) { // les caracts qui ne sont pas dans l'alphabet sont laissés inchangés
            message.encrypted += message.clear[letter_index];
        } else {
            const letter_key_position = parameters.alphabet.indexOf(parameters.key[mod(key_index, parameters.key.length)]);
            const crypted_letter_position = mod((clear_letter_position + letter_key_position), parameters.alphabet.length);
            message.encrypted += parameters.alphabet[crypted_letter_position];
            key_index += 1;
        }
    }
    return message.encrypted;
}

function vigenere_decipher(message, parameters){
    let key_index = 0;
    for (let letter_index = 0; letter_index < message.encrypted.length; letter_index += 1){
        const encrypted_letter_position = parameters.alphabet.indexOf(message.encrypted[letter_index]);
        if (encrypted_letter_position === -1) { // les caracts qui ne sont pas dans l'alphabet sont laissés inchangés
            message.clear += message.encrypted[letter_index];
        } else {
            const letter_key_position = parameters.alphabet.indexOf(parameters.key[mod(key_index, parameters.key.length)]);
            const clear_letter_position = mod((encrypted_letter_position - letter_key_position), parameters.alphabet.length);
            message.clear += parameters.alphabet[clear_letter_position];
            key_index += 1;
        }
    }
    return message.clear;
}
