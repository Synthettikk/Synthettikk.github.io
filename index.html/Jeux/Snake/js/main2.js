// snake 2.0

/////// idées pour améliorer le jeu:
// mettre un mode classic avec les 3 niveaux de vitesse 
// mode "escape" avec une plusieurs niveaux et des maps
// avec des murs, des ennemis et une pomme à recuperer sans mourir
// par exemple on peut recup des pomme qui ouvrent des murs etc pour progresser

/////////////////////////////////////////// INTERFACE /////////////////////////////////////////////


//canvas
const graphCanvas = document.getElementById("screen");
const contextscreen = graphCanvas.getContext("2d");

//menu
const bouton_easy = document.getElementById("boutonEasy");
const bouton_medium = document.getElementById("boutonMedium");
const bouton_hard = document.getElementById("boutonHard");
const menu = document.getElementById("menu");
const menugameOver = document.getElementById("gameOver");
const level = document.getElementById("lvl");
const scoregame = document.getElementById("score");
const menubestScore = document.getElementById("bestScore");
const recordlvl = document.getElementById("best_score");
const compteRebours = document.getElementById("countdown");

menugameOver.addEventListener("click", reset);
menubestScore.addEventListener("click", reset);

let niveau;

// initialise les scores à 0
if (localStorage.length === 0) {
    localStorage.setItem('bestscoreEasy', 0);
    localStorage.setItem('bestscoreMedium', 0);
    localStorage.setItem('bestscoreHard', 0);
}

const mapLvLScore = new Map();
mapLvLScore.set("Easy  Mode", "bestscoreEasy");
mapLvLScore.set("Medium  Mode", "bestscoreMedium");
mapLvLScore.set("Hard  Mode", "bestscoreHard");

//compte à rebours début de partie
let counter = 3;
let intervalId;
let AnimationId; //req

function tictac() {
    counter -= 1;
    if (counter > 0) {
        compteRebours.innerText = counter;
    }
    else {
        compteRebours.innerText = "GO!";
    }

    if (counter === -1) {
        clearInterval(intervalId);
        compteRebours.innerText = "";
        AnimationId = requestAnimationFrame(game);
    }
}

function countdown() {
    compteRebours.innerText = counter;
    intervalId = setInterval(tictac, 700);
}

function launcher() {
    scoregame.innerText = 0;
    level.innerText = niveau;
    menu.style.display = "none";
    compteRebours.style.display = "block";
    countdown();
}

function reset(){
    counter = 3;
    menugameOver.style.display = "none";
    menubestScore.style.display = "none";
    menu.style.display = "block";
    level.innerText = "";
    recordlvl.innerText = "";
    scoregame.innerText = "";
    snake.init();
    pomme.init();
    wantedDir = snake.direction;
    oldTime = 0;
    accumulator = 0;
}

let vitesse;
//boutons pour choisir le niveau et lancer une partie 
bouton_easy.addEventListener("click", () =>{
    vitesse = 1;
    niveau = "Easy  Mode";
    recordlvl.innerText = "Best:" + localStorage['bestscoreEasy'];
    launcher();
});

bouton_medium.addEventListener("click", () =>{
    vitesse = 2.5;
    niveau = "Medium  Mode";
    recordlvl.innerText = "Best:" + localStorage['bestscoreMedium'];
    launcher();
});

bouton_hard.addEventListener("click", () => {
    vitesse = 4;
    niveau = "Hard  Mode";
    recordlvl.innerText = "Best:" + localStorage['bestscoreHard'];
    launcher();
});

// Flèches pour mobile
const boutonArrowUp = document.getElementById("arrowup");
const boutonArrowRight = document.getElementById("arrowright");
const boutonArrowDown = document.getElementById("arrowdown");
const boutonArrowLeft = document.getElementById("arrowleft");


///////////////////////////////////////////// MECANIQUE //////////////////////////////////////////

const tailleCase = 60; // construit pour etre un diviseur de la taille du canvas

class Snake {
    constructor(){
        this.init();
    }

