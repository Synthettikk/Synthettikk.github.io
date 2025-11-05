// cette classe sert à faire la transition entre le clavier et le clavier d'enigma : 
// bloque le collage, bloque l'inser, bloque la suppr si cest pas le dernier caract, laisse passer que les lettres et la met en maj
// et gere l'espacement tous les 5 caract
class Keyboard {
    constructor() {
        this.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; // lettres acceptées
        this.cipherTextArea = document.getElementById("encrypted");
        this.clearTextArea = document.getElementById("clear");
        this.cipherText = this.cipherTextArea.value;
        this.clearText = this.clearTextArea.value;
        this.bindEvents();
    }

    bindEvents(){
        // bloque le collage
        this.clearTextArea.addEventListener('paste', (e) => {
            e.preventDefault(); 
        });
        // met le curseur à la fin du text 
        const events = ['input', 'focus', 'mousedown', 'click', 'pointerdown'];
        events.forEach((ev) => {
            this.clearTextArea.addEventListener(ev, () => this.moveCaretToEnd());
        });
        const blokedKeysdowns = ['Home', 'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        this.clearTextArea.addEventListener('keydown', (e) => {
            if(blokedKeysdowns.indexOf(e.key) !== -1) {
                e.preventDefault(); 
                this.moveCaretToEnd();
                return;
            }
            this.moveCaretToEnd();
            if(e.key === 'Backspace') {
                this.cipherTextArea.value = this.cipherTextArea.value.slice(0, -1); //supprime le dernier caract
                return;
            }
            // main
            const letter = this.filterCaract(e.key).toUpperCase(); // formate style enigma le caract
            if(letter === ""){
                e.preventDefault();
                return
            }
            this.printClearLetter(letter); // ecrit la filtrée claire
            const ENIGMA = init_enigma_cipher2(); // recup les parametres etc
            const cipherLetter = ENIGMA.encipher(letter); // fait passer la lettre dans la machine et sort une lettre chiffrée
            this.printCipherLetter(cipherLetter); // ecrit la lettre chiffrée
            e.preventDefault(); 
        });
    }

    filterCaract(caract){
        return this.alphabet.indexOf(caract) === -1 ? "" : caract;
    }

    letterMaj(letter){
        return letter.toUpperCase();
    }

    moveCaretToEnd(){
        const len = this.clearTextArea.value.length;
        // force le curseur à la fin (si element est focus)
        this.clearTextArea.setSelectionRange(len, len);
    }

    // supppose que la lettre est filtrée et correspond à une lettre du enigmaKeyboard
    printClearLetter(letter){
        // ajoute un espace toutes les 5 lettres
        if((this.clearTextArea.value.length !== 0 && this.clearTextArea.value.split(' ').join('')).length % 5 === 0 && this.clearTextArea.value[this.clearTextArea.value.length - 1] !== ' ') this.clearTextArea.value += ' ';
        this.clearTextArea.value += letter;
        this.clearText = this.clearTextArea.value;
    }

    printCipherLetter(cipherLetter){
        if((this.cipherTextArea.value.length !== 0 && this.cipherTextArea.value.split(' ').join('')).length % 5 === 0 && this.cipherTextArea.value[this.cipherTextArea.value.length - 1] !== ' ') this.cipherTextArea.value += ' ';
        this.cipherTextArea.value += cipherLetter;
        this.cipherText = this.cipherTextArea.value;
    }
}

const keyboard = new Keyboard();

class EnigmaKeyboard {

    forward(letter) {
        let signal = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(letter);
        return signal;
    }

    backward(signal) {
        let letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[signal];
        return letter;
    }
}


class Plugboard {

    constructor(pairs) { // tableau avec les couples de lettres à echanger
        this.left = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.right = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        pairs.forEach(pair => {
            const letter1 = pair[0];
            const letter2 = pair[1];
            const pos_letter1 = this.left.indexOf(letter1);
            const pos_letter2 = this.left.indexOf(letter2);
            this.left = this.left.slice(0, pos_letter1) + letter2 + this.left.slice(pos_letter1 + 1);
            this.left = this.left.slice(0, pos_letter2) + letter1 + this.left.slice(pos_letter2 + 1);
        });
    }

    forward(signal) { // signal: Plugboard -> Right
        const letter = this.right[signal];
        signal = this.left.indexOf(letter);
        return signal;
    }

    backward(signal) { // signal: Right -> Plugboard
        const letter = this.left[signal];
        signal = this.right.indexOf(letter);
        return signal;
    }
}


class Reflector {

    constructor(wiring) { // wiring = cablage (alphabet mélangé des reflectors)
        this.left = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.right = wiring;
    }

    reflect(signal) {
        const letter = this.right[signal];
        signal = this.left.indexOf(letter);
        return signal;
    }
}


class Rotor {

    constructor(wiring, notch) { // wiring = cablage (alphabet mélangé des rotors), notch = cran (ordre du rotor)
        this.left = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.right = wiring;
        this.notch = notch;
    }

    mod(number, divisor) {
        return ((number % divisor + divisor) % divisor);
    }

