const boardTab = [
    ["square", "^2"], 
    ["sqrt", "√"],
    ["abs", "|"],
    ["frac", "/"],
    ["ln", "ln("],
    ["exp", "e^"],
    ["pow", "^"],
    ["pi", "\\pi "],
    ["e", "e"],
    ["sin", "sin("],
    ["cos", "cos("],
    ["tan", "tan("],
    ["cotan", "cotan("],
    ["sec", "sec("],
    ["cosec", "cosec("],
    ["arcsin", "arcsin("],
    ["arccos", "arccos("],
    ["arctan", "arctan("],
    ["arccotan", "arccotan("],
    ["arcsec", "arcsec("],
    ["arccosec", "arccosec("],
    ["sinh", "sinh("],
    ["cosh", "cosh("],
    ["tanh", "tanh("],
    ["cotanh", "cotanh("],
    ["sech", "sech("],
    ["cosech", "cosech("],
    ["arcsinh", "arcsinh("],
    ["arccosh", "arccosh("],
    ["arctanh", "arctanh("],
    ["arccotanh", "arccotanh("],
    ["arcsech", "arcsech("],
    ["arccosech", "arccosech("],
    ["gamma", "\\Gamma("],
    ["zeta", "\\zeta("]
];

// quand il y aura pls textarea car pls fonctions, il faudra modifier ca pour que ca ecrive dans le dernier textarea selectionné et que ca le focus
boardTab.forEach((key) => {
    document.getElementById(key[0]).addEventListener("click", () => {
        mathField.typedText(key[1]);
        document.getElementsByTagName("textarea")[0].focus();
    });
});

//const canvas = document.getElementById("canvas");
const checkDrawIntegral = document.getElementById('check_draw');

const layers = new Layers();
const grid = new Grid();
const f0 = new MathFunction(document.getElementById('latex').innerText);
const curve0 = new Curve(f0.fct, f0.vars); // il pourrait y avoir plusieurs curve à l'avenir
const integral0 = new Integral(); // idem: 1 integrale par courbe 

//grid.initGridValues();
grid.initGridValues();
grid.traceGrid(); // trace la grid au chargement de la page
layers.ctx.drawImage(grid.layer, 0, 0); // et l'affiche sur le canvas

document.getElementById('math-field').addEventListener("input", () => {
    // fonction donnée en entrée
    f0.init(document.getElementById('latex').innerText);

    if(!f0.isSupported.isValid) {
        document.getElementById("error-pop-up").style.display = "inline";
        document.getElementById("error-message").textContent = f0.isSupported.message;
        return;
    }

    // reset l'affichage du point coloré
    document.getElementById("error-pop-up").style.display = "none";
    document.getElementById("error-message").textContent = "";

    // layers.init(f0.valueAtZero); // remet tout à 0 mais centre en x = 0, y = f(0)
    grid.initGridValues();
    grid.traceGrid(); // trace la grid
    
    // vérifie si f0 est valide: si oui continue, sinon sort avec un message d'erreur
    // curve
    curve0.init(f0.fct, f0.vars);
    //curve0.initGlobalArrs();
    curve0.getAllCoords(layers.xBoundsReal.inf, 0);
    curve0.traceCurve(); 

    // on met pas l'integrale ici : quand nouvelle fct affiche pas les traits d'int de l'ancienne fct
    integral0.reset();

    layers.drawAll();
})

document.getElementById('integrate_button').addEventListener("click", () => {
    // force f0 à repasser à la moulinette : sous opti mais regle pleins de pbs

    // fonction donnée en entrée
    f0.init(document.getElementById('latex').innerText);

    if(!f0.isSupported.isValid) {
        document.getElementById("error-pop-up").style.display = "inline";
        document.getElementById("error-message").textContent = f0.isSupported.message;
        return;
    }

    // reset l'affichage du point coloré
    document.getElementById("error-pop-up").style.display = "none";
    document.getElementById("error-message").textContent = "";

    // layers.init(f0.valueAtZero); // remet tout à 0 mais centre en x = 0, y = f(0)
    grid.initGridValues();
    grid.traceGrid(); // trace la grid
    
    // vérifie si f0 est valide: si oui continue, sinon sort avec un message d'erreur
    // curve
    curve0.init(f0.fct, f0.vars);
    //curve0.initGlobalArrs();
    curve0.getAllCoords(layers.xBoundsReal.inf, 0);
    curve0.traceCurve(); 


    // integrale
    integral0.init();
    if(!integral0.isValid) {
        layers.drawAll();
        return;
    }
    integral0.isDraw = true;
    integral0.integrate();
    document.getElementById("delta-result").innerText = " = " + integral0.delta;
    document.getElementById("integral-result").innerText = "= " + integral0.approximateValue;
    console.log(layers, f0, curve0, integral0);
    // affiche le tout sur le canvas
    layers.drawAll();
});

