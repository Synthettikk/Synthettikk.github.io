// snake

////////////////////////////////////// FREQUENCE ECRAN ///////////////////////////////////////////

let start = Date.now(); 
let freqCalcul;
let frequenceEcran;
let nombreImages = 0; //nb d'images à partir du lancement de la page

// calcul la frequence de rafraichissement du jeu en temps reel
function freqScreen() {
    if(nombreImages === 100) {
        frequenceEcran = freqCalcul;
        start = Date.now();
        nombreImages = 0; // toutes les 100 images recalcul la frequence du jeu
        requestAnimationFrame(freqScreen);
    }

    else {
        const time = Date.now() - start;
        freqCalcul = Math.round(nombreImages / (time / 1000)); // time est en millisecondes -> on le passe en secondes pour avoir des Herz
        nombreImages += 1;
        requestAnimationFrame(freqScreen);
    }
}
requestAnimationFrame(freqScreen);


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

let niveau;

// initialise les scores à 0
if (localStorage.length === 0) {
    localStorage.setItem('bestscoreEasy', 0);
    localStorage.setItem('bestscoreMedium', 0);
    localStorage.setItem('bestscoreHard', 0);
}

//compte à rebours début de partie
let counter = 3;
let intervalId;

function tictac() {
    counter -= 1;
    if (counter > 0) {
        compteRebours.innerHTML = counter;
    }
    else {
        compteRebours.innerHTML = "GO!";
    }

    if (counter === -1) {
        clearInterval(intervalId);
        compteRebours.parentNode.removeChild(compteRebours);
        game();
    }
}

function countdown() {
    compteRebours.innerHTML = counter;
    intervalId = setInterval(tictac, 500);
}

function launcher() {
    level.innerHTML = niveau;
    menu.style.display = "none";
    compteRebours.style.display = "block";
    countdown();
}

//boutons pour choisir le niveau et lancer une partie 
bouton_easy.addEventListener("click", () =>{
    vitesse = 1/2;
    niveau = "Level: Easy";
    recordlvl.innerHTML = localStorage['bestscoreEasy'];
    launcher();
});

bouton_medium.addEventListener("click", () =>{
    vitesse = 1;
    niveau = "Level: Medium";
    recordlvl.innerHTML = localStorage['bestscoreMedium'];
    launcher();
});

bouton_hard.addEventListener("click", () => {
    vitesse = 5/3;
    niveau = "Level: Hard";
    recordlvl.innerHTML = localStorage['bestscoreHard'];
    launcher();
});

// Flèches pour mobile
const boutonArrowUp = document.getElementById("arrowup");
const boutonArrowRight = document.getElementById("arrowright");
const boutonArrowDown = document.getElementById("arrowdown");
const boutonArrowLeft = document.getElementById("arrowleft");


///////////////////////////////////////////// MECANIQUE //////////////////////////////////////////