    forward(signal) { // signal: Right -> Left (inside one rotor)
        const letter = this.right[signal];
        signal = this.left.indexOf(letter);
        return signal;
    }

    backward(signal) { // signal: Left -> Right
        const letter = this.left[signal];
        signal = this.right.indexOf(letter);
        return signal;
    }

    rotate(n = 1, forward = 1) { // rotation de n crans (1 par defaut) forward = 1; backward = -1
        this.left = this.left.slice(this.mod((forward * n), 26)) + this.left.slice(0, this.mod((forward * n), 26));
        this.right = this.right.slice(this.mod((forward * n), 26)) + this.right.slice(0, this.mod((forward * n), 26));
    }

    rotate_to_letter(letter){ // rotation autour de la lettre choisie
        const n = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(letter);
        this.rotate(n);
    }

    set_ring(n){ 
    // tourne les rotors à l'envers
    this.rotate(n - 1, -1);
    // replace le notch à la meme position
    const n_notch = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(this.notch);
    this.notch = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[this.mod(n_notch - (n - 1), 26)];
    }
}


class Enigma {

    constructor(reflector, rotor1, rotor2, rotor3, plugboard, keyboard) {
        this.reflector = reflector;
        this.rotor1 = rotor1;
        this.rotor2 = rotor2;
        this.rotor3 = rotor3;
        this.plugboard = plugboard;
        this.keyboard = keyboard;
    }

    set_rings(rings) {
        this.rotor1.set_ring(rings[0]);
        this.rotor2.set_ring(rings[1]);
        this.rotor3.set_ring(rings[2]);
    }

    set_key(key) {
        this.rotor1.rotate_to_letter(key[0]);
        this.rotor2.rotate_to_letter(key[1]);
        this.rotor3.rotate_to_letter(key[2]);
    }

    encipher(letter) {

        //rotation des rotors
        if (this.rotor2.left[0] === this.rotor2.notch) { //double stepping
            this.rotor1.rotate();
            update_rotate("plus", "rotors", 1);
            this.rotor2.rotate();
            update_rotate("plus", "rotors", 2);
        }
        else {
            if (this.rotor3.left[0] === this.rotor3.notch) {
                this.rotor2.rotate();
                update_rotate("plus", "rotors", 2);
            }
        }
        this.rotor3.rotate();
        update_rotate("plus", "rotors", 3);

        // il faut deja filtrer le caract pour que ce soit une lettre

        //passage de la lettre dans la machine
        let signal = this.keyboard.forward(letter);
        signal = this.plugboard.forward(signal);
        signal = this.rotor3.forward(signal);
        signal = this.rotor2.forward(signal);
        signal = this.rotor1.forward(signal);
        signal = this.reflector.reflect(signal);
        signal = this.rotor1.backward(signal);
        signal = this.rotor2.backward(signal);
        signal = this.rotor3.backward(signal);
        signal = this.plugboard.backward(signal);
        letter = this.keyboard.backward(signal);

        return letter;
    }
}


//boutons
//const cipher_button = document.getElementById("cipher_button");
//const decipher_button = document.getElementById("decipher_button");

//cipher_button.addEventListener('click', init_enigma_cipher);

function init_enigma_cipher2(){
    // initialisation des rotors et du reflector
    const global_parameters = get_global_parameters();
    const check_parameters = parameters_are_ok(document.getElementById("plugboard").value);
    // on vérifie les parametres
    if (check_parameters.boolean === false){
        document.getElementById("encrypted").value = check_parameters.error_message;
        return;
    }
    const parameters = get_parameters(global_parameters);
    const ENIGMA = new Enigma(parameters.reflector, parameters.rotor1, parameters.rotor2, parameters.rotor3, parameters.plugboard, enigmaKeyboard);
    // choix de la clé (position de départ des rotors)
    ENIGMA.set_key(parameters.key);
    // choix des rings
    ENIGMA.set_rings(parameters.rings);

    // ready to cipher
    return ENIGMA;
}


// keyboard
const enigmaKeyboard = new EnigmaKeyboard();

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
    const ENIGMA = new Enigma(parameters.reflector, parameters.rotor1, parameters.rotor2, parameters.rotor3, parameters.plugboard, enigmaKeyboard);
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
    const key = pos_settings.rotors[0].letter + pos_settings.rotors[1].letter + pos_settings.rotors[2].letter;
    const rings = [pos_settings.rings[0].number + 1, pos_settings.rings[1].number + 1, pos_settings.rings[2].number + 1]
    const pairs = structure_pairs_pb(pb_str);
    const plugb = new Plugboard(pairs);
    const reflector = global_parameters.reflectors[document.getElementById('reflector').value];
    const rotor1 = global_parameters.rotors[document.getElementById("rotor1").value];
    const rotor2 = global_parameters.rotors[document.getElementById("rotor2").value];
    const rotor3 = global_parameters.rotors[document.getElementById("rotor3").value];
    return {plugboard: plugb, key: key, rings: rings, reflector: reflector, rotor1: rotor1, rotor2: rotor2, rotor3: rotor3};
}