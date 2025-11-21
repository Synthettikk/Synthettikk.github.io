class vector{

    constructor(array, direction){
        this.init(array, direction);
    }

    init(array, direction){ // OK
        // verif que array est non vide et que direction est soit row soit column, sinon renvoit un message d'erreur
        this.array = array; // ici array est un tableau non vide de nombres 
        this.dim = array.length;
        this.direction = direction; // on precise si cest un vecteur colonne ou ligne
        return this;
    }

    init_random_vector(k){ // coefs entre -10 et 10
        const random_vector = [];
        for(let i = 0; i < k; i++){
            random_vector.push(Math.random() * 20 - 10);
        }
        return this.init(random_vector, 'row');
    }

    vector_scalar_product(scalar, vect){
        let new_vector = new vector([0], 'row'); // on ecrase pas le vecteur de depart
        const multiplied_array = [];
        for(let i = 0; i < vect.dim; i++){
            multiplied_array.push(scalar * vect.array[i]);
        }
        return new_vector.init(multiplied_array, vect.direction);
    }

    dot_product(lign_vector, column_vector){
        if(lign_vector.dim !== column_vector.dim){
            return 'Erreur: les vecteurs doivent être de même dimension.';
        }
        let scalar = 0;
        for(let i = 0; i < lign_vector.dim; i++){
            scalar += lign_vector.array[i] * column_vector.array[i];
        }
        return scalar;
    }
    
    vector_mod(vector, divisor) {
        let new_vector = [];
        vector.forEach(number => {
            const new_number = mod(number, divisor);
            new_vector.push(new_number);
        });
        return new_vector;
    }

    norm(){
        return Math.sqrt(this.dot_product(this, this));
    }
}

class matrix{

    constructor(array, direction){
        this.init(array, direction);
        
    }

    init(array, direction){
        //this.array = array; // ici array est un tableau non vide de tableaux de même dim non vides de nombres
        this.isMatrix = this.isMatrix_test(array); //verifie si cest vraiment un matrice (chaque vecteur est de meme dim dans la matrice)
        if(this.isMatrix === false) {
            return 'Erreur de dimension, ce n\'est pas une matrice.';
        }
        this.direction = direction; // column or row
        // ici: appelle le constructeur de vecteur pour chaque vect de matrix.array
        this.array = [];
        for(let i = 0; i < array.length; i++){
            let vect = new vector([0], 'row');
            this.array.push(vect.init(array[i], direction));
        }
        this.dim = this.array.length * this.array[0].dim;
        return this;
    }

    init_random_matrix(k, l){ // matrice de dim k x l
        let random_matrix = [];
        for(let i = 0; i < k; i++){
            let random_vector = vector.prototype.init_random_vector(l).array;
            random_matrix.push(random_vector);
        }
        return this.init(random_matrix, 'row');
    }

    isMatrix_test(array){ // verifie si les dimensions du tableau d'entrée peuvent correspondre à une matrice
        if (array.length < 1) return false;
        for(let i = 0; i < array.length; i++){
            if (array[0].length !== array[i].length){
                return false;
            }
        }
        return true;
    }

    matrix_scalar_product(scalar, mat){
        
        let new_matrix = new matrix(mat.array, mat.direction); // on ecrase pas la matrice de depart
        let multiplied_array = [];
        for(let i = 0; i < mat.array.length; i++){
            const multiplied_vector = vector.prototype.vector_scalar_product(scalar, mat.array[i]);
            console.log('mat:', mat, 'multplied_array:', multiplied_array, 'multplied_vector:', multiplied_vector);
            multiplied_array.push(multiplied_vector);
        }
        new_matrix.array = multiplied_array;
        return new_matrix;
    }

    //on suppose que la dim est vérifiée 
    //on suppose que left_matrix est construite par ligne et right_matrix par colonne
    array_product(left_array, right_array){
        //parcours la matrice de droite, le resultat est de la dim de la matrice de droite
        let new_array = [];
        for(let column_number = 0; column_number < right_array.length; column_number++){
            let new_column = [];
            for(let line_number = 0; line_number < right_array[0].length; line_number++){
                //produit scalaire
                new_column.push(dot_product(left_array[line_number], right_array[column_number]));
            }
            new_array.push(new_column);
        }
        return new_array;
    }

    matrix_product(left_matrix, right_matrix){ // MARCHE PAS
        if (left_matrix.dim === 0 || right_matrix.dim === 0){
            return 'Erreur: les matrices doivent être non vides.'
        }
        if(left_matrix.array.length !== right_matrix.array.length) {
            return 'Erreur: le nombre de colonnes de la matrice de gauche doit être égal au nombre de lignes de la matrice de droite.'
        }
        let new_matrix = new matrix([0], 'row'); // pas sûr pour le row: à verifier
        this.matrix_row_to_column(right_matrix);

        let new_array = [];
        for(let column_number = 0; column_number < right_matrix.array.length; column_number++){
            let new_column = [];
            for(let line_number = 0; line_number < right_matrix.array[0].array.length; line_number++){
                //produit scalaire
                new_column.push(dot_product(left_matrix.array[line_number], right_matrix.array[column_number]));
            }
            new_array.push(new_column);
        }
        
        new_matrix.array = new_array;
        return new_matrix; 
    }

    // on va toutes les construire en row donc pas besoin de column to row
    matrix_row_to_column(row_matrix){ // matrice construite par lignes -> matrice construite par colonnes
        if(row_matrix.direction === 'column'){
            return row_matrix;
        }

        let column_matrix = [];
        for(let column = 0; column < row_matrix.array[0].array.length; column++){
            let new_matrix_column = [];
            for(let row = 0; row < row_matrix.array.length; row++){
                new_matrix_column.push(row_matrix.array[row].array[column]);
            }
            column_matrix.push(new_matrix_column);
        }
        row_matrix.array = column_matrix;
        row_matrix.direction = 'column';
        return row_matrix; // desormais, un elem de column_matrix est une colonne de la matrice et pas une ligne
    }

    transpose(){
        if (this.direction === 'column') this.direction = 'row';
        if (this.direction === 'row') this.direction = 'column';
    }

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