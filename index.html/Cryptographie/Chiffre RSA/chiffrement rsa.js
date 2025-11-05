//boutons
const cipher_button = document.getElementById("cipher_button");
const decipher_button = document.getElementById("decipher_button");


cipher_button.addEventListener('click', init_rsa_cipher);
decipher_button.addEventListener('click', init_rsa_decipher);


// en JS, % ne renvoit pas un modulo
function mod(number, divisor) {
    return ((number % divisor + divisor) % divisor);
}

// assez rapide pour des nombres raisonnables
function mod_pow2(base, exponent, modulo){
    if (modulo === 1n) {return 0n}
    let result = 1n;
    base = base % modulo;
    while(exponent > 0n) {
        if (exponent % 2n === 1n)  //odd number
            result = (result * base) % modulo;
        exponent = exponent >> 1n; //divide by 2
        base = (base * base) % modulo;
    }
    return result;
}

function init_rsa_cipher() {
    const clear = document.getElementById("clear").value;
    let encrypted = '';
    const message = {clear: clear, encrypted: encrypted};
    const parameters = get_parameters();
    if (cipher_parameters_are_ok2(parameters)) {
        document.getElementById("encrypted").value = rsa_cipher(message, parameters);
    } else {
        document.getElementById("encrypted").value = "Erreur: Les paramètres doivent être des nombres entiers positifs et N doit être supérieur à 10.";
    }
}

function init_rsa_decipher() {
    let clear = '';
    const encrypted = document.getElementById("encrypted").value;
    const message = {clear: clear, encrypted: encrypted};
    const parameters = get_parameters();
    if (decipher_parameters_are_ok2(message.encrypted, parameters)) {
        document.getElementById("clear").value = rsa_decipher(message, parameters);
    } else {
        document.getElementById("clear").value = "Erreur: Les paramètres et le message chiffré doivent être des nombres entiers positifs et N doit être supérieur à 10.";
    }
}

function get_parameters() {
    let e = document.getElementById("coef_e").value;
    let n = document.getElementById("coef_n").value;
    let d = document.getElementById("coef_d").value;
    return {e: e, n: n, d: d}
}

function cipher_parameters_are_ok2(parameters){
    // vérifie que e et n sont entiers
    try {
        // en js il faut passer par BigInt au cas où les parametres soient grands (pas bon pour la crypto)
        parameters.e = BigInt(parameters.e);
        parameters.n = BigInt(parameters.n);
    }
    catch {return false}
    // vérifie que n est >= 10 et e >= 1: sinon, le code marche pas
    if(parameters.e < 1 || parameters.n < 10){
        return false;
    }
    return true;
}

function decipher_parameters_are_ok2(encrypted, parameters){
    // vérifie que d et n et encrypted sont entiers
    let encrypted_number;
    try {
        encrypted_number = BigInt(encrypted);
        // en js il faut passer par BigInt au cas où les parametres soient grands
        parameters.d = BigInt(parameters.d);
        parameters.n = BigInt(parameters.n);
    }
    catch {return false}
    // vérifie que n est >= 10, d >= 1 et encrypted_number >= 0: sinon, le code marche pas
    if(parameters.d < 1 || parameters.n < 10 || encrypted_number < 0){
        return false;
    }
    return true;
}


// On chiffre les caracts avec un code ascii < 1000. Les autres sont remplacés par un '?'.
function allowed_characters(message){
    let new_message = '';
    for(let letter_position = 0; letter_position < message.length; letter_position++){
        if(message.charCodeAt(letter_position) < 1000){
            new_message += message[letter_position];
        }
        else{new_message += '?'}
    }
    return new_message;
}

