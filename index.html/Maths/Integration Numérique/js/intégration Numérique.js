//besoin de mathjs
//katex est probablement mieux, ici, que mathjax, a voir..
//transforme une ecriture latex en une expression mathjs
//on commence par verifier l'entrée: on bloque les caracteres speciaux

//il faut construire les abscisses: dependra de ce qu'on veut faire

// TOUT EST DEFINI DANS L ORDRE DU HTML on changera surement apres

/////////////////////////////////////////////////// DEFINITION DU HTML /////////////////////////////////////////////////////

const etitable_math_field = document.getElementsByTagName("textarea")[0]; // il a pas d'id mais cest un textarea (le seul)

const button_square = document.getElementById('square');
button_square.addEventListener( "click", () => {
    mathField.typedText('^2');
    etitable_math_field.focus();
});
const button_sqrt = document.getElementById('sqrt');
button_sqrt.addEventListener( "click", () => {
    mathField.typedText('√');
    etitable_math_field.focus();
});
const button_abs = document.getElementById('abs');
button_abs.addEventListener("click", () => {
    mathField.typedText('|'); // je sais pas encore ce qu'il faut mettre comme syntax de la valeur abs
    etitable_math_field.focus();
});
// const button_frac = document.getElementById('frac');
// button_frac.addEventListener( "click", () => {
//     mathField.typedText('/'); 
//     etitable_math_field.focus();
// });
const button_ln = document.getElementById('ln');
button_ln.addEventListener( "click", () => {
    mathField.typedText('ln(');
    etitable_math_field.focus();
});
const button_exp = document.getElementById('exp');
button_exp.addEventListener( "click", () => {
    mathField.typedText('e^');
    etitable_math_field.focus();
});
// const button_pow = document.getElementById('pow');
// button_pow.addEventListener( "click", () => {
//     mathField.typedText('^');
//     etitable_math_field.focus();
// });
const button_pi = document.getElementById('pi');
button_pi.addEventListener( "click", () => {
    mathField.typedText('π');
    etitable_math_field.focus();
});
const button_e = document.getElementById('e');
button_e.addEventListener( "click", () => {
    mathField.typedText('e');
    etitable_math_field.focus();
});
const button_sin = document.getElementById('sin');
button_sin.addEventListener( "click", () => {
    mathField.typedText('sin(');
    etitable_math_field.focus();
});
const button_cos = document.getElementById('cos');
button_cos.addEventListener( "click", () => {
    mathField.typedText('cos(');
    etitable_math_field.focus();
});
const button_tan = document.getElementById('tan');
button_tan.addEventListener( "click", () => {
    mathField.typedText('tan(');
    etitable_math_field.focus();
});
const button_arcsin = document.getElementById('arcsin');
button_arcsin.addEventListener( "click", () => {
    mathField.typedText('arcsin(');
    etitable_math_field.focus();
});
const button_arccos = document.getElementById('arccos');
button_arccos.addEventListener( "click", () => {
    mathField.typedText('arccos(');
    etitable_math_field.focus();
});
const button_arctan = document.getElementById('arctan');
button_arctan.addEventListener( "click", () => {
    mathField.typedText('arctan(');
    etitable_math_field.focus();
});
const button_sinh = document.getElementById('sinh');
button_sinh.addEventListener( "click", () => {
    mathField.typedText('sinh(');
    etitable_math_field.focus();
});
const button_cosh = document.getElementById('cosh');
button_cosh.addEventListener( "click", () => {
    mathField.typedText('cosh(');
    etitable_math_field.focus();
});
const button_tanh = document.getElementById('tanh');
button_tanh.addEventListener( "click", () => {
    mathField.typedText('tanh(');
    etitable_math_field.focus();
});



const button_exec_script = document.getElementById('exec_script');
const latex_field = document.getElementById('latex');
const result = document.getElementById('result');

button_exec_script.addEventListener("click", () =>{
    const latex_expression = latex_field.innerText;
    //let variable_value = document.getElementById('variable_value').valueAsNumber;
    //result.innerText = okokletsgo(latex_expression, [{x: variable_value}])[0]; //crochet 0 car normalement la fonction est faire pour renvoyer un tableau de valeurs
    const mathjs_expression = fromLatexToMathjs(latex_expression);
    console.log(latex_expression, mathjs_expression);
    init_graph(mathjs_expression);
});

/////////////////////////////////////////////////// GESTION DE LA SYNTAXE LATEX VERS MATHJS /////////////////////////////////////////////////////

let latex_expression;
let mathjs_expression;
let variables;

function addSpacesAroundLetters(inputString) {
    return inputString.replace(/([a-zA-Z])/g, ' $1 ');
}

function findFirstOccurrence(mainString, substrings) {
    // Utiliser reduce pour trouver la première occurrence
    const result = substrings.reduce((acc, substring) => {
        const index = mainString.indexOf(substring);
        // Si l'index est trouvé et est plus petit que l'index actuel, on met à jour
        if (index !== -1 && (acc.beforeIndex === -1 || index < acc.beforeIndex)) {
            return {beforeIndex: index, afterIndex: index + substring.length, fct: substring};
        }
        return acc;
    }, {beforeIndex: -1, afterIndex: -1, fct: ''});

    return result;
}

function fracRec(LaTeX_expression){
    
    //recherche la premiere position de frac dans latex_expression

    let position = LaTeX_expression.indexOf('frac');
    if (position === -1){
        return LaTeX_expression;
    }
    //à chaque fois qu'on a un frac, il va aller chercher le numérateur et le dénominateur et rajouter un / entre les 2 et des parentheses autour: 
    
    let index_to_check = position + 5; //on commence à +5 au lieu de +0 car frac a lui meme une taille de 4 et compteur doit etre différent de 0 donc on l'init à 1 et on compte pas le premier '{'.
    let new_LaTeX_expression = LaTeX_expression.slice(0, position + 5) + "("; // ce qu'on veut renvoyer
    let counter = 1;
    while(counter !== 0) { //numérateur
        if(LaTeX_expression[index_to_check] === '{'){
            counter += 1;
        }
        if(LaTeX_expression[index_to_check] === '}'){
            counter -= 1;
        }
        new_LaTeX_expression += LaTeX_expression[index_to_check];
        index_to_check += 1; //passe au carac d'apres
    }
    
    //ajoute un / à la position index_to_check
    new_LaTeX_expression += "/";
    index_to_check += 1;
    counter = 1;
    new_LaTeX_expression += "(";
    while(counter !== 0) {  //dénominateur
        if(LaTeX_expression[index_to_check] === '{'){
            counter += 1;
        }
        if(LaTeX_expression[index_to_check] === '}'){
            counter -= 1;
        }
        new_LaTeX_expression += LaTeX_expression[index_to_check];
        index_to_check += 1; //passe au carac d'apres
    }
    new_LaTeX_expression += ")";

    new_LaTeX_expression += LaTeX_expression.slice(index_to_check);
    //il faut maintenant enlever le frac qu'on avait trouvé
    new_LaTeX_expression = new_LaTeX_expression.replace('frac', '');
    //recurrence sur les frac:
    return fracRec(new_LaTeX_expression);
}