function game() {
    const timeout = 8 / vitesse; // temps entre 2 changements de direction; // 8 est empirique
    let timer = 0; // compte les images apres un changement de direction
    let init = 100 * (frequenceEcran / 144); // compteur au debut du jeu (en nb d'images)
    let rayonSnake = 0; // le rayon des billes du snake ont un rayon = 0 à la premiere image
    let colorSnake = "#FFC264"
    const tailleCase = 10; // construit pour etre un multiple de 10

    function genere_Randcoord() {
        let x = Math.random();
        let y = Math.random();
        x = Math.round(((graphCanvas.width - 2 * tailleCase) * x) / tailleCase) * tailleCase;
        y = Math.round(((graphCanvas.height - 2 * tailleCase) * y) / tailleCase) * tailleCase;
        x = x + tailleCase; // (bord) 
        y = y + tailleCase;
        return ({x, y});
    }

    function genere_Head(){ // génère des coord pour la tête du serpent, compris entre 100 et 300px
        const Randomcoord = genere_Randcoord();
        const x = Math.round(3/5 * Randomcoord.x / tailleCase) * tailleCase + graphCanvas.width / (graphCanvas.width / 100); // le + est là pour recentrer
        const y = Math.round(3/5 * Randomcoord.y / tailleCase) * tailleCase + graphCanvas.height / (graphCanvas.height / 100);
        return ({x, y});
    }

    let head = genere_Head(); 
    
    function genere_Direction(head){ // direction de depart
        let direction;
        if (head.x < graphCanvas.width / 2 && head.y < graphCanvas.height / 2) { // si on est en haut à gauche
            if (head.x / head.y >= 1){ // si plus en haut qu'à gauche
                direction = "bas";
            } else {
                direction = "droite";
            }
        }
        if (head.x >= graphCanvas.width / 2 && head.y <= graphCanvas.height / 2) { // en haut à droite
            if ((graphCanvas.width - head.x) / head.y <= 1) { // plus à droite qu'en haut
                direction = "gauche";
            }
            else {
                direction = "bas";
            }
        }
        if (head.x <= graphCanvas.width / 2 && head.y >= graphCanvas.height / 2) { // en bas à gauche
            if (head.x / (graphCanvas.height - head.y) <= 1 ){ // plus à gauche qu'à droite
                direction = "droite";
            }
            else {
                direction = "haut";
            }
        }
        if (head.x >= graphCanvas.width / 2 && head.y >= graphCanvas.height / 2) { // en bas à droite
            if ((graphCanvas.width - head.x) / (graphCanvas.height - head.y) >= 1) { // plus en bas qu'à droite
                direction = "haut";
            }
            else{
                direction = "gauche";
            }
        }
        return direction;
    }

    let direction = genere_Direction(head);

    function genere_Snake (direction){ // créé les coord du snake au début du jeu et les met dans le tableau snake
        const snake = [];
        let x = head.x;
        let y = head.y;
        snake.push(head);
        if (direction === "haut"){
            for (let index = 1; index <= 3; index += 1) { // on fait la queue du serpent (3 éléments) qu'on ajoute à snake
                y = y + index * tailleCase;
                snake.push({x, y});
                y = head.y;
            }
        }
        if (direction === "bas"){
            for (let index = 1; index <= 3; index += 1) { 
            y = y - index * tailleCase;
            snake.push({x, y});
            y = head.y;
            }
        }
        if (direction === "droite"){
            for (let index = 1; index <= 3; index += 1) { 
            x = x - index * tailleCase;
            snake.push({x, y});
            x = head.x;
            }
        }
        if (direction === "gauche"){
            for (let index = 1; index <= 3; index += 1) { 
            x = x + index * tailleCase;
            snake.push({x, y});
            x = head.x;
            }
        }
        return snake;
    }

    let snake = genere_Snake(direction);

    function genere_Pomme(){
        const coordPomme = genere_Randcoord();
        const pommex = coordPomme.x;
        const pommey = coordPomme.y;
        // on pourrait faire en sorte que la pomme ne pop pas sur le snake
        return ({pommex, pommey});
    }

    let Pomme = genere_Pomme(); // on veut pas qu'il change à chaque image

    function snake_Update(){ // on fait se déplacer snake 
        let dx;
        let dy;
        if (direction === "haut"){
            dx = 0;
            dy = -1;
            }
        if (direction === "bas"){
            dx = 0;
            dy = 1;
        }
        if (direction === "droite"){
            dx = 1;
            dy = 0;
        }
        if (direction === "gauche"){
            dx = -1;
            dy = 0;
        }
        // on fabrique les prochaines coordonnées de la tete:
        const xbefore = (coordToGrille(head.x, head.y).abscisse); // case sur laquelle était la tete image d'avant
        const ybefore = (coordToGrille(head.x, head.y).ordonnee);
        const x0 = head.x + ((vitesse) * (144 / frequenceEcran)) * dx; // coord continue, x0 prend la nouvelle valeur de head.x
        const y0 = head.y + ((vitesse) * (144 / frequenceEcran)) * dy;
        const x = (coordToGrille(x0, y0).abscisse); // coord discrète de head
        const y = (coordToGrille(x0, y0).ordonnee);
        head.x = x0;
        head.y = y0;
        if ((xbefore != x) || (ybefore != y)) { // snake se deplace à partir du moment où on depasse x+0.5
            snake.unshift({x, y});
            snake.pop();
        }
    }

    function collisionPomme() {
        if (Pomme.pommex === snake[0].x && Pomme.pommey === snake[0].y) { // quand head touche pomme,
            Pomme = genere_Pomme(); // fait pop pomme ailleurs
            // fait grandir snake
            const queuebefore = graphCanvas.height + tailleCase; //on le fait pop à un endroit hors cadre
            snake.push({queuebefore, queuebefore});
        }
    }

    function score() {
        return snake.length - 4; //nb de pommes ramassées
    }

    function coordToGrille(x, y) { 
        const abscisse = Math.round(x / tailleCase) * tailleCase;
        const ordonnee = Math.round(y / tailleCase) * tailleCase;
        return ({abscisse, ordonnee});
    }

    function cercle(x, y, tailleCase, couleur){ // créé un cercle et l'affiche
        contextscreen.beginPath();
        contextscreen.fillStyle = couleur;
        contextscreen.arc(x, y, tailleCase, 0, 2 * Math.PI); // quartier de cercle va de l'angle 0 à 2pi
        contextscreen.fill();
    }

    function snake_Affichage() { 
        snake.forEach (bodyCell => {
            const x = (coordToGrille(bodyCell.x, bodyCell.y).abscisse) - tailleCase/2; // fais passer les coord de changement d'affichage de tailleCase en tailleCase
            const y = (coordToGrille(bodyCell.x, bodyCell.y).ordonnee) - tailleCase/2; // - tailleCase / 2
            cercle(x, y, rayonSnake, colorSnake);
            // decalage nécéssaire pour afficher aux bons endroits (visuel)
        });
    }

    function rayonSnakeUp(){ // peut etre amélioré
        if (rayonSnake === tailleCase / 2) {
            colorSnake = "white";
            return(rayonSnake);
        }
        else{
            rayonSnake += 1/8;
            return(rayonSnake);
        }
    }

    function pomme_Affichage() {
        cercle(Pomme.pommex -tailleCase / 2, Pomme.pommey - tailleCase / 2, tailleCase/2, "red");
    }

    // vérifie le niveau et actualise le record
    function bestScore() {
        if (niveau === "Level: Easy") {
            if (score() <= localStorage['bestscoreEasy']) {
                menugameOver.style.display = "block";
            }
            else {
                localStorage['bestscoreEasy'] = score();
                menubestScore.style.display = "block";
            }
        }
        if (niveau === "Level: Medium") {
            if (score() <= localStorage['bestscoreMedium']) {
                menugameOver.style.display = "block";
            }
            else {
                localStorage['bestscoreMedium'] = score();
                menubestScore.style.display = "block";
            }
        }
        if (niveau === "Level: Hard") {
            if (score() <= localStorage['bestscoreHard']) {
                menugameOver.style.display = "block";
            }
            else {
                localStorage['bestscoreHard'] = score();
                menubestScore.style.display = "block";
            }
        }
    }

    function gameOver() {
        if((snake[0].x >= graphCanvas.width + tailleCase) || (snake[0].x <= 0) || (snake[0].y >= graphCanvas.height + tailleCase) || (snake[0].y <= 0)) {
            bestScore();
            return Fin; // Fin n'est pas défini, ca créé une erreur et arrête la boucle
        }
        for (index = 1; index <= snake.length - 1; index += 1){
            const x12 = snake[index].x;
            const y12 = snake[index].y;
            if (snake[0].x === x12 && snake[0].y === y12) {
                bestScore();
                return Fin;
            }
        }
    }

    //////////////////////////////////////// EVENEMENTS ////////////////////////////////////

    // boutons mobile
    boutonArrowUp.addEventListener('click', () => {
        if (timer > 0) return; // si timer > 0: pas d'addEventListener
        if (direction === "gauche" || direction === "droite") { // peut pas faire demi tour d'un coup
            direction = "haut";
            // timer pour eviter 2 actions sur la meme case
            timer = timeout; 
        }
    });

    boutonArrowRight.addEventListener('click', () => {
        if (timer > 0) return;
        if (direction === "haut" || direction === "bas"){
            direction = "droite";
            timer = timeout;
        }
    });

    boutonArrowDown.addEventListener('click', () => {
        if (timer > 0) return;
        if (direction === "gauche" || direction === "droite"){
            direction = "bas";
            timer = timeout;
        }
    });

    boutonArrowLeft.addEventListener('click', () => {
        if (timer > 0) return;
        if (direction === "haut" || direction === "bas"){ 
            direction = "gauche";
            timer = timeout; 
        } 
    });

    // clavier
    window.addEventListener('keydown', (event) => { 
        if (timer > 0) return;
        const name = event.key;
        if ((name === "ArrowLeft" ) || (name === "q" )) {
            if (direction === "haut" || direction === "bas"){ // peut pas faire demi tour d'un coup
                direction = "gauche";
                timer = timeout; // 15 est empirique
                // timer pour eviter 2 actions sur la meme case
            } 
        }
        if ((name === "ArrowRight" ) || (name === "d" )) {
            if (direction === "haut" || direction === "bas"){
                direction = "droite";
                timer = timeout;
            }
        }
        if ((name === "ArrowUp" ) || (name === "z" )){
            if (direction === "gauche" || direction === "droite") {
                direction = "haut";
                timer = timeout;
            }
        }
        if ((name === "ArrowDown" ) || (name === "s" )) {
            if (direction === "gauche" || direction === "droite"){
                direction = "bas";
                timer = timeout;
            }
        }
    });

    function loop(){
        contextscreen.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
        timer -= 1;
        snake_Affichage();
        rayonSnakeUp();
        pomme_Affichage();
        snake_Update();
        collisionPomme();
        if (init <= 0) { //empeche un bug au demarrage
            gameOver();
        }
        else {
            init -= 1;
        }
        scoregame.innerHTML = score();
        
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}