layers.canvas.addEventListener("wheel", (e) => {
    // update les valeurs de layers
    layers.zooming(e);
    // retrace la grid
    grid.initGridValues();
    grid.traceGrid();
    // la curve: si plusieurs, faire une boucle
    curve0.initXGap(); //curve.xGap dépend de zoom
    curve0.getAllCoords(layers.xBoundsReal.inf, 0); // recalcule tout les pts de la curve
    curve0.traceCurve(); // trace la curve
    // l'intégrale: idem mais des fois on peut choisir de ne pas l'afficher
    integral0.trace();
    
    layers.drawAll(); // affiche tout sur le layers.canvas
});

layers.canvas.addEventListener("mousedown", (event) => {
    layers.getMousePosition(event);
    layers.isOffseting = true;
    layers.canvas.style.cursor = "move";
});

layers.canvas.addEventListener("mousemove", (event) => {
    if(!layers.isOffseting) return;
    layers.offseting(event);
    // retrace la grid
    grid.initGridValues();
    grid.traceGrid();
    // la courbe
    curve0.initPartialArrs(layers.partialBounds); // init les tableaux partiels
    if(curve0.partialMathCoords.length !== 0){
        curve0.getAllCoords(layers.partialBounds.inf, 2); // calcule les pts de la curve dans l'intervalle partiel ajouté
        curve0.concatenation[layers.partialBounds.side](); // concat les partialCoords avec les coords
    }
    curve0.updateCanvasCoords();
    curve0.traceCurve(); // trace la curve
    // l'intégrale: idem mais des fois on peut choisir de ne pas l'afficher
    integral0.trace();

    layers.drawAll(); // affiche tout sur le layers.canvas
});

layers.canvas.addEventListener("mouseup", () => {
    layers.isOffseting = false;
    layers.canvas.style.cursor = "auto";
});

layers.canvas.addEventListener("mouseout", () => {
    layers.isOffseting = false;
    layers.canvas.style.cursor = "auto";
});

checkDrawIntegral.addEventListener("click", () => {
    integral0.isDraw = document.getElementById("check_draw").checked;
    layers.drawAll();
});

window.addEventListener("resize", () => {
    // resize
    layers.resize();
    grid.resize();
    curve0.resize();
    integral0.resize();
    // retrace
    grid.initGridValues();
    grid.traceGrid(); // trace la grid
    // fonction donnée en entrée
    // curve
    curve0.initGlobalArrs();
    curve0.getAllCoords(layers.xBoundsReal.inf, 0);
    curve0.traceCurve(); 
    // integrale
    //integral0.init(f0.fct, f0.vars);
    //integral0.integrate();
    integral0.trace();
    // affiche le tout sur le canvas
    layers.drawAll();
});

// MENU
const toggleButton = document.getElementById('toggleButton');
const menu = document.getElementById('dashboard');
const math_table = document.getElementById('math_table');
toggleButton.addEventListener("click", () => {
    if(menu.style.display === "none"){
        menu.style.display = "block";
        math_table.style.display = "grid";
        toggleButton.innerText = "Cacher le menu";
    } else {
        menu.style.display = "none";
        math_table.style.display = "none";
        toggleButton.innerText = "Afficher le menu";
    }
});


// verif si la fct a + d'1 var, si oui message d'erreur

function ceilToPowerOf10(x){
    const pow = Math.ceil(Math.log10(x));
    return pow <= 1 ? 10 : Math.pow(10, pow);
}

function clamp(value, min, max){
    return Math.min(Math.max(value, min), max);
}

// discrétise l'intervalle [min, max] en N = nbSubdivsX valeurs de x
function divideRange(min, max, gap){ 
    const nbSubdivsX = Math.round((max - min) / gap) + 1;
    const subdivsX = new Array(nbSubdivsX); //on le fait en statique
    for(let i = 0; i < nbSubdivsX; i++){
        subdivsX[i] = min + i * gap;
    }
    return subdivsX;
}

//renvoie le multiple de gap le plus proche du nombre en entrée
function gapRound(float, gap){
    const quotient = Math.round(float / gap);
    return gap * quotient;
}

function isReal(number) {
    return typeof number === 'number' && Number.isFinite(number);
}

function modulo(a, b) { //a modulo b
    return (a % b + b) % b;
}