function fromLatexToMathjs(LaTeX_expression){
    
    //console.log(LaTeX_expression);
    //voir si ya d'autres fonctions à coder: il y a les constantes: pi e etc
    let mathjs_expression = LaTeX_expression.replaceAll(' ', '');
    // mathjs_expression = mathjs_expression.replaceAll('\a', 'a'); //pas sur qu'il soit utile
    // mathjs_expression = mathjs_expression.replaceAll('\b', 'b');
    // mathjs_expression = mathjs_expression.replaceAll('\c', 'c'); //idem
    // mathjs_expression = mathjs_expression.replaceAll('\r', 'r');
    // mathjs_expression = mathjs_expression.replaceAll('\n', 'n');
    // mathjs_expression = mathjs_expression.replaceAll('\t', 't');
    // mathjs_expression = mathjs_expression.replaceAll('\f', 'f');
    // mathjs_expression = mathjs_expression.replaceAll('\v', 'v');
    // mathjs_expression = mathjs_expression.replaceAll('\(', '('); //idem
    // mathjs_expression = mathjs_expression.replaceAll('\)', ')'); //idem
    mathjs_expression = mathjs_expression.replaceAll('\\', ' ');

    mathjs_expression = mathjs_expression.replaceAll('cdot', '*');

    //valeur abs: |x| = sqrt(x^2)
    mathjs_expression = mathjs_expression.replaceAll('left|', 'sqrt((');
    mathjs_expression = mathjs_expression.replaceAll('right|', ')^2)');

    //fractions
    mathjs_expression = fracRec(mathjs_expression);

    mathjs_expression = mathjs_expression.replaceAll('ln', 'log'); //ln existe en latex mais pas sur mathjs, on code que le log en base e (ln), les autres marchent pas
    mathjs_expression = mathjs_expression.replaceAll('arcsin', 'asin'); //idem
    mathjs_expression = mathjs_expression.replaceAll('arccos', 'acos'); //idem
    mathjs_expression = mathjs_expression.replaceAll('arctan', 'atan'); //idem
    //Notons qu'on code pas les fonctions réciproques des fonctions trigo hyperboliques, elles ne sont pas dans latex natif enfait. Notons qu'on peut les exprimer en fonction d'un log...
    //Pareil pour cotan qui est 1/tan sauf quand tan = 0
    mathjs_expression = mathjs_expression.replaceAll('left', '');
    mathjs_expression = mathjs_expression.replaceAll('right', '');
    mathjs_expression = mathjs_expression.replaceAll('{', '(');
    mathjs_expression = mathjs_expression.replaceAll('}', ')');

    //rajoute des espaces pour la multiplication implicite
    mathjs_expression = spaceManage(mathjs_expression);
    
    return mathjs_expression;
}


// Fonction pour extraire les variables de mathjs_expression
function getVariables(expression) {
    // Analyser l'expression
    const node = math.parse(expression);
    
    // Fonction pour extraire les variables
    const variables = new Set();

    // Fonction récursive pour parcourir les nœuds
    function traverse(node) {
        if (node.isSymbolNode) {
            variables.add(node.name);
        } else if (node.isOperatorNode) {
            node.args.forEach(traverse);
        } else if (node.isFunctionNode) {
            node.args.forEach(traverse);
        } else if (node.isParenthesisNode) {
            traverse(node.content); // Parcours le contenu des parenthèses
        }
    }

    traverse(node);
    
    // Convertir le Set en tableau et le retourner
    return Array.from(variables);
}

// transforme l'expression latex pour la rendre utilisable par mathjs
// et repere les variables
function init_expression() {
    latex_expression = latex_field.innerText;
    mathjs_expression = fromLatexToMathjs(latex_expression);
    variables = getVariables(mathjs_expression);
    return variables;
}


function okokletsgo(LaTeX_expression, table_variables){ // prend une expression (fonction) LaTeX et des abscisses en entrée et sort les valeurs de la fonction pour ces abscisses
    //on commence par verifier l'entrée: on bloque les caracteres speciaux
    //const forbidden_characs = '&é#|è`_çà@$¤£µù§?rwf' je sais pas quels caracteres bloquer
    //transforme une ecriture latex en une expression mathjs
    const mathjs_expression = fromLatexToMathjs(LaTeX_expression);
    const table_values = []; // y_table
    const f = math.compile(mathjs_expression); // prend une expression mathématique sous forme de chaîne de caractères (mathjs) et la compile en une fonction exécutable
    for(let i = 0; i < table_variables.length; i++){
        const fox = f.evaluate(table_variables[i]); //prend en entrée une expression mathématique (que mathjs peut interpreter) et un vecteur de R^n puis renvoit la valeur de la fonction une fois evaluée
        table_values.push(fox);
    }
    return table_values;
}

