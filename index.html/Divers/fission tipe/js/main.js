const freqEcran = 144; // à changer en fonction de l'écran
let nbImages = 0;


///////////////////////////////////////////// BARRE //////////////////////////////////////////////////


const rayonUranium = 3;
const barreCanvas = document.getElementById("screen");
const contextBarre = barreCanvas.getContext("2d");
const espace_billes = 4 * rayonUranium;
const largeur_barre = 0.6 * barreCanvas.width; 
const decale_barre = (barreCanvas.width - largeur_barre) / 2;


function reste(coord, espace_billes) { // donne l'ecart entre coord et la ligne/colonne la plus proche
    resultat = coord % espace_billes;
    if (resultat > espace_billes / 2) {
        resultat = espace_billes - resultat;
    };
    return Math.abs(resultat);
}

function coordToTableau(x, y) { 
    const numLigne = Math.round(y / espace_billes);
    let offset = 0;

    if (numLigne % 2 !== 0) {
        // si ligne impaire, decale de 2 * rayonUranium
        offset = 2 * rayonUranium;
    }
    let numColonne = (x - decale_barre - offset) / espace_billes;
    numColonne = Math.abs(numColonne);
    numColonne = Math.round(numColonne);
    return ({numColonne, numLigne})
    // return barre[numLigne][numColonne]; // 1ere ligne/colonne est numérotée 0
}

function cercle(x, y, rayonUranium, couleur){ // créé un cercle et l'affiche
    contextBarre.beginPath();
    contextBarre.fillStyle = couleur;
    contextBarre.arc(x, y, rayonUranium, 0, 2 * Math.PI); // quartier de cercle va de l'angle 0 à 2pi
    contextBarre.fill();
}

function barreInit() { // créé les coordonnées des noyaux de la barre
    const barre = [];
    // const largeur_barre = 0.6 * barreCanvas.width; 
    const hauteur_barre = barreCanvas.height;
    let comptUranium = 0;
    for (let lignei = 0; lignei <= hauteur_barre; lignei += espace_billes) { 
        // debut: lignei = 0, fin: lignei = hauteur barre, indentation: va de espace_billes en espaces_billes
        const ligne = [];
        let x; 
        let alternateur = 0;
        const y = lignei;
        // on construit les lignes
        for (let colonnej = 0; colonnej < largeur_barre; colonnej += espace_billes) {
            x = colonnej + decale_barre; // centre la barre
            if (lignei % (2 * espace_billes) !== 0) {
                // si ligne impaire, decale de 2 * rayonUranium pixels
                x += 2 * rayonUranium;
            }
            ligne.push({x, y, fissible: true, comptUranium, alternateur}); 
        }
        // ajoute les coordonnées, l'état fissible dans ligne et un compteur(correspond à 1 noyau d'uranium)
        barre.push(ligne); // ajoute tous les noyaux d'une ligne dans le tableau barre
    }
    return barre;
}

const barre = barreInit(rayonUranium);

function couleurUranium(x, y) {
    let couleur = "white";
    //
    // const {numColonne, numLigne} = coordToTableau(x, y)
    //
    i = coordToTableau(x, y).numColonne // numero de la colonne
    j = coordToTableau(x, y).numLigne // numero de la ligne
    if (barre[j][i].fissible === false) {
        // si fissible est faux (s'il y a eu collision), l'uranium devient rouge
        couleur = "red";
    }
    return couleur;
}

function vibration() { // effet de vibration sur les uraniums collisionnés
    const freqVibre = 4; // toutes les 4 sec
    const forceVibre = rayonUranium / 5; // deplacement à chaque vibration (en pixels), 5 est empirique
    barre.forEach ( ligne => {
        ligne.forEach ( noyau => { 
            if (noyau.fissible === false) { // pour tout noyau collisionné:
                noyau.alternateur += 1; 
                // toutes les 3 images:
                if (noyau.alternateur % (2 * freqVibre) === 0) { // une fois sur deux
                    noyau.x += forceVibre;
                    noyau.y += forceVibre;
                    return;
                }
                if (noyau.alternateur % freqVibre === 0) { // si la premiere propriété n'est pas vérifiée
                    noyau.x -= forceVibre;
                    noyau.y -= forceVibre;
                }
            }
        });
    });
}

