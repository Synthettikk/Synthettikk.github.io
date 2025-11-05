//boutons
const cipher_button = document.getElementById("cipher_button");
const decipher_button = document.getElementById("decipher_button");


cipher_button.addEventListener('click', init_el_gamal_cipher);
decipher_button.addEventListener('click', init_el_gamal_decipher);


// en JS, % ne renvoit pas un modulo
function mod(number, divisor) {
    return ((number % divisor + divisor) % divisor);
}

function extended_euclide(a, b){ // a et b bigInts > 0
    let a1 = a;
    let b1 = b;
    let u = 1n;
    let v = 0n;
    let u1 = 0n;
    let v1 = 1n;
    while (b1 !== 0n) {
        let q = a1 / b1;
        let b2 = mod(a1, b1);
        a1 = b1;
        b1 = b2;
        let u2 = u - q * u1;
        u = u1;
        u1 = u2;
        let v2 = v - q * v1;
        v = v1;
        v1 = v2;
    }
    const pgcd = a1;
    return {pgcd: pgcd, u: u, v: v} // pgcd = au + bv
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

function init_el_gamal_cipher() {
    const clear = document.getElementById("clear").value;
    let encrypted = '';
    const message = {clear: clear, encrypted: encrypted};
    const parameters = get_parameters();
    if (cipher_parameters_are_ok(parameters)) {
        const ciphered = el_gamal_cipher(message, parameters);
        document.getElementById("encrypted").value = ciphered.c2;
        document.getElementById("coef_c1").value = ciphered.c1;
    } else {
        document.getElementById("encrypted").value = "Erreur: Les paramètres doivent être des nombres entiers positifs et p doit être supérieur à 10.";
    }
}

function init_el_gamal_decipher() {
    let clear = '';
    const encrypted = document.getElementById("encrypted").value;
    const message = {clear: clear, encrypted: encrypted};
    const parameters = get_parameters();
    if (decipher_parameters_are_ok(message.encrypted, parameters)) {
        document.getElementById("clear").value = el_gamal_decipher(message, parameters);
    } else {
        document.getElementById("clear").value = "Erreur: Les paramètres et le message chiffré doivent être des nombres entiers positifs et p doit être supérieur à 10.";
    }
}

function get_parameters() {
    const p = document.getElementById("coef_p").value;
    const g = document.getElementById("coef_g").value;
    const h = document.getElementById("coef_h").value;
    const y = document.getElementById("coef_y").value;
    const x = document.getElementById("coef_x").value;
    const c1 = document.getElementById("coef_c1").value;
    return {p: p, g: g, h: h, y: y, x: x, c1: c1}
}

function cipher_parameters_are_ok(parameters){
    // vérifie que p, g et h sont entiers
    try {
        // en js il faut passer par BigInt au cas où les parametres soient grands (pas bon pour la crypto)
        parameters.p = BigInt(parameters.p);
        parameters.g = BigInt(parameters.g);
        parameters.h = BigInt(parameters.h);
        parameters.y = BigInt(parameters.y);
    }
    catch {return false}
    // vérifie que p est >= 10 et g, h >= 1: sinon, le code marche pas
    if(parameters.g < 1 || parameters.h < 1 || parameters.p < 10){
        return false;
    }
    return true;
}


function decipher_parameters_are_ok(encrypted, parameters){
    // vérifie que p, x, y, c1 et encrypted sont entiers
    let encrypted_number;
    try {
        encrypted_number = BigInt(encrypted);
        // en js il faut passer par BigInt au cas où les parametres soient grands
        parameters.p = BigInt(parameters.p);
        parameters.x = BigInt(parameters.x);
        parameters.y = BigInt(parameters.y);
        parameters.c1 = BigInt(parameters.c1);
    }
    catch {return false}
    // vérifie que p est >= 10, x, y, c1 >= 1 et encrypted_number >= 0: sinon, le code marche pas
    if(parameters.x < 1 || parameters.y < 1 ||parameters.c1 < 1 || parameters.p < 10 || encrypted_number < 0){
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
    if (after_cipher_or_decipher === 'cipher'){ //apres chiffrement les blocs peuvent avoir pris une taille x2 par rapport à celle de départ
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

function el_gamal_cipher(message, parameters){
    const n_length = String(parameters.p).length;
    const new_message = allowed_characters(message.clear);
    const ascii_blocs = from_message_to_ascii(new_message, n_length);
    let encrypted_blocs = [];
    // nombre y aléatoire entre 1 et p-1
    const shared_secret = mod_pow2(parameters.h, parameters.y, parameters.p);
    const c1 = mod_pow2(parameters.g, parameters.y, parameters.p);
    for (let bloc = 0; bloc < ascii_blocs.length; bloc += 1){
        encrypted_blocs.push(mod(ascii_blocs[bloc] * shared_secret, parameters.p));
    }
    const encrypted_message = stick(encrypted_blocs, n_length, 'cipher');
    return {c1: c1, c2: encrypted_message}
}

function el_gamal_decipher(message, parameters){
    const n_length = String(parameters.p).length;
    let partial_encrypted = message.encrypted;
    let encrypted_blocs = [];
    let ascii_blocs = [];
    while (partial_encrypted.length > 0){ // redécoupe et transforme en blocs de nombres
        const encrypted_bloc = BigInt(partial_encrypted.slice(0, n_length));
        partial_encrypted = partial_encrypted.slice(n_length);
        encrypted_blocs.push(encrypted_bloc);
    }
    // s = c1^x[p] = g^xy [p] = h^y[p] car c1 = g^y[p]
    const shared_secret = mod_pow2(parameters.c1, parameters.x, parameters.p);
    // inverse de shared_secret dans Z/pZ
    const shared_inv = extended_euclide(shared_secret, parameters.p).u; // shared_secret est inv car egal à g^xy avec g generateur de (Z/pZ)* donc g^xy appartient à (Z/pZ)*
    for (let bloc = 0; bloc < encrypted_blocs.length; bloc += 1){
        ascii_blocs.push(mod(encrypted_blocs[bloc] * shared_inv, parameters.p));
    }
    const clear_message = from_ascii_to_message(ascii_blocs, n_length);
    return clear_message;
}