// rajoute des espaces là où il faut
function spaceManage(mathjs_expression){ 

    // init
    const functions = ["sin", "cos", "tan", "asin", "acos", "atan", "sec", "csc", "cot",
        "sinh", "cosh", "tanh", "asinh", "acosh", "atanh", "exp", "log", "pow", "sqrt", "abs"];

    // index où se trouve la premiere occurrence d'un des elems de functions dans mathjs_expression
    // index du premier caractere apres la premiere occurrence d'un des elems de functions dans mathjs_expression
    const indexs = {beforeIndex: 0, afterIndex: 0};
    //const indexsAfter = {leftIndex: 0, rightIndex: 0};

    let fct; // fonction trouvée par findFirstOccurrence
    let partialExpr = mathjs_expression; // expression partielle qui commence apres la derniere fct trouvée
    let result = '';

    // boucle qui trouve de gauche à droite les fct, ajoute avec des parentheses ce qu'il y
    // avait avant et recommence avec l'expr slicée
    while(indexs.beforeIndex !== -1){
        // trouve la premiere occurrence et renvoie la fct qui est la 1ere occurrence et sa position
        const firstFct = findFirstOccurrence(partialExpr, functions);

        // update les valeurs initiales
        indexs.afterIndex = firstFct.afterIndex;
        indexs.beforeIndex = firstFct.beforeIndex;
        fct = firstFct.fct;

        // ajoute des espaces autour des lettres se situant avant beforeIndex et ajoute la fct non modifiée
        result += addSpacesAroundLetters(partialExpr.slice(0, indexs.beforeIndex)) + fct;

        //update la str pour enlever ce qui a deja été pris en compte
        partialExpr = partialExpr.slice(indexs.afterIndex);
    }
    
    result += addSpacesAroundLetters(partialExpr.slice(indexs.afterIndex));

    return result.trim();
}


/////////////////////////////////////////////////// GRAPHE /////////////////////////////////////////////////////

// ON UTILISE LES VARIABLES UNITE MATHS POUR CONNAITRE 
// LES ABSCISSES ET LES ORDONNEES DE NOTRE FONCTION
// SUR UN INTERVALLE DONNE QUI DEPEND DU ZOOM ET DES OFFSET
// ET ON VERIFIE UNE PSEUDO CONTINUITE (pas mathématique mais visuelle)
// LES X LES Y ET LA CONTINUITE DONNENT LES 3 INFOS DU TABLEAU FINAL 
// POUR ENSUITE TRACER LA COURBE
// ON UTILISE LES VARIABLES UNITE CANVAS POUR DESSINER
// ET LES UNITES MATHS POUR LES CALCULS

const canvas = document.getElementById("canvas");
const canvas_width_over2 = canvas.width / 2; //on le calcul une seule fois ici: on aura besoin de lui bcp de fois
const canvas_height_over2 = canvas.height / 2; //idem
const ctx = canvas.getContext("2d");



let f_str;
let f_prime_str; //dérivée de f sous forme str
let zoom; //sans unité
let zoom_count; //sans unité
let x_offset_math; //unité maths
let y_offset_math; //unité maths
let offsets; //offset unité canvas
let precision_fct; // 1/(nb_subdivs/20) (en x) /20 à car zoom init = 2 et taille intervalle init = 10; 2*10...
let f;
let f_prime; //dérivée de f
let x_inf; //unité maths
let x_sup; //unité maths
let x_borne;
// les bornes données pour le graph: initialisées égales à x_inf et x_sup
let x_inf_graph;
let x_sup_graph;
let x_borne_graph;

let x_gap; //unité maths; distance entre x0 et x1
let x_tab; //unité maths, x € [-10, 10], le gap est hardcodé...
let y_tab; //unité maths
let final_tab = [];
let partial_tab = [];

let offseting = false;
let X_old;
let Y_old;

const concatenation = [(tab0, tab1) => {return (tab0.concat(tab1)).slice(0, final_tab.math_tab.length)}, (tab0, tab1) => {return (tab1.concat(tab0)).slice(-final_tab.math_tab.length)}];



canvas.addEventListener("mousedown", (e) => {
    X_old = e.offsetX; //coordonnée x en pixels
    Y_old = e.offsetY; //coordonnée y en pixels
    offseting = true;
    canvas.style.cursor = "move";
});

//faut faire l'opti pour recalculer que le nécessaire
canvas.addEventListener("mousemove", (e) => {
    if(offseting){
        // offset du graphe
        offsetting(e);
        // offset de l'intégration
        if(integration_methods_args.draw && calc_integration_result.y_table_integration.length !== 0){
            integration_methods_args.draw_method();
        }
    }
    
});


canvas.addEventListener("mouseup", (e) => {
    if(offseting){
        // offset du graphe
        offsetting(e);
        // offset de l'intégration
        if(integration_methods_args.draw && calc_integration_result.y_table_integration.length !== 0){
            integration_methods_args.draw_method();
        }
        offseting = false;
        canvas.style.cursor = "auto";
    }
});


canvas.addEventListener("mouseout", (e) => {
    offseting = false;
    canvas.style.cursor = "auto";
});


//zoom: il faudrait rajouter un zoom min et max
canvas.addEventListener("wheel", (e) => {
    // zoom et raffiche le graphe
    zooming(e);
    // zoom et raffiche l'intégration
    if(integration_methods_args.draw && calc_integration_result.y_table_integration.length !== 0){
        integration_methods_args.draw_method();
    }
});




function canvasToMathCoords(X, Y, x_offset_math, y_offset_math, zoom){ //X, Y unité canvas, les offset en unité maths
    //avec les offset à 0, X = 300, Y = 300: on est en (0, 0)
    // +offset x => decale tout à droite (unité maths)
    // +offset y => decale tout vers le haut (unité maths)
    // +zoom => multiplie les valeurs X et Y de la courbe

    // let x = X - canvas.width / 2 //recentre en x
    // let y = canvas.height / 2 - Y; //recentre en Y
    // x = x / 30; // fais passer l'intervalle des x de -300;300 à -10;10: ce sera celui par défaut: avec zoom = 1, les offsets à 0
    // y = y / 30; // fais passer l'intervalle des x de -300;300 à -10;10: idem; 30 est arbitraire, sera amené à etre changé
    // x = x / zoom; // applique le zoom: 1: change rien, < 1 dezoom, > 1 zoom
    // y = y / zoom; // applique le zoom: idem
    // x = x + x_offset_math; // applique l'offset: indépendant du zoom
    // y = y + y_offset_math;
    //return {x: x, y: y};
    return {x: canvasToMathCoordsX(X, x_offset_math, zoom), y: canvasToMathCoordsY(Y, y_offset_math, zoom)};
}

function canvasToMathCoordsX(X, x_offset_math, zoom){ //X unité canvas, offset en unité maths
    //voir fct canvasToMathCoords pour les explications
    return ((X - canvas_width_over2) / 30) / zoom + x_offset_math;
}