function barreAffichage() {
    barre.forEach ( ligne => {
        ligne.forEach ( noyau => {
            const x = noyau.x; // prend la coord x d'1 noyau
            const y = noyau.y; // prend la coord y du même noyau
            cercle(x, y, rayonUranium, couleurUranium(x, y));
        });
    });
}

let neutronz = []; // tableau contenant les neutrons (population de neutrons)

function neutronCreate(x, y, angle, vitesse) {
    neutronz.push({x, y, angle, vitesse}); // ajoute le neutron au tableau
}

function neutronReaction(x, y) {
    let i = 0
    while (i < 2) { // créé 2 neutrons en + par reaction
        const angle = 2 * Math.PI * Math.random() - Math.PI; // angle de -pi à pi
        const vitesse = 2; // 2 fois + rapide que ceux de base
        neutronCreate(x, y, angle, vitesse);
        i += 1;
    }
}

function explosion() {
    const tempsExplo = freqEcran / 6;
    barre.forEach( ligne => { // barre est un tableau à 2 dim contenant des lignes (tableau)
        ligne.forEach  ( uranium => { // ligne est un tableau contenant les uraniums
            if (uranium.comptUranium === tempsExplo) return; // s'arrête après tempsExplo images
            let rayonExplo = (5 * rayonUranium) - ((5 * rayonUranium) / tempsExplo) * uranium.comptUranium; // rayon de départ = 5 * rayonUranium
            uranium.comptUranium += 1; // 0-->tempsExplo
            cercle(uranium.x, uranium.y, rayonExplo, "#FFF9AD"); // affiche l'explosion (à bouger)
        });
    });
}

function neutronAffichage(neutronz) {
    neutronz.forEach( neutron => { // pour chaque neutron dans le tableau... vert: #25FC25 bleu: #0640FD
        cercle(neutron.x, neutron.y, rayonUranium / 2, "#4c8bffff"); //...affiche le cercle correspondant
     });
}

function neutronUpdate() {
    const newNeutronz = [];
    neutronz.forEach( neutron => {
        const dx = Math.cos(neutron.angle) * neutron.vitesse; // conf. projection de vecteurs
        const dy = Math.sin(neutron.angle) * neutron.vitesse; // same
        neutron.x += dx; // deplacement en x
        neutron.y += dy; // deplacement en y
    });
    // conserve uniquement les neutrons dans le barreCanvas
    neutronz.forEach(neutron => {
        if (neutron.x > 0 && neutron.x < barreCanvas.width && neutron.y > 0 && neutron.y < barreCanvas.height ) {
            // si neutron dans barreCanvas, ajoute neutron dans un nouveau tableau
            newNeutronz.push(neutron);
        }
    });
    neutronz = newNeutronz; // update de neutronz
}

let energie = 0; // compte l'énergie libérée depuis le début de la simulation

function collision() {
    const delta = rayonUranium / 10 // distance à laquelle on détecte la collision, 10 est empirique
    neutronz.forEach( neutron  => {
        let x = neutron.x; // corrd x du neutron
        let y = neutron.y; // coord y du neutron
        if (reste(y, espace_billes) > delta) return; // si on est pas sur une ligne (à delta près), fin
        if (x < decale_barre || x > barreCanvas.width - decale_barre - 2 * rayonUranium) return; // si on est pas dans la barre, fin
        let offset = 0;
        if (reste(y, (2 * espace_billes)) > 2 * rayonUranium) {
            // si ligne impaire, décale de 2 * rayonUranium
            offset = 2 * rayonUranium;
        }

        if (reste(x - decale_barre - offset, espace_billes) < delta) {
            const uranium = barre[coordToTableau(x, y).numLigne][coordToTableau(x, y).numColonne];
            // si x sur un uranium (à delta près)
            if (uranium.fissible === false) return; // si cet uranium a déjà reagi

            uranium.fissible = false; // ne peut plus réagir
            uranium.comptUranium = 0; // démarre le compteur pour la durée d'explosion
            neutronReaction(x, y); // créé les neutrons liés à la réaction (2)
            neutron.angle = 2 * Math.PI * Math.random() - Math.PI; // angle de -pi à pi
            neutron.vitesse = 2; // 2 fois + rapide que ceux de base
            energie += 60 * rayonUranium; // chaque reaction = 60 * rayonUranium energie, 60 empirique
        }
    });
}