function from_message_to_ascii(new_message, n_length){
    // on commence par faire une chaine de caracts de tous les caracts transformés en leur nb ascii bout à bout
    let ascii_str = '';
    for(let letter_position = 0; letter_position < new_message.length; letter_position++){
        let code = String(new_message.charCodeAt(letter_position));
        while (code.length < 3){ // 1 caract = 3 chiffres
            code = '0' + code;
        }
        ascii_str += code;
    }
    // on découpe la chaine pour que chaque morceau soit plus petit que n (clé publique) et on repasse chaque morceau en nb
    return split(ascii_str, n_length);
}

function split(ascii_str, n_length){ // ("123456789", n = 100) -> [12, 34, 56, 78, 90]
    let ascii_blocs = [];
    // const n_length = String(n).length;
    while(ascii_str.length >= n_length){
        let bloc = ascii_str.slice(0, n_length - 1); // n_length-1 pour etre sûr que le bloc soit < n
        ascii_str = ascii_str.slice(n_length - 1);
        ascii_blocs.push(BigInt(bloc));
    }
    // on complete le dernier bloc non vide par des 0 et on l'ajoute au message par blocs
    while(ascii_str.length < n_length - 1 && ascii_str !== ''){
        ascii_str += '0';
    }
    ascii_blocs.push(BigInt(ascii_str));
    return ascii_blocs;
}

function from_ascii_to_message(ascii_blocs, n_length){
    let message = '';
    let ascii_str = stick(ascii_blocs, n_length, 'decipher');
    while (ascii_str.length >= 3){
        const charcode = parseInt(ascii_str.slice(0, 3));
        ascii_str = ascii_str.slice(3, ascii_str.length);
        if (charcode !== 0) { // enleve les 0 inutiles qui ont servi à remplir
            const carac = String.fromCharCode(charcode);
            message += carac;
        }
    }
    return message;
}

function stick(ascii_blocs, n_length, after_cipher_or_decipher){
    let ascii_str = '';
    let bloc_length;
    if (after_cipher_or_decipher === 'cipher'){ //apres chiffrement les blocs peuvent avoir pris une taille +1 par rapport à celle de départ
        bloc_length = n_length;
    }
    if (after_cipher_or_decipher === 'decipher'){ //taille définie au départ, apres dechiffrement on revient au point  de depart
        bloc_length = n_length - 1;
    }
    for(let bloc = 0; bloc < ascii_blocs.length; bloc += 1){
        let ascii_str_bloc = String(ascii_blocs[bloc]);
        while (ascii_str_bloc.length < bloc_length) {
            ascii_str_bloc = '0' + ascii_str_bloc; // on ajoute un 0 au debut
        }
        ascii_str += ascii_str_bloc; // recolle
    }
    return ascii_str;
}


function rsa_cipher(message, parameters){
    const n_length = String(parameters.n).length;
    const new_message = allowed_characters(message.clear);
    const ascii_blocs = from_message_to_ascii(new_message, n_length);
    let encrypted_blocs = [];
    for (let bloc = 0; bloc < ascii_blocs.length; bloc += 1){
        encrypted_blocs.push(mod_pow2(ascii_blocs[bloc], parameters.e, parameters.n));
    }
    const encrypted_message = stick(encrypted_blocs, n_length, 'cipher');
    return encrypted_message;
}

function rsa_decipher(message, parameters){
    const n_length = String(parameters.n).length;
    let partial_encrypted = message.encrypted;
    let encrypted_blocs = [];
    let ascii_blocs = [];
    while (partial_encrypted.length > 0){ // redécoupe et transforme en blocs de nombres
        const encrypted_bloc = BigInt(partial_encrypted.slice(0, n_length));
        partial_encrypted = partial_encrypted.slice(n_length);
        encrypted_blocs.push(encrypted_bloc);
    }
    for (let bloc = 0; bloc < encrypted_blocs.length; bloc += 1){
        ascii_blocs.push(mod_pow2(encrypted_blocs[bloc], parameters.d, parameters.n));
    }
    const clear_message = from_ascii_to_message(ascii_blocs, n_length);
    return clear_message;
}