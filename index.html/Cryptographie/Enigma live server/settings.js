const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

//initialisation des paramètres

//choix rotors
document.getElementById("rotor1").value = '0';
document.getElementById("rotor2").value = '1';
document.getElementById("rotor3").value = '2';

//position rotors
let pos_number_rotor1 = 2;
document.getElementById("pos_number_rotor1").innerHTML = pos_number_rotor1;
let pos_letter_rotor1 = 'C';
document.getElementById("pos_letter_rotor1").innerHTML = pos_letter_rotor1;

let pos_number_rotor2 = 11;
document.getElementById("pos_number_rotor2").innerHTML = pos_number_rotor2;
let pos_letter_rotor2 = 'L';
document.getElementById("pos_letter_rotor2").innerHTML = pos_letter_rotor2;

let pos_number_rotor3 = 4;
document.getElementById("pos_number_rotor3").innerHTML = pos_number_rotor3;
let pos_letter_rotor3 = 'E';
document.getElementById("pos_letter_rotor3").innerHTML = pos_letter_rotor3;

//position rings
let ring_number_rotor1 = 0;
document.getElementById("ring_number_rotor1").innerHTML = ring_number_rotor1;
let ring_letter_rotor1 = 'A';
document.getElementById("ring_letter_rotor1").innerHTML = ring_letter_rotor1;

let ring_number_rotor2 = 1;
document.getElementById("ring_number_rotor2").innerHTML = ring_number_rotor2;
let ring_letter_rotor2 = 'B';
document.getElementById("ring_letter_rotor2").innerHTML = ring_letter_rotor2;

let ring_number_rotor3 = 2;
document.getElementById("ring_number_rotor3").innerHTML = ring_number_rotor3;
let ring_letter_rotor3 = 'C';
document.getElementById("ring_letter_rotor3").innerHTML = ring_letter_rotor3;


//update position rotors et rings (à la main)

const minus_button_pos_rotor1 = document.getElementById("minus_button_pos_rotor1");
const plus_button_pos_rotor1 = document.getElementById("plus_button_pos_rotor1");

const minus_button_pos_rotor2 = document.getElementById("minus_button_pos_rotor2");
const plus_button_pos_rotor2 = document.getElementById("plus_button_pos_rotor2");

const minus_button_pos_rotor3 = document.getElementById("minus_button_pos_rotor3");
const plus_button_pos_rotor3 = document.getElementById("plus_button_pos_rotor3");


const minus_button_ring_rotor1 = document.getElementById("minus_button_ring_rotor1");
const plus_button_ring_rotor1 = document.getElementById("plus_button_ring_rotor1");

const minus_button_ring_rotor2 = document.getElementById("minus_button_ring_rotor2");
const plus_button_ring_rotor2 = document.getElementById("plus_button_ring_rotor2");

const minus_button_ring_rotor3 = document.getElementById("minus_button_ring_rotor3");
const plus_button_ring_rotor3 = document.getElementById("plus_button_ring_rotor3");

// en JS, % ne renvoit pas un modulo
function mod(number, divisor) {
    return ((number % divisor + divisor) % divisor);
}

function update_number(signe, number){
    if (signe === 'minus'){
        number = mod(number - 1, 26);
    }
    if (signe === 'plus'){
        number = mod(number + 1, 26);
    }
    return number;
}

minus_button_pos_rotor1.addEventListener('click', () => {
    pos_number_rotor1 = update_number("minus", pos_number_rotor1); 
    document.getElementById("pos_number_rotor1").innerHTML = pos_number_rotor1;
    pos_letter_rotor1 = alphabet[pos_number_rotor1];
    document.getElementById("pos_letter_rotor1").innerHTML = pos_letter_rotor1;
});
plus_button_pos_rotor1.addEventListener('click', () => {
    pos_number_rotor1 = update_number("plus", pos_number_rotor1); 
    document.getElementById("pos_number_rotor1").innerHTML = pos_number_rotor1;
    pos_letter_rotor1 = alphabet[pos_number_rotor1];
    document.getElementById("pos_letter_rotor1").innerHTML = pos_letter_rotor1;
});

