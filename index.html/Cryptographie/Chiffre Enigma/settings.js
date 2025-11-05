//ce serait bien de ranger tout ca dans une classe

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

//initialisation des paramètres

//choix rotors
document.getElementById("rotor1").value = '0';
document.getElementById("rotor2").value = '1';
document.getElementById("rotor3").value = '2';

// positions des rotors et des rings
const pos_settings = {rotors : [{number : 2, letter : 'C'}, {number : 11, letter : 'L'}, {number : 4, letter : 'E'}],
rings : [{number : 0, letter : 'A'}, {number : 1, letter : 'B'}, {number : 2, letter : 'C'}]};

// id html des rotors et rings
const id_settings = {rotors : [{number : "pos_number_rotor1", letter : "pos_letter_rotor1"}, {number : "pos_number_rotor2", letter : "pos_letter_rotor2"}, {number : "pos_number_rotor3", letter : "pos_letter_rotor3"}],
rings : [{number : "ring_number_rotor1", letter : "ring_letter_rotor1"}, {number : "ring_number_rotor2", letter : "ring_letter_rotor2"}, {number : "ring_number_rotor3", letter : "ring_letter_rotor3"}]};

function init_rotors_rings(){
    ["rotors", "rings"].forEach(type => {
        pos_settings[type].forEach((pos, i) => {
            document.getElementById(id_settings[type][i].number).innerText = pos.number;
            document.getElementById(id_settings[type][i].letter).innerText = pos.letter;
        });
    });
}

init_rotors_rings();

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

// cest la fonction appelée pour update l'affichage et les valeurs internes quand on rotate
function update_rotate(signe, type, num){
    pos_settings[type][num - 1].number = update_number(signe, pos_settings[type][num - 1].number); // pos_number_rotor signe= 1
    document.getElementById(id_settings[type][num - 1].number).innerText = pos_settings[type][num - 1].number; // update l'affichage du nb
    pos_settings[type][num - 1].letter = alphabet[pos_settings[type][num - 1].number]; //update la pos de la lettre
    document.getElementById(id_settings[type][num - 1].letter).innerText = pos_settings[type][num - 1].letter; //update l'affichage de la lettre
    // console.log(pos_settings);
}

minus_button_pos_rotor1.addEventListener('click', () => {
    update_rotate("minus", "rotors", 1);
});
plus_button_pos_rotor1.addEventListener('click', () => {
    update_rotate("plus", "rotors", 1);
});

minus_button_pos_rotor2.addEventListener('click', () => {
    update_rotate("minus", "rotors", 2);
});
plus_button_pos_rotor2.addEventListener('click', () => {
    update_rotate("plus", "rotors", 2);
});

minus_button_pos_rotor3.addEventListener('click', () => {
    update_rotate("minus", "rotors", 3);
});
plus_button_pos_rotor3.addEventListener('click', () => {
    update_rotate("plus", "rotors", 3);
});

minus_button_ring_rotor1.addEventListener('click', () => {
    update_rotate("minus", "rings", 1);
});

plus_button_ring_rotor1.addEventListener('click', () => {
    update_rotate("plus", "rings", 1);
});

minus_button_ring_rotor2.addEventListener('click', () => {
    update_rotate("minus", "rings", 2);
});

plus_button_ring_rotor2.addEventListener('click', () => {
    update_rotate("plus", "rings", 2);
});

minus_button_ring_rotor3.addEventListener('click', () => {
    update_rotate("minus", "rings", 3);
});

plus_button_ring_rotor3.addEventListener('click', () => {
    update_rotate("plus", "rings", 3);
});