///////////////////////////////////////////// GRAPHE /////////////////////////////////////////////////


const graphCanvas = document.getElementById("collisions");
const contextGraphe = graphCanvas.getContext("2d");
const largeur_graphe = graphCanvas.width;
const hauteur_graphe = graphCanvas.height;
let compteur = 0;

function rectangle(x, y, largeur, hauteur) { // affiche 1 rectangle
    contextGraphe.fillStyle = "grey";
    contextGraphe.fillRect(x, y, largeur, hauteur); // x, y, largeur, hauteur
}

function comptDecalage() { // commence à 0, à chaque image prend +1, 
    if (compteur < largeur_graphe) { // si = largeur_graphe: stop
        compteur += 1;
    } 
    return compteur;
}

compteur = comptDecalage();

function lissage() {
    if (nbImages === ((2 * rayonUranium) * freqEcran)) { // lisse sur (2 * rayonUranium) secondes
        energie -= (1/((2 * rayonUranium) * freqEcran)) * energie;
    }
    else {
        nbImages += 1; // nb d'images sur lequel le graphe est lissé
    }
}

let picz = [];

function picCreate() { // à chaque image créé un nouveau pic
    const x = compteur; // à chaque image, x = x + 1, si x = largeur_graphe, x reste constant mais décale tous les autres pics de 1
    const y = hauteur_graphe; // bas du canvas
    const largeur = 1;
    const hauteur =  (- energie / (nbImages + 1)) * (2 * rayonUranium); // négatif car y augmente en descendant, 2 est empirique
    picz.push({x, y, largeur, hauteur});
}


function picUpdate() {
// actualise picz à chaque image
    if (compteur === largeur_graphe) {
        // supprime le premier pic et decale tous les pics, ie: x = x - 1 pr tt pic
        picz.shift(); // retire le premier élément du tableau
        picz.forEach( pic => {
            pic.x -= 1;
        });
    }
}

function picsAffichage() {
    // affiche tous les pics dans le canvas
    picz.forEach ( pic => {
        rectangle(pic.x, pic.y, pic.largeur, pic.hauteur);
    });
}


/////////////////////////////////////////////// LOOP /////////////////////////////////////////////////


function loop() {
    contextBarre.clearRect(0, 0, barreCanvas.width, barreCanvas.height); // efface le barreCanvas
    // (car on le réaffiche modifié à chaque image) 
    contextGraphe.clearRect(0, 0, graphCanvas.width, graphCanvas.height) // same pour graphCanvas
    if (Math.random() < (25 / rayonUranium) / freqEcran) { // créé nb neutrons par seconde(1sec = freqEcran images, dépend des écrans), 25 empirique
        neutronCreate(0, Math.random() * barreCanvas.height, Math.random() * 2/3 * Math.PI - Math.PI / 3, 1);
        // x = 0, y aléatoire(dans le barreCanvas), angle entre + et - pi/3, vitesse = 1
    }
    vibration();
    barreAffichage();
    neutronUpdate();
    neutronAffichage(neutronz);
    collision();
    explosion();
    picCreate();
    picUpdate();
    picsAffichage();
    comptDecalage();
    lissage();
    requestAnimationFrame(loop); // prépare dès que possible à relancer loop(), 
    // dépend de la fréquence de rafraichissement de l'écran
}
requestAnimationFrame(loop);