minus_button_pos_rotor2.addEventListener('click', () => {
    pos_number_rotor2 = update_number("minus", pos_number_rotor2); 
    document.getElementById("pos_number_rotor2").innerHTML = pos_number_rotor2;
    pos_letter_rotor2 = alphabet[pos_number_rotor2];
    document.getElementById("pos_letter_rotor2").innerHTML = pos_letter_rotor2;
});
plus_button_pos_rotor2.addEventListener('click', () => {
    pos_number_rotor2 = update_number("plus", pos_number_rotor2); 
    document.getElementById("pos_number_rotor2").innerHTML = pos_number_rotor2;
    pos_letter_rotor2 = alphabet[pos_number_rotor2];
    document.getElementById("pos_letter_rotor2").innerHTML = pos_letter_rotor2;
});

minus_button_pos_rotor3.addEventListener('click', () => {
    pos_number_rotor3 = update_number("minus", pos_number_rotor3); 
    document.getElementById("pos_number_rotor3").innerHTML = pos_number_rotor3;
    pos_letter_rotor3 = alphabet[pos_number_rotor3];
    document.getElementById("pos_letter_rotor3").innerHTML = pos_letter_rotor3;
});
plus_button_pos_rotor3.addEventListener('click', () => {
    pos_number_rotor3 = update_number("plus", pos_number_rotor3); 
    document.getElementById("pos_number_rotor3").innerHTML = pos_number_rotor3;
    pos_letter_rotor3 = alphabet[pos_number_rotor3];
    document.getElementById("pos_letter_rotor3").innerHTML = pos_letter_rotor3;
});

minus_button_ring_rotor1.addEventListener('click', () => {
    ring_number_rotor1 = update_number("minus", ring_number_rotor1); 
    document.getElementById("ring_number_rotor1").innerHTML = ring_number_rotor1;
    ring_letter_rotor1 = alphabet[ring_number_rotor1];
    document.getElementById("ring_letter_rotor1").innerHTML = ring_letter_rotor1;
});

plus_button_ring_rotor1.addEventListener('click', () => {
    ring_number_rotor1 = update_number("plus", ring_number_rotor1); 
    document.getElementById("ring_number_rotor1").innerHTML = ring_number_rotor1;
    ring_letter_rotor1 = alphabet[ring_number_rotor1];
    document.getElementById("ring_letter_rotor1").innerHTML = ring_letter_rotor1;
});

minus_button_ring_rotor2.addEventListener('click', () => {
    ring_number_rotor2 = update_number("minus", ring_number_rotor2); 
    document.getElementById("ring_number_rotor2").innerHTML = ring_number_rotor2;
    ring_letter_rotor2 = alphabet[ring_number_rotor2];
    document.getElementById("ring_letter_rotor2").innerHTML = ring_letter_rotor2;
});

plus_button_ring_rotor2.addEventListener('click', () => {
    ring_number_rotor2 = update_number("plus", ring_number_rotor2); 
    document.getElementById("ring_number_rotor2").innerHTML = ring_number_rotor2;
    ring_letter_rotor2 = alphabet[ring_number_rotor2];
    document.getElementById("ring_letter_rotor2").innerHTML = ring_letter_rotor2;
});

minus_button_ring_rotor3.addEventListener('click', () => {
    ring_number_rotor3 = update_number("minus", ring_number_rotor3); 
    document.getElementById("ring_number_rotor3").innerHTML = ring_number_rotor3;
    ring_letter_rotor3 = alphabet[ring_number_rotor3];
    document.getElementById("ring_letter_rotor3").innerHTML = ring_letter_rotor3;
});

plus_button_ring_rotor3.addEventListener('click', () => {
    ring_number_rotor3 = update_number("plus", ring_number_rotor3); 
    document.getElementById("ring_number_rotor3").innerHTML = ring_number_rotor3;
    ring_letter_rotor3 = alphabet[ring_number_rotor3];
    document.getElementById("ring_letter_rotor3").innerHTML = ring_letter_rotor3;
});