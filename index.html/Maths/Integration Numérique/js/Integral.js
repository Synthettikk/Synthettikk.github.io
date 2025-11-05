class Integral {
    constructor(){
        // valeurs fixes
        // canvas
        this.layer = layers.create();
        this.ctx = this.layer.getContext('2d');
        this.width = this.layer.width;
        this.height = this.layer.height;
        // méthodes dans le select
        this.allCalcMethods = [this.calcRectangle, this.calcRectangle, this.calcRectangle]; // on a 3 méthodes de rectangle
        this.allTraceMethods = [this.traceRectangle, this.traceRectangle, this.traceRectangle];
        this.isValid = false; // vérif sur les entrées

        // valeurs variables
        //this.init();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    resize() { // voir si l'héritage serait pas mieux
        this.layer.height = layers.height;
        this.layer.width = layers.width;
        this.height = this.layer.height
        this.width = this.layer.width;
    }

    isEntryValid(){
        const left = this.leftEndpoint;
        const right = this.rightEndpoint;
        const n = this.nbSubdivs;

        if(left === right) return false;

        const isFiniteNumber = v => typeof v === 'number' && Number.isFinite(v);
        const isPositiveInteger = v => Number.isInteger(v) && v > 0;

        return isFiniteNumber(left) && isFiniteNumber(right) && isPositiveInteger(n);
    }

    init(n = 0) { // n correspond au numéro de la fct: sera utile quand on aura pls fcts
        // fonction et vars correspondantes
        this.fct = f0.fct;
        this.vars = f0.vars;
        // paramètres
        this.calcMethod = this.allCalcMethods[document.getElementById('method_choice').value];
        this.isDraw = document.getElementById("check_draw").checked;
        this.traceMethod = this.allTraceMethods[document.getElementById('method_choice').value];
        this.leftEndpoint = document.getElementById('left_endpoint').valueAsNumber; // a
        this.rightEndpoint = document.getElementById('right_endpoint').valueAsNumber; // b
        this.nbSubdivs = document.getElementById('integration_gap').valueAsNumber; // N
        this.delta = (this.rightEndpoint - this.leftEndpoint) / this.nbSubdivs; // Delta
        // this.rectangleSide = document.getElementById('rectangle_side').valueAsNumber;
        // rectangleSide depend mnt direct de la methode choisie gauche = 0, milieu = 1/2, droite = 1
        this.rectangleSide = document.getElementById('method_choice').value / 2;

        // vérif que les entrées sont ok 
        this.isValid = this.isEntryValid();
        if(this.isValid){
            document.querySelectorAll('#left_endpoint, #right_endpoint, #integration_gap')
            .forEach(el => el.style.border = '1px solid var(--muted)');
        } else{
            console.log('a != b doivent être des nombres finis et N un entier > 0.');
            document.querySelectorAll('#left_endpoint, #right_endpoint, #integration_gap')
            .forEach(el => el.style.border = '1px solid red');
            this.reset();
            return;
        }
        // si a > b, gere le signe
        if(this.leftEndpoint > this.rightEndpoint){
            [this.leftEndpoint, this.rightEndpoint] = [this.rightEndpoint, this.leftEndpoint]; // echange left et right
            //this.delta = -this.delta; // et inverse le signe
        }

        // résultats du calcul de l'intégrale
        this.approximateValue = 0;
        this.xTab = divideRange(this.leftEndpoint, this.rightEndpoint, Math.abs(this.delta)); // delta peut etre neg
        this.yTab = new Array(this.xTab.length - 1);
    }

    trace() {
        if(!this.isValid) return;
        // efface avant de redessiner par dessus: 1 intégrale = 1 layer
        this.clear();
        this.traceMethod();
    }

    integrate(){
        // init les arguments donnés en entrée par l'utilisateur
        this.init();
        // appelle la fonction d'intégration correspondante
        this.calcMethod();
        // affiche les traits d'intégration si voulu
        if(this.isDraw && this.yTab.length !== 0){ // à voir si la 2e cdt est nécessaire
            this.trace();
        }
    }

    reset(){
        document.querySelectorAll('#delta-result, #integral-result').forEach( elem => elem.innerText = ""); // vide les anciennes valeurs d'int
        this.xTab = [];
        this.yTab = [];
        this.clear();
        this.approximateValue = undefined;
        this.delta = undefined;
    }

    ////// METHODE DES RECTANGLES

    // side pour côté: gauche = 0 ou milieu = 1/2 ou droite = 1
    calcRectangle() {
        for(let i = 0; i < this.xTab.length - 1; i++){
            const y_i = this.fct.evaluate({[this.vars[0]]: this.xTab[i] + this.delta * this.rectangleSide});
            this.yTab[i] = y_i;
            this.approximateValue += this.delta * y_i;
        }       
    }

    // à opti
    traceRectangle() {
        this.ctx.beginPath();
        this.ctx.fillStyle = "rgba(255, 0, 0, 0.19)"; // couleur pourrait changer si pls fct
        // donne l'écart en pixels entre 2 x_n et x_n+1 du tableau x_table_integration (supposé constant)
        const deltaCanvas = layers.mathToCanvasCoordsX(this.xTab[1]) - layers.mathToCanvasCoordsX(this.xTab[0]);
        // suppose que tous les rectangles ont la mm largeur et on leur donne une largeur minimale pour que l'affichage soit correct
        // on considère que 0.01 est la précision maximale: descendre en dessous ne change rien visuellement
        const rectWidth = Math.max(deltaCanvas, 0.5); // ya un pb avec ca
        // dans 1 rectangle affiché, il peut y avoir un saut de pls x: incr est ce nb arrondi à l'entier du dessus
        const incr = Math.ceil(rectWidth / deltaCanvas);
        for(let i = 0; i < this.xTab.length - 1; i += incr){
            const startPoint = layers.mathToCanvasCoords(this.xTab[i], this.yTab[i]);
            const rectHeight = layers.mathToCanvasCoordsY(0) - startPoint.y;
            this.ctx.fillRect(startPoint.x, startPoint.y, rectWidth, rectHeight);
        }
    }

    ////// METHODE DES TRAPEZES

}