    init(){
        this.head = this.genereHead();
        this.directions = {
            gauche: [-1, 0],
            droite: [1, 0],
            haut: [0, -1],
            bas: [0, 1]
        }
        this.direction = this.genere_Direction2();
        this.body = this.genere_Snake2();
        this.rayon = tailleCase / 2;
        this.color = "#e4cd00ff";
        this.wantedDir = this.direction;
    }

    genereHead(){
        let X = Math.round(((graphCanvas.width - 2 * tailleCase) * Math.random()) / tailleCase) * tailleCase + tailleCase;
        let Y = Math.round(((graphCanvas.width - 2 * tailleCase) * Math.random()) / tailleCase) * tailleCase + tailleCase;
        X = Math.round(3/5 * X / tailleCase) * tailleCase + graphCanvas.width * (1 - 3/5) / 2; // le + est là pour recentrer
        Y = Math.round(3/5 * Y / tailleCase) * tailleCase + graphCanvas.height * (1 - 3/5) / 2; //on ajoute la moitié de ce qu'on avait enlevé
        return ({X, Y});
    }

    genere_Direction2(){
        //let direction;
        const x = this.head.X - graphCanvas.width / 2; //on recentre
        const y = this.head.Y - graphCanvas.height / 2;
        const directions = ['gauche', 'bas', 'droite', 'haut'];
        const angle = Math.atan2(-y, x);
        let index = Math.round(angle * 4 / (2 * Math.PI));
        if (index < 0){
            index += 4; //4 = len(directions)
        }
        return directions[index];
    }

    genere_Snake2(){ // créé les coord du snake au début du jeu et les met dans le tableau snake
        let snake = [];
        let x = this.head.X;
        let y = this.head.Y;
        snake.push({x, y});
        const dx = -this.directions[this.direction][0]; //- car on craft le corps à l'opposé de la tete (la tete reste devant)
        const dy = -this.directions[this.direction][1];
        for (let index = 1; index <= 3; index += 1){
            x += dx * tailleCase;
            y += dy * tailleCase;
            snake.push({x, y});
        }
        return snake;
    }

    snake_Update2(){ // on fait se déplacer snake 
        let x = this.body[0].x;
        let y = this.body[0].y;
        const dx = this.directions[this.direction][0];
        const dy = this.directions[this.direction][1];
        x += dx * tailleCase; //on créé les nouvelles coords de la tete
        y += dy * tailleCase;
        this.body.unshift({x, y}); //on remplace la tete par la nouvelle et on decale le reste
        this.body.pop(); //on enleve la derniere cellule (on a créé une cellule devant, on supprime une cellule derriere)
    }

    score() {
        return this.body.length - 4; //nb de pommes ramassées
    }

    bestScore2() {
        if (this.score() <= localStorage[mapLvLScore.get(niveau)]){
            menugameOver.style.display = "block";
        } else{
            localStorage[mapLvLScore.get(niveau)] = this.score();
            menubestScore.style.display = "block";
        }
    }

    snake_Affichage() { 
        this.body.forEach (bodyCell => {
            cercle(bodyCell.x - tailleCase/2, bodyCell.y - tailleCase/2, this.rayon, this.color);
        });
    }

    hitPomme(pommeCoords) {
        if (pommeCoords.x === this.body[0].x && pommeCoords.y === this.body[0].y){
            return true;
        }
        return false;
    }

    mangePomme() {
        const queuebeforeX = this.body[0].x;
        const queuebeforeY = this.body[0].y;
        this.body.push({queuebeforeX, queuebeforeY});
    }
    
    changeDir(wantedDir) { // la contraposée semble plus opti
        if((wantedDir === "haut" && this.direction === "bas") ||
         (wantedDir === "gauche" && this.direction === "droite") ||
         (wantedDir === "bas" && this.direction === "haut") ||
         (wantedDir === "droite" && this.direction === "gauche")) return;
        this.direction = wantedDir;
    }

