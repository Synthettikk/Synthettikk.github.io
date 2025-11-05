////////////////// programmes vecteurs et matrices ///////////////////

function matrix_row_to_column(row_matrix){ // matrice construite par lignes -> matrice construite par colonnes
    let column_matrix = [];
    for(let column = 0; column < row_matrix[0].length; column++){
        let new_matrix_column = [];
        for(let row = 0; row < row_matrix.length; row++){
            new_matrix_column.push(row_matrix[row][column]);
        }
        column_matrix.push(new_matrix_column);
    }
    return column_matrix; // desormais, un elem de column_matrix est une colonne de la matrice et pas une ligne
}

function dot_product(lign_vector, column_vector){
    if(lign_vector.length !== column_vector.length){
        return 'Erreur: les vecteurs doivent être de même dimension.'
    }
    let scalar = 0;
    for(let i = 0; i < lign_vector.length; i++){
        scalar += lign_vector[i] * column_vector[i];
    }
    return scalar;
}

//on suppose que left_matrix est construite par ligne et right_matrix par colonne
function matrix_product(left_matrix, right_matrix){
    //verif la dimension
    //parcours la matrice de droite, le resultat est de la dim de la matrice de droite
    let new_matrix = [];
    for(let column_number = 0; column_number < right_matrix.length; column_number++){
        let new_column = [];
        for(let line_number = 0; line_number < right_matrix[0].length; line_number++){
            //produit scalaire
            new_column.push(dot_product(left_matrix[line_number], right_matrix[column_number]));
        }
        new_matrix.push(new_column);
    }
    return new_matrix;
}

function vector_mod(vector, divisor) {
    let new_vector = [];
    vector.forEach(number => {
        const new_number = mod(number, divisor);
        new_vector.push(new_number);
    });
    return new_vector;
}

function matrix_mod(matrix, divisor){
    matrix.forEach(vector => {
        vector = vector_mod(vector, divisor);
    });
    return matrix;
}

///////////// interface et gestion de la taille des matrices //////////

function addRowandColumn(table){
    //add row matrix
    let newRow = table.insertRow([-1]);
    for(let i = 0; i < table.rows[0].cells.length; i++){ //pour chaque ligne, une matrice a le meme nombre d'elems
        let newCell = newRow.insertCell([-1]);
        newCell.innerHTML = document.getElementById('first_cell').innerHTML; // rajoute le style
    }
    //add column matrix
    for(let row of table.rows){
        let newCell = row.insertCell([-1]); // ajoute une cellule à chaque ligne càd une colonne
        newCell.innerHTML = document.getElementById('first_cell').innerHTML; // rajoute le style
    }
}

function removeRowandColumn(table){
    //remove row
    table.deleteRow([-1]);
    //remove column
    for(let row of table.rows){
        row.deleteCell([-1]);
    }
}

function update_matrix(matrix, PlusOrMinus){
    if (PlusOrMinus === '+'){
        addRowandColumn(matrix);
    }
    if (PlusOrMinus === '-'){
        removeRowandColumn(matrix);
    }
}

//boutons update_matrix
const minus_button_left_matrix = document.getElementById('minus_button_left_matrix');
const plus_button_left_matrix = document.getElementById('plus_button_left_matrix');
const minus_button_right_matrix = document.getElementById('minus_button_right_matrix');
const plus_button_right_matrix = document.getElementById('plus_button_right_matrix');

//updating matrixes
minus_button_left_matrix.addEventListener('click', () => {
    const sign = '-';
    let matrix = document.getElementById('left_matrix_body');
    if(matrix.rows.length > 1){
        update_matrix(matrix, sign);
    }
});

plus_button_left_matrix.addEventListener('click', () => {
    const sign = '+';
    let matrix = document.getElementById('left_matrix_body');
    if(matrix.rows.length < 8){
        update_matrix(matrix, sign);
    }
});

minus_button_right_matrix.addEventListener('click', () => {
    const sign = '-';
    let matrix = document.getElementById('right_matrix_body');
    if(matrix.rows.length > 1){
        update_matrix(matrix, sign);
    }
});

plus_button_right_matrix.addEventListener('click', () => {
    const sign = '+';
    let matrix = document.getElementById('right_matrix_body');
    if(matrix.rows.length < 8){
        update_matrix(matrix, sign);
    }
});

//recupere les valeurs du tableau et les met dans un array js 
function get_matrix_values(tableHTML){
    let matrix_values = [];
    for(let row of tableHTML.rows){
        let row_values = [];
        for(let cell of row.cells){
            row_values.push(cell.children[0].valueAsNumber);
        }
        matrix_values.push(row_values);
    }
    return matrix_values;
}

//
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // on rajoute l'espace et le point
//boutons
const cipher_button = document.getElementById("cipher_button");
const decipher_button = document.getElementById("decipher_button");


cipher_button.addEventListener('click', init_hill_cipher);
decipher_button.addEventListener('click', init_hill_decipher);