function canvasToMathCoordsY(Y, y_offset_math, zoom){ //Y unité canvas, offset en unité maths
    //voir fct canvasToMathCoords pour les explications
    return ((canvas_height_over2 - Y) / 30) / zoom + y_offset_math;
}

function ceilToPowerOf10(x){
    const pow = Math.ceil(Math.log10(x));
    return pow < 0 ? 1 : Math.pow(10, pow);
}

function clamp(value, min, max){
    return Math.min(Math.max(value, min), max);
}


function complete_continuous_tab2(continuous_tab, canvas_tab){ // repère les pts de rupture dans la continuité et rajoute des points de précision
    // INIT
    // on étend un peu la largeur de x_tab et y_tab pour initialiser une valeur de continuité

    const new_continuous_tab = [];
    const new_canvas_tab = [];

    // à gauche
    const x_left = continuous_tab[0].x - x_gap;
    const y_left = f.evaluate({x: x_left});

    //new_continuous_tab.push({x: x_left, y: y_left, cont_to_next: continuous_y_gaps2(x_left, continuous_tab[0].x, y_left, continuous_tab[0].y)});
    //new_canvas_tab.push({x: mathToCanvasCoordsX(x_left, x_offset_math, zoom), y: mathToCanvasCoordsY(y_left, y_offset_math, zoom), cont_to_next: new_continuous_tab[0].cont_to_next});

    // à droite
    const x_right = continuous_tab[continuous_tab.length - 1].x + x_gap;
    const y_right = f.evaluate({x: x_right});


    //let cont_to_next_before = new_continuous_tab[0].cont_to_next;
    //let cont_to_next_before = is_pseudo_continuous2(x_left, continuous_tab[0].x, y_left, continuous_tab[0].y, mathToCanvasCoordsY(y_left, y_offset_math, zoom), canvas_tab[0].y);
    let cont_to_next_before = false;
    let cont_to_next;

    // PARCOURS LE TAB ET VERIFIE SI cont_to_next_before EST IDENTIQUE A cont_to_next
    for(let i = 0; i < continuous_tab.length; i++){
        cont_to_next = continuous_tab[i].cont_to_next;
        if(cont_to_next !== cont_to_next_before){ // changement dans la continuité
            //console.log(i, continuous_tab[i - 1], continuous_tab[i]);
            //const direction = +continuous_tab[i - 1].cont_to_next - +continuous_tab[i].cont_to_next; //-1 = gauche; +1 = droite
            const direction = +cont_to_next_before - +cont_to_next; //-1 = gauche; +1 = droite

            const precise_point = find_discont_point(continuous_tab[i], direction, 0.0000000000001 / zoom, x_gap);
            //console.log(precise_point);
            continuous_tab[i] = precise_point;
            canvas_tab[i] = mathToCanvasCoords(precise_point.x, precise_point.y, x_offset_math, y_offset_math, zoom);
        }
        new_continuous_tab.push(continuous_tab[i]);
        new_canvas_tab.push({x: canvas_tab[i].x, y: canvas_tab[i].y, cont_to_next: continuous_tab[i].cont_to_next});
        cont_to_next_before = cont_to_next;
    }

    new_continuous_tab[new_continuous_tab.length - 1].cont_to_next = is_pseudo_continuous2(new_continuous_tab[new_continuous_tab.length - 1].x, x_right, new_continuous_tab[new_continuous_tab.length - 1].y, y_right);
    new_canvas_tab[new_canvas_tab.length - 1].cont_to_next = new_continuous_tab[new_continuous_tab.length - 1].cont_to_next;

    return {math_tab: new_continuous_tab, canvas_tab: new_canvas_tab};
}


function continuous_y_gaps2(x0, x1, y0, y1){ // verifie la regularité d'une fct entre 2 pts, gap = abs(y1 - y0)/2
    const gap = Math.abs(y0 - y1);
    const x05 = x0 + (x1 - x0) / 2; //x_(1/2)
    const y05 = f.evaluate({x: x05});
    //verifie si la distance (math) entre y0 et y_(1/2) est plus grand que entre y0 et y1
    return Math.abs(y0 - y05) < gap && Math.abs(y05 - y1) < gap;
}

// discrétise l'intervalle [min, max] en N = nb_subdivs_x valeurs de x
function divide_range(min, max, gap){ 
    const nb_subdivs_x = Math.round((max - min) / gap) + 1;
    const x_table2 = new Array(nb_subdivs_x); //on le fait en statique
    for(let i = 0; i < nb_subdivs_x; i++){
        x_table2[i] = min + i * gap;
    }
    return x_table2;
}

//entre x0 et x1 on a repéré un point de discontinuité (on sait pas exactement où): le but est de le situer entre 2 points distants au maximum de la precision demandée
function find_discont_point(continuous_tab_0, direction, precision, gap){ 
    //console.log('x0:', continuous_tab_0, 'x1:', continuous_tab_1, 'x2:', continuous_tab_2);
    if(gap < precision){ // le pt de discontinuité est localisé assez précisément: entre x0 et x1
        return continuous_tab_0;
    }
    //console.log(continuous_tab_0);
    // regarde si la continuité est à gauche ou à droite

    gap = gap / 2;
    const x05 = continuous_tab_0.x + gap * direction;
    //console.log(x05, gap, direction);
    const y05 = f.evaluate({x: x05});

    //si la discontinuité est entre x0 et x05, on recommence la recherche entre ces 2 points
    if(is_pseudo_continuous(continuous_tab_0.x, x05, continuous_tab_0.y, y05)){
        //console.log('ye', x05, y05);
        return find_discont_point({x: x05, y: y05, cont_to_next: continuous_tab_0.cont_to_next}, direction, precision, gap);
    }

    //console.log('no', gap, x05, y05);
    return find_discont_point(continuous_tab_0, direction, precision, gap); 
    //return find_discont_point(cont_to_next_before, x05, x1, y05, y1, precision); //si la discontinuité n'est pas entre x0 et x05, elle est entre x05 et x1
}


//renvoie le multiple de gap le plus proche du nombre en entrée
function gap_round(float, gap){
    const quotient = Math.round(float / gap);
    return gap * quotient;
}