    gameOver() {
        if((this.body[0].x >= graphCanvas.width + tailleCase) ||
         (this.body[0].x <= 0) || 
         (this.body[0].y >= graphCanvas.height + tailleCase) || 
         (this.body[0].y <= 0)) {
            return true;
        }
        for (let index = 1; index <= this.body.length - 1; index += 1){
            const x0 = this.body[index].x;
            const y0 = this.body[index].y;
            if (this.body[0].x === x0 && this.body[0].y === y0) {
                return true;
            }
        }
        return false;
    }
}

const snake = new Snake();

class Bille { // ici on pourra choisir si la bille est une pomme ou un ennemi ou autre
    constructor(){
        this.init();
    }

    init(){
        this.coords = this.generePomme(snake.body);
    }

    isPommeOnSnake(snakeBody, pommeCoords){ //verifie si la pomme a pop sur le snake; si oui: refait pop une nouvelle pomme
        let bool = false;
        snakeBody.forEach( cellule => {
            if(pommeCoords.x === cellule.x && pommeCoords.y === cellule.y) {
                console.log('Pomme a pop sur snake');
                bool = true; // peut pas return dans un forEach
            }
        });
        return bool;
    }

    generePomme(snakeBody) { 
        const x = Math.round(((graphCanvas.width - 2 * tailleCase) * Math.random()) / tailleCase) * tailleCase + tailleCase;
        const y = Math.round(((graphCanvas.height - 2 * tailleCase) * Math.random()) / tailleCase) * tailleCase + tailleCase;
        if(this.isPommeOnSnake(snakeBody, {x: x, y: y})){
            return this.generePomme(snakeBody);
        }
        return {x: x, y: y};
    }
    
    pomme_Affichage() {
        cercle(this.coords.x -tailleCase / 2, this.coords.y -tailleCase / 2, tailleCase/2, "red");
    }
}

const pomme = new Bille();

function cercle(x, y, tailleCase, couleur){ // créé un cercle et l'affiche
        contextscreen.beginPath();
        contextscreen.fillStyle = couleur;
        contextscreen.arc(x, y, tailleCase, 0, 2 * Math.PI); // quartier de cercle va de l'angle 0 à 2pi
        contextscreen.fill();
    }


    //////////////////////////////////////// EVENEMENTS ////////////////////////////////////

const mapButton = new Map(); //mettre tt ca dans la classe snake?
mapButton.set("z", "haut");
mapButton.set("ArrowUp", "haut");
mapButton.set("q", "gauche");
mapButton.set("ArrowLeft", "gauche");
mapButton.set("s", "bas");
mapButton.set("ArrowDown", "bas");
mapButton.set("d", "droite");
mapButton.set("ArrowRight", "droite");

let wantedDir = snake.direction;

// boutons mobile
boutonArrowUp.addEventListener('click', () => {
    wantedDir = "haut";
});

boutonArrowRight.addEventListener('click', () => {
    wantedDir = "droite";
});

boutonArrowDown.addEventListener('click', () => {
    wantedDir = "bas";
});

boutonArrowLeft.addEventListener('click', () => {
    wantedDir = "gauche";
});

// clavier
window.addEventListener('keydown', (event) => { 
    if(mapButton.has(event.key))
        wantedDir = mapButton.get(event.key);
});

let oldTime = 0;
let accumulator = 0;

function game(time){ // time est un parametre que requestAnim donne
    contextscreen.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    snake.snake_Affichage();
    pomme.pomme_Affichage();
    deltaTime = (oldTime === 0) ? deltaTime = 0 : deltaTime = time - oldTime; //if/else
    if (accumulator > 270 / vitesse){ // depend pas de la frequence d'ecran mais du temps en deux tics (normalement)
        snake.changeDir(wantedDir);
        snake.snake_Update2();
        if (snake.hitPomme(pomme.coords)){
            snake.mangePomme();
            pomme.coords = pomme.generePomme(snake.body);
            scoregame.innerText = snake.score();
        }
        accumulator = 0;
    }
    if(snake.gameOver()){
        contextscreen.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
        snake.bestScore2();
        cancelAnimationFrame(AnimationId);
    } else{
        oldTime = time;
        accumulator += deltaTime;
        AnimationId = requestAnimationFrame(game);
    }
}


    












