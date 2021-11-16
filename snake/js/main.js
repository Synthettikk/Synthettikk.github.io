// snake

const graphCanvas = document.getElementById("screen");
const contextscreen = graphCanvas.getContext("2d");

// Flèches pour mobile
const boutonArrowUp = document.getElementById("arrowup");
const boutonArrowRight = document.getElementById("arrowright");
const boutonArrowDown = document.getElementById("arrowdown");
const boutonArrowLeft = document.getElementById("arrowleft");

function game() {
    let timer = 0; // compte les images apres un evenement clavier
    let nombreImages = 0;
    let rayonSnake = 0; // le rayon des billes du snake ont un rayon = 0 à la premiere image
    let colorSnake = "#FFC264"
    const start = Date.now();

    function freqScreen() {
        const time = Date.now() - start;
        freq = Math.round(nombreImages / (time / 1000)); // time est en millisecondes -> on le passe en secondes pour avoir des Herz
        console.log(freq, time);
        return freq;
    }

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
        snake.forEach( bodycell => {
            if ((pommex === bodycell.x) && (pommey === bodycell.y)) { // ne doit pas pop sur le snake
                return genere_Pomme();
            }
            // marche pas...
            // else {
            //     return ({pommex, pommey});
            // }
                //pas besoin de faire quoique ce soit, si les coord conviennent on les renvoie
        });
        return ({pommex, pommey});
    }

    let Pomme = genere_Pomme(); // on veut pas qu'il change à chaque image

    function snake_Update(){ // on fait se déplacer snake 
        // const longueurSnake = snake.length;
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
        const x0 = head.x + ((vitesse) * (144 / freqScreen())) * dx; // coord continue, x0 prend la nouvelle valeur de head.x
        const y0 = head.y + ((vitesse) * (144 / freqScreen())) * dy;
        const x = (coordToGrille(x0, y0).abscisse); // coord discrète de head
        const y = (coordToGrille(x0, y0).ordonnee);
        head.x = x0;
        head.y = y0;
        // let queuebefore = snake[longueurSnake - 1];
        if ((xbefore != x) || (ybefore != y)) {
            snake.unshift({x, y});
            // const queuebefore = snake[longueurSnake];
            snake.pop();
        }
        // return queuebefore;
        // else on fait rien
    }

    function collisionPomme() {
        if (Pomme.pommex === snake[0].x && Pomme.pommey === snake[0].y) { // quand head touche pomme,
            Pomme = genere_Pomme(); // fait pop pomme ailleurs
            // fait grandir snake
            const queuebefore = graphCanvas.height + tailleCase;
            snake.push({queuebefore, queuebefore});
        }
    }

    function score() {
        return snake.length * 100 + Math.round(((nombreImages * 144) / freq) / 100) - 400;
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

    function rayonSnakeUp(){
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

    function loop(){

        freqScreen();

        contextscreen.clearRect(0, 0, graphCanvas.width, graphCanvas.height);

        boutonArrowUp.addEventListener('click', () => {
            if (direction === "gauche" || direction === "droite") {
                direction = "haut";
                timer = 15 * (freqScreen() / 144);
            }
        });

        boutonArrowRight.addEventListener('click', () => {
            if (direction === "haut" || direction === "bas"){
                direction = "droite";
                timer = 15 * (freqScreen() / 144);
            }
        });

        boutonArrowDown.addEventListener('click', () => {
            if (direction === "gauche" || direction === "droite"){
                direction = "bas";
                timer = 15 * (freqScreen() / 144);
            }
        });

        boutonArrowLeft.addEventListener('click', () => {
            if (direction === "haut" || direction === "bas"){ // peut pas faire demi tour d'un coup
                direction = "gauche";
                timer = 15 * (freqScreen() / 144); // 15 est empirique
                // timer pour eviter 2 actions sur la meme case
            } 
        });

        // clavier
        
        window.addEventListener('keydown', (event) => { 
            const name = event.key;
            if ((name === "ArrowLeft" && timer <= 0) || (name === "q" && timer <= 0)) {
                if (direction === "haut" || direction === "bas"){ // peut pas faire demi tour d'un coup
                    direction = "gauche";
                    timer = 15 * (freqScreen() / 144); // 15 est empirique
                    // timer pour eviter 2 actions sur la meme case
                } 
            }
            if ((name === "ArrowRight" && timer <= 0) || (name === "d" && timer <= 0)) {
                if (direction === "haut" || direction === "bas"){
                    direction = "droite";
                    timer = 15 * (freqScreen() / 144);
                }
            }
            if ((name === "ArrowUp" && timer <= 0) || (name === "z" && timer <= 0)){
                if (direction === "gauche" || direction === "droite") {
                    direction = "haut";
                    timer = 15 * (freqScreen() / 144);
                }
            }
            if ((name === "ArrowDown" && timer <= 0) || (name === "s" && timer <= 0)) {
                if (direction === "gauche" || direction === "droite"){
                    direction = "bas";
                    timer = 15 * (freqScreen() / 144);
                }
            }
        }, false);

        timer -= 1;
        nombreImages += 1;

        snake_Affichage();
        rayonSnakeUp();
        pomme_Affichage();
        snake_Update();
        collisionPomme();
        gameOver();
        scoregame.innerHTML = score();

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

//////////////////////////////////////// MENU //////////////////////////////////////////////////

const bouton_easy = document.getElementById("boutonEasy");
const bouton_medium = document.getElementById("boutonMedium");
const bouton_hard = document.getElementById("boutonHard");
const menu = document.getElementById("menu");
const menugameOver = document.getElementById("gameOver");
const level = document.getElementById("lvl");
const scoregame = document.getElementById("score");
const menubestScore = document.getElementById("bestScore");
const recordlvl = document.getElementById("best_score");


let niveau;

// initialise les scores à 0
if (localStorage.length === 0) {
    localStorage.setItem('bestscoreEasy', 0);
    localStorage.setItem('bestscoreMedium', 0);
    localStorage.setItem('bestscoreHard', 0);
}

bouton_easy.addEventListener("click", () =>{
    vitesse = 1/2;
    niveau = "Level: Easy";
    level.innerHTML = niveau;
    recordlvl.innerHTML = localStorage['bestscoreEasy'];
    menu.style.display = "none";
    game();
});

bouton_medium.addEventListener("click", () =>{
    vitesse = 1;
    niveau = "Level: Medium";
    level.innerHTML = niveau;
    recordlvl.innerHTML = localStorage['bestscoreMedium'];
    menu.style.display = "none";
    game();
});

bouton_hard.addEventListener("click", () => {
    vitesse = 5/3;
    niveau = "Level: Hard";
    level.innerHTML = niveau;
    recordlvl.innerHTML = localStorage['bestscoreHard'];
    menu.style.display = "none";
    game();
});