//calcule les bornes en x entre lesquelles on recalcule les valeurs pour l'affichage de f(x)
function get_bornes(){
    //x_inf = canvasToMathCoordsX(0, x_offset_math, zoom); //unité maths
    //x_sup = canvasToMathCoordsX(canvas.width, x_offset_math, zoom); //unité maths
    let partial_x_inf; //partial = une partie du tab
    let partial_x_sup;
    let side; // gauche ou droite
    x_gap = precision_fct / zoom;
    if(x_inf < final_tab.math_tab[0].x){ // décalage vers la gauche
        side = 0; // gauche
        //console.log('gauche');
        partial_x_inf = +x_inf;
        partial_x_sup = +final_tab.math_tab[0].x;
    } else{ // décalage vers la droite
        side = 1; // droite
        //console.log('droite');
        partial_x_inf = +final_tab.math_tab[final_tab.math_tab.length - 1].x + x_gap; // + x_gap pour pas que la derniere valeur se retrouve aussi comme la premiere du partial_tab
        partial_x_sup = +x_sup;
    }
    const partial_x_borne = {side: side, inf: partial_x_inf, sup: partial_x_sup};
    //console.log(partial_x_borne);
    return partial_x_borne;
}


function get_canvas_coords(x_table, y_table){
    const canvas_tab = new Array(x_table.length);
    for(let i = 0; i < x_table.length; i++){
        const canvas_coord = mathToCanvasCoords(x_table[i], y_table[i], x_offset_math, y_offset_math, zoom);
        canvas_tab[i] = canvas_coord;
    }
    return canvas_tab;
}


function get_continuous_tab(x_table, y_table, canvas_tab){
    const continuous_tab = [];
    for(let i = 0; i < x_table.length - 1; i++){
        const continuous_to_next_x = is_pseudo_continuous2(x_table[i], x_table[i + 1], y_table[i], y_table[i + 1], canvas_tab[i].y, canvas_tab[i + 1].y);
        continuous_tab.push({x: x_table[i], y: y_table[i], cont_to_next: continuous_to_next_x});
    }
    return continuous_tab;
}


function get_final_canvas_tab(final_math_tab){
    const final_canvas_tab = new Array(final_math_tab.length);
    for(let i = 0; i < final_canvas_tab.length; i++){
        const canvas_coords = mathToCanvasCoords(final_math_tab[i].x, final_math_tab[i].y, x_offset_math, y_offset_math, zoom);
        final_canvas_tab[i] = {...canvas_coords, cont_to_next: final_math_tab[i].cont_to_next};
    }
    return final_canvas_tab;
}


// tableau permettant enfin l'affichage
function get_final_tab(x_inf, x_sup){ 
    //x_inf = canvasToMathCoordsX(0, x_offset_math, zoom); //unité maths
    //x_sup = canvasToMathCoordsX(canvas.width, x_offset_math, zoom); //unité maths
    const x_borne_partial = {inf: x_inf, sup: x_sup};
    x_gap = precision_fct / zoom;
    const x_table = get_x_table(x_borne_partial, x_gap);
    const y_table = get_y_table(f, x_table);
    const canvas_tab = get_canvas_coords(x_table, y_table); // besoin de lui pour la vérif de continuité
    const continuous_tab = get_continuous_tab(x_table, y_table, canvas_tab);
    const new_continuous_tab = complete_continuous_tab2(continuous_tab, canvas_tab);
    //final_tab = new_continuous_tab;
    return new_continuous_tab;
}


function get_x_table(x_borne, gap){
    //bornes deviennent un multiple de gap: permet de discrétiser les valeurs possibles de x
    const x_inf_gap = gap_round(x_borne.inf, x_gap);
    const x_sup_gap = gap_round(x_borne.sup, x_gap);

    const nb_subdivs_x = Math.round((x_sup_gap - x_inf_gap) / gap) + 1;
    const x_table2 = new Array(nb_subdivs_x); //on le fait en statique
    for(let i = 0; i < nb_subdivs_x; i++){
        x_table2[i] = x_inf_gap + i * gap;
    }
    return x_table2;
}


function get_y_table(math_function, x_table){ //mathfunction doit deja etre compilé dans mathjs
    const y_table2 = new Array(x_table.length);
    for(let i = 0; i < x_table.length; i++){
        y_table2[i] = math_function.evaluate({x:x_table[i]}); // attention la variable est hardcodée comme étant x
    }
    return y_table2;
}


function init_graph(f_str){ //f_str est sous la forme d'une expression mathjs (utilisable par mathjs)
    zoom = 2; //sans unité
    zoom_count = 0; //sans unité
    x_offset_math = 0; //unité maths
    y_offset_math = 0; //unité maths
    offsets = mathToCanvasCoords(x_offset_math, y_offset_math, 0, 0, zoom); //offset unité canvas
    precision_fct = 0.01; // 1/(nb_subdivs/20) (en x) /20 à car zoom init = 2 et taille intervalle init = 10; 2*10...

    f = math.compile(f_str);
    //f_prime = math.derivative(f_str, 'x');
    x_inf = canvasToMathCoordsX(0, x_offset_math, zoom); //unité maths
    x_sup = canvasToMathCoordsX(canvas.width, x_offset_math, zoom); //unité maths
    x_borne = {inf: x_inf, sup: x_sup};
    // les bornes données pour le graph: initialisées égales à x_inf et x_sup
    x_inf_graph = canvasToMathCoordsX(0, x_offset_math, zoom);
    x_sup_graph = canvasToMathCoordsX(canvas.width, x_offset_math, zoom);
    x_borne_graph = {inf: x_inf_graph, sup: x_sup_graph};
    final_tab = get_final_tab(x_inf, x_sup);
    // let x_tab = get_x_table(x_borne, precision_fct / zoom); //unité maths, x € [-10, 10], le gap est hardcodé...
    // let y_tab = get_y_table(f, x_tab); //unité maths
    // tracing_grid();
    // tracing_curve(x_tab, y_tab); //coords maths: un coup cest canvas, un coup maths, on va nettoyer    
    tracing_graph2();
}