// en JS, % ne renvoit pas un modulo
function mod(number, divisor) {
    return ((number % divisor + divisor) % divisor);
}

function init_hill_cipher() {
    const clear = document.getElementById("clear").value;
    let encrypted = '';
    const message = {clear: clear, encrypted: encrypted};
    const parameters = get_parameters();
    if (cipher_or_decipher_parameters_are_ok(parameters.cipher_matrix)) {
        const ciphered = hill_cipher_or_decipher(message.clear, parameters.cipher_matrix);
        document.getElementById("encrypted").value = ciphered;
    } else {
        document.getElementById("encrypted").value = "Erreur: Les coefficients de la matrice A doivent tous être entiers.";
    }
}

function init_hill_decipher() {
    let clear = '';
    const encrypted = document.getElementById("encrypted").value;
    const message = {clear: clear, encrypted: encrypted};
    const parameters = get_parameters();
    if (cipher_or_decipher_parameters_are_ok(parameters.decipher_matrix)) {
        document.getElementById("clear").value = hill_cipher_or_decipher(message.encrypted, parameters.decipher_matrix);
    } else {
        document.getElementById("clear").value = "Erreur: Les coefficients de la matrice A¯¹ doivent tous être entiers.";
    }
}

function get_parameters() {
    const cipher_matrix = get_matrix_values(document.getElementById('left_matrix_body'));
    const decipher_matrix = get_matrix_values(document.getElementById('right_matrix_body'));
    return {cipher_matrix: cipher_matrix, decipher_matrix: decipher_matrix}
}

function cipher_or_decipher_parameters_are_ok(cipher_or_decipher_matrix){ // verifie que chaque coef de la matrice est entier
    // la matrice doit aussi etre carrée
    if(cipher_or_decipher_matrix.length !== cipher_or_decipher_matrix[0].length){
        return false;
    }
    for (let row of cipher_or_decipher_matrix){
        for(let coef of row){
            if(Number.isInteger(coef) === false){
                return false;
            }
        }
    }
    return true;
}

//chiffremznt/dechiffrement
function allowed_characters(message){ // passe tout en maj et remplace les caracteres qui ne sont pas dans l'alphabet par X
    let upperCaseMessage = message.toUpperCase();
    let new_message = '';
    for(let letter_position = 0; letter_position < upperCaseMessage.length; letter_position++){
        if (alphabet.indexOf(upperCaseMessage[letter_position]) === -1) {
            new_message += 'X';
        } else{
            new_message += upperCaseMessage[letter_position];
        }
    }
    return new_message;
}

function split_to_blocs(message, cipher_matrix_length){
    let clear_blocs = [];
    while(message.length >= cipher_matrix_length){
        let bloc = message.slice(0, cipher_matrix_length);
        bloc = letter_to_ascci_bloc(bloc);
        message = message.slice(cipher_matrix_length);
        clear_blocs.push(bloc);
    }
    // on complete le dernier bloc non vide par des X et on l'ajoute au message par blocs
    while(message.length < cipher_matrix_length && message !== ''){
        message += 'X';
    }
    if (message.length > 0) {
        message = letter_to_ascci_bloc(message);
        clear_blocs.push(message);
    }
    return clear_blocs;
}

function letter_to_ascci_bloc(bloc){
    let ascii_bloc = [];
    for(let caract = 0; caract < bloc.length; caract += 1){
        console.log(bloc[caract], alphabet.indexOf(bloc[caract]));
        ascii_caract = alphabet.indexOf(bloc[caract]);
        ascii_bloc.push(ascii_caract);
    }
    return ascii_bloc;
}

function ascii_blocs_to_letter(ascii_blocs){
    let message = '';
    for (i = 0; i < ascii_blocs.length; i++){
        for(j = 0; j < ascii_blocs[i].length; j++) {
            message += alphabet[ascii_blocs[i][j]];            
        }
    }
    return message;
}

function hill_cipher_or_decipher(message, cipher_or_decipher_matrix){
    const n = cipher_or_decipher_matrix.length;
    let new_message = allowed_characters(message);
    let ascii_blocs = split_to_blocs(new_message, n);
    let encrypted_blocs = []; // cest un tableau (on peut le voir comme une matrice) avec des groupes de positions de lettres dans l'alphabet
    // ensuite on fait les produits de matrice à partir de ascii blocs
    for(let i = 0; i < ascii_blocs.length; i++){
        let encrypted_bloc = matrix_product(cipher_or_decipher_matrix, [ascii_blocs[i]]);// une matrice est toujours un tableau de tableau 
        encrypted_bloc = vector_mod(encrypted_bloc[0], alphabet.length); //encrypted_bloc est une matrice avec un seul vecteur colonne..
        encrypted_blocs.push(encrypted_bloc);
    }
    const encrypted_message = ascii_blocs_to_letter(encrypted_blocs);
    return encrypted_message; 
}