function is_pseudo_continuous(x0, x1, y0, y1){
    const canvasCoords_left = mathToCanvasCoordsY(y0, y_offset_math, zoom);
    const canvasCoords_right = mathToCanvasCoordsY(y1, y_offset_math, zoom);
    if(Math.abs(canvasCoords_right - canvasCoords_left) < 5){ //si continuité visuelle
        //console.log("continue", x_left, x_right);
        return true; // si continuité visuelle
    }
    return continuous_y_gaps2(x0, x1, y0, y1);
}


function is_pseudo_continuous2(coords_math_x0, coords_math_x1, coords_math_y0, coords_math_y1, coords_canvas_y0, coords_canvas_y1){
    if(Math.abs(coords_canvas_y1 - coords_canvas_y0) < 5){ //si continuité visuelle
        return true; // si continuité visuelle
    }
    return continuous_y_gaps2(coords_math_x0, coords_math_x1, coords_math_y0, coords_math_y1);
}


// vérifie si la cont entre x0 et x1 est la même que celle d'avant: sinon, rupture vraie
function is_rupture_cont(cont_to_next_before, x0, x1, y0, y1){
    return is_pseudo_continuous(x0, x1, y0, y1) === cont_to_next_before;
}





//fonction inverse de canvasToMathCoords
function mathToCanvasCoords(x, y, x_offset, y_offset, zoom){ //entrée en unité maths
    return {x: mathToCanvasCoordsX(x, x_offset, zoom), y: mathToCanvasCoordsY(y, y_offset, zoom)};
}

//fonction inverse de canvasToMathCoordsX
function mathToCanvasCoordsX(x, x_offset, zoom){ //entrée en unité maths
    return (x - x_offset) * zoom * 30 + canvas_width_over2;
}

//fonction inverse de canvasToMathCoordsX
function mathToCanvasCoordsY(y, y_offset, zoom){ //entrée en unité maths
    return -(y - y_offset) * zoom * 30 + canvas_width_over2;
}


function modulo(a, b) { //a modulo b
    return (a % b + b) % b;
}


function offsetting(e){
    let X_new = e.offsetX;
    let Y_new = e.offsetY;
    const new_x_offsetting = canvasToMathCoordsX(X_old, x_offset_math, zoom) - canvasToMathCoordsX(X_new, x_offset_math, zoom);
    x_offset_math += new_x_offsetting;
    y_offset_math += canvasToMathCoordsY(Y_old, y_offset_math, zoom) - canvasToMathCoordsY(Y_new, y_offset_math, zoom);
    X_old = X_new;
    Y_old = Y_new;
    x_inf = canvasToMathCoordsX(0, x_offset_math, zoom); //unité maths
    x_sup = canvasToMathCoordsX(canvas.width, x_offset_math, zoom); //unité maths
    x_borne.inf = x_inf;
    x_borne.sup = x_sup;

    // si l'offsetting est < x_gap, le partial_tab a une taille de 0 et pas besoin de changer le final math_tab
    // il faut qd mm update le final canvas_tab
    if(Math.abs(new_x_offsetting) < x_gap) {
        final_tab.canvas_tab = get_final_canvas_tab(final_tab.math_tab);
        tracing_graph2();
        return;
    }

    //sinon
    const partial_bornes = get_bornes();
    partial_tab = get_final_tab(partial_bornes.inf, partial_bornes.sup);
    //console.log(partial_tab);
    final_tab.math_tab = concatenation[partial_bornes.side](partial_tab.math_tab, final_tab.math_tab);
    final_tab.canvas_tab = get_final_canvas_tab(final_tab.math_tab);
    tracing_graph2();
}


function tracing_curve2(final_canvas_tab){ // unité canvas dans le tab

    //INITIALISATION

    let yCanvasCoord = clamp(final_canvas_tab[0].y, -10000, 10000); // evite que le premier point soit trop loin en dehors du canvas: evite un bug

    ctx.beginPath();
    ctx.moveTo(final_canvas_tab[0].x, yCanvasCoord);

    //PARCOURS DU TABLEAU

    for(let i = 1; i < final_canvas_tab.length; i++){
        //yCanvasCoord = final_canvas_tab[i];
        // gere les coords en dehors du canvas
        yCanvasCoord = clamp(final_canvas_tab[i].y, -10000, 10000); // evite que le point soit trop loin en dehors du canvas: evite un bug
        if(final_canvas_tab[i - 1].cont_to_next === true){
            ctx.lineTo(final_canvas_tab[i].x, yCanvasCoord);
        } else{
            ctx.moveTo(final_canvas_tab[i].x, yCanvasCoord);
        }
    }
    ctx.strokeStyle = "rgb(255, 0, 0)";
    //ctx.lineWidth = 2;
    ctx.stroke();
    //ctx.lineWidth = 1;
}


function tracing_graph2(){ //parametres: f_str, zoom, x_offset, y_offset
    ctx.clearRect(0, 0, canvas.width, canvas.height); // on efface pour redessiner autre chose
    tracing_grid();
    tracing_curve2(final_tab.canvas_tab); //y_prime_tab
}


//avec ces reglages on peut faire 2 zooms/dezooms sans actualiser les coords: au 3eme on actualise
function tracing_grid(){
    //axe ortho
    //on a besoin de (x, y) en (0, 0) maths en canvas
    let zerozero = mathToCanvasCoords(0, 0, x_offset_math, y_offset_math, zoom);
    //let sub_divs = []; //unité maths
    //let sub_sub_divs = []; //unité maths
    ctx.beginPath();
    //barre horizontale: va de x:0, y:0 -> x:max, y:0
    ctx.moveTo(0, zerozero.y);
    ctx.lineTo(canvas.width, zerozero.y);
    // barre verticale: va de 
    ctx.moveTo(zerozero.x, 0);
    ctx.lineTo(zerozero.x, canvas.height);

    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.stroke();
    //ctx.closePath();

    //sous divs
    ctx.beginPath();
    const subdivision_nb = 10; //doit etre pair
    
    if(zoom_count % 2 === 0){
        x_borne_graph.inf = +x_inf;
        x_borne_graph.sup = +x_sup;
    }
    const sub_gap = (x_borne_graph.sup - x_borne_graph.inf) / subdivision_nb;
    const sub_sub_gap = ((x_borne_graph.sup - x_borne_graph.inf) / subdivision_nb) / 5;
    const sub_gap_offset_x = Math.floor(x_offset_math / sub_gap) * sub_gap;
    const sub_gap_offset_y = Math.floor(y_offset_math / sub_gap) * sub_gap;
    for(let i = -(subdivision_nb / 2 + 4) ; i <= subdivision_nb / 2 + 4; i++){ // va de -7 à 7 pour le zoom/dezoom
        const x_sub_math = i * sub_gap + sub_gap_offset_x;
        const y_sub_math = i * sub_gap + sub_gap_offset_y;
        //sub_divs.push(x_sub_math);
        const coords_sub_canvas = mathToCanvasCoords(x_sub_math, y_sub_math, x_offset_math, y_offset_math, zoom);

        //barres horizontales
        ctx.moveTo(0, coords_sub_canvas.y);
        ctx.lineTo(canvas.width, coords_sub_canvas.y);

        //barres verticales
        ctx.moveTo(coords_sub_canvas.x, 0);
        ctx.lineTo(coords_sub_canvas.x, canvas.height);

        //graduations
        // si zerozero.x,y (position des graduations) sont en dehors du canvas, on les met à la bordure
        //les x
        if(zerozero.x < 0 || zerozero.x > canvas.width - ctx.measureText(Math.round(x_sub_math * 100)/100).width){ //un peu degueulasse mais jsp comment faire autrement, je dois regrouper les if pour les else correspondants
            if(zerozero.x < 0){
                ctx.textAlign = "left";
                ctx.fillText(Math.round(y_sub_math * 100)/100, 0 + 2.5, coords_sub_canvas.y + 2.5); //+2.5 car ca a l'air de bien marcher (arbitraire)
            }
            if(zerozero.x > canvas.width - ctx.measureText(Math.round(x_sub_math * 100)/100).width){
                ctx.textAlign = "right";
                ctx.fillText(Math.round(y_sub_math * 100)/100, canvas.width, coords_sub_canvas.y + 2.5); //+2.5 car ca a l'air de bien marcher (arbitraire)
            }
        }
        else{
            ctx.textAlign = "left";
            ctx.fillText(Math.round(y_sub_math * 100)/100, zerozero.x + 2.5, coords_sub_canvas.y + 2.5); //+2.5 car ca a l'air de bien marcher (arbitraire)
        }
        //les y
        ctx.textAlign = "left";
        if(zerozero.y < 0 || zerozero.y > canvas.height - 15){ //un peu degueulasse mais jsp comment faire autrement, je dois regrouper les if pour les else correspondants
            if(zerozero.y < 0){
                ctx.fillText(Math.round(x_sub_math * 100)/100, coords_sub_canvas.x - ctx.measureText(Math.round(x_sub_math * 100)/100).width / 2, 0 + 10); //- ctx.measureText(x_sub_math).width / 2 en x pour centrer et +10 en y pour le mettre sous la barre
            }
            if(zerozero.y > canvas.height - 15){
                ctx.fillText(Math.round(x_sub_math * 100)/100, coords_sub_canvas.x - ctx.measureText(Math.round(x_sub_math * 100)/100).width / 2, canvas.height - 5); //- ctx.measureText(x_sub_math).width / 2 en x pour centrer et +10 en y pour le mettre sous la barre
            }
        }
        else{
            ctx.fillText(Math.round(x_sub_math * 100)/100, coords_sub_canvas.x - ctx.measureText(Math.round(x_sub_math * 100)/100).width / 2, zerozero.y + 10); //- ctx.measureText(x_sub_math).width / 2 en x pour centrer et +10 en y pour le mettre sous la barre
        }
    }
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.stroke();

    //sous-sous divs
    ctx.beginPath();
    for(let j = -(subdivision_nb / 2 + 4) * 5; j <= (subdivision_nb / 2 + 4) * 5; j++){
        const x_sub_sub_math = j * sub_sub_gap + sub_gap_offset_x;
        const y_sub_sub_math = j * sub_sub_gap + sub_gap_offset_y;
        //sub_sub_divs.push(x_sub_sub_math);
        const coords_sub_sub_canvas = mathToCanvasCoords(x_sub_sub_math, y_sub_sub_math, x_offset_math, y_offset_math, zoom);
        
        //barres horizontales
        ctx.moveTo(0, coords_sub_sub_canvas.y);
        ctx.lineTo(canvas.width, coords_sub_sub_canvas.y);

        //barres verticales
        ctx.moveTo(coords_sub_sub_canvas.x, 0);
        ctx.lineTo(coords_sub_sub_canvas.x, canvas.height);
    }
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.stroke();
}


function zooming(e){ // e pour event
    e.preventDefault(); //empeche le scroll de la page
    const X = e.offsetX; //coordonnée x en pixels
    const Y = e.offsetY; //coordonnée y en pixels
    let old_math_coords = canvasToMathCoords(X, Y, x_offset_math, y_offset_math, zoom);
    let new_math_coords;
    // il faut obtenir les coords de la souris, les passer en coords x, y
    // mathématiques, appliquer le zoom, réobtenir les coords de la souris
    // en x, y mathématiques: il auront donc changé car la souris a pas bougé
    // mais il y a eu zoom
    // on compense ce décalage en ajoutant les offset x et y coorespondants
    // à la différence de pos. de la souris (entre nouveau et ancien)
    //de manière à ce qu'ils redeviennent identiques à ceux de depart
    if(e.deltaY < 0){
        zoom *= zoom_manage(zoom_count); // 2^(1/2) ou (5/2)^(1/2)
        new_math_coords = canvasToMathCoords(X, Y, x_offset_math, y_offset_math, zoom);
        x_offset_math += old_math_coords.x - new_math_coords.x;
        y_offset_math += old_math_coords.y - new_math_coords.y;
        //il faut update les offsets unité canvas
        offsets = mathToCanvasCoords(new_math_coords.x, new_math_coords.y, x_offset_math, y_offset_math, zoom);
        zoom_count += 1;
    }
    //dezoom
    else{
        zoom_count -= 1;
        zoom /= zoom_manage(zoom_count); // 2^(1/2) ou (5/2)^(1/2)
        new_math_coords = canvasToMathCoords(X, Y, x_offset_math, y_offset_math, zoom);
        x_offset_math += old_math_coords.x - new_math_coords.x;
        y_offset_math += old_math_coords.y - new_math_coords.y;
        //il faut update les offsets unité canvas
        offsets = mathToCanvasCoords(new_math_coords.x, new_math_coords.y, x_offset_math, y_offset_math, zoom);
    }
    x_inf = canvasToMathCoordsX(0, x_offset_math, zoom); //unité maths
    x_sup = canvasToMathCoordsX(canvas.width, x_offset_math, zoom); //unité maths
    x_borne = {inf: x_inf, sup: x_sup};
    x_gap = precision_fct / zoom;
    final_tab = get_final_tab(x_inf, x_sup);
    tracing_graph2();
}


function zoom_manage(zoom_count){ //en fonction de zoom count renvoie le zoom à appliquer
    if(modulo(zoom_count, 4) <= 1) return 1.4142135623730951; // 2^(1/2)
    return 1.5811388300841898; // (5/2)^(1/2)
}


//////////////////////////////////////// INTEGRALE NUMERIQUE  //////////////////////////////////////////////////////////////////////

// layer sur lequel on affiche ce qui est lié à l'intégration
const integrate_canvas = document.createElement('canvas');
const integrate_ctx = integrate_canvas.getContext('2d');

const integrate_button = document.getElementById("integrate_button");
const draw_check_box = document.getElementById("check_draw");

// tableau qui encapsule les méthodes numériques d'intégration (fonctions qui calculent la valeur d'une intégrale)
const integration_methods = [calc_rectangle_integration];
// tableau qui encapsule les fonctions d'affichage de ces méthodes numériques d'intégration
const draw_methods = [tracing_rectangle_integration];

// objet qui encapsule les traits de construction et le résultat du calcul de lintégrale
const calc_integration_result = {approximate_integrale_value: 0, x_table_integration: [], y_table_integration: []};

integrate_button.addEventListener("click", () => {
    integrate();
});


draw_check_box.addEventListener("click", () => {
    // le fait de la clic va changer son état donc on modifie actualise les valeurs d'entrée
    integration_methods_args.init();

    // déjà si l'intégration n'a pas eu lieu on peut sortir direct
    if(calc_integration_result.y_table_integration.length === 0) return;

    // si elle était pas check, elle l'est maintenant et dans ce cas on veut afficher
    // les traits de l'intégrale
    if(draw_check_box.checked){
        integration_methods_args.draw_method();
    }

    // si elle était check, elle ne l'est plus et dans ce cas on veut désafficher
    // les traits de l'intégrale
    else {
        tracing_graph2();
    }
});


const integration_methods_args = {
    init: function init(){
        this.integration_method = integration_methods[document.getElementById('method_choice').value];
        this.draw = document.getElementById("check_draw").checked;
        this.draw_method = draw_methods[document.getElementById('method_choice').value];
        this.left_endpoint = document.getElementById('left_endpoint').valueAsNumber;
        this.right_endpoint = right_endpoint = document.getElementById('right_endpoint').valueAsNumber;
        this.integration_gap = document.getElementById('integration_gap').valueAsNumber;
        this.rectangle_side = document.getElementById('rectangle_side').valueAsNumber;
    }
};


function integrate(){
    // init les arguments donnés en entrée par l'utilisateur
    integration_methods_args.init();
    // appelle la fonction d'intégration correspondante
    integration_methods_args.integration_method(integration_methods_args);
    // affiche les traits d'intégration si voulu
    if(integration_methods_args.draw && calc_integration_result.y_table_integration.length !== 0){
        integration_methods_args.draw_method();
    }
    //return calc_integration_result.approximate_integrale_value;
}


//interval d'intégration
//const left_endpoint = document.getElementById('left_endpoint').valueAsNumber;
//const right_endpoint = document.getElementById('right_endpoint').valueAsNumber;

/////////// METHODE DES RECTANGLES


// side pour côté: gauche = 0 ou milieu = 1/2 ou droite = 1
function calc_rectangle_integration(integration_methods_args){
    const x_table_integration = divide_range(integration_methods_args.left_endpoint, integration_methods_args.right_endpoint, integration_methods_args.integration_gap);
    const y_table_integration = [];
    let approximate_integrale_value = 0;
    for(let i = 0; i < x_table_integration.length - 1; i++){
        const y_i = f.evaluate({x: x_table_integration[i] + integration_methods_args.integration_gap * integration_methods_args.rectangle_side});
        y_table_integration.push(y_i);
        approximate_integrale_value += integration_methods_args.integration_gap * y_i;
    }

    calc_integration_result.approximate_integrale_value = approximate_integrale_value;
    calc_integration_result.x_table_integration = x_table_integration;
    calc_integration_result.y_table_integration = y_table_integration;
    //return {approximate_integrale_value: approximate_integrale_value, x_table_integration: x_table_integration, y_table_integration: y_table_integration};
}

function tracing_rectangle_integration(){

    ctx.beginPath();
    ctx.fillStyle = "rgba(40, 200, 0, 0.5)";

    // donne l'écart en pixels entre 2 x_n et x_n+1 du tableau x_table_integration (supposé constant)
    const integration_gap_canvas = mathToCanvasCoordsX(calc_integration_result.x_table_integration[1], x_offset_math, zoom) - mathToCanvasCoordsX(calc_integration_result.x_table_integration[0], x_offset_math, zoom);

    // suppose que tous les rectangles ont la mm largeur et on leur donne une largeur minimale pour que l'affichage soit correct
    // on considère que 0.01 est la précision maximale: descendre en dessous ne change rien visuellement
    const rect_width = Math.max(integration_gap_canvas, 0.01);

    // dans 1 rectangle affiché, il peut y avoir un saut de pls x: incr est ce nb arrondi à l'entier du dessus
    const incr = Math.ceil(rect_width / integration_gap_canvas);
    
    for(let i = 0; i < calc_integration_result.x_table_integration.length - 1; i += incr){
        const start_point = mathToCanvasCoords(calc_integration_result.x_table_integration[i], calc_integration_result.y_table_integration[i], x_offset_math, y_offset_math, zoom);
        const rect_height = mathToCanvasCoordsY(0, y_offset_math, zoom) - start_point.y;
        ctx.fillRect(start_point.x, start_point.y, rect_width, rect_height);
    }
    ctx.fillStyle = "black";
}


//////////// METHODE DES TRAPEZES