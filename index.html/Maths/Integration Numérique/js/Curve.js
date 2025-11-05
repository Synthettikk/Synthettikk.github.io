class Curve {
    constructor(fct, vars){ // vars est un tableau de 1 elem; si +, il y a une vérif préalable et la classe est pas appelée
        // layer
        this.layer = layers.create();
        this.ctx = this.layer.getContext('2d');
        this.width = this.layer.width;
        this.height = this.layer.height;
        this.init(fct, vars)
        //tableaux fixes qui connaissent tous les pts de f dans l'intervalle affiché
        this.initGlobalArrs();
        //tableaux partiels qui connaissent les nouveaux pts de f qd offseting
        this.partialMathCoords = []; // 2
        this.partialCanvasCoords = []; // 3
        this.concatenation = [() => { // à gauche
                const nbPoints = this.mathCoords.length;
                this.mathCoords.unshift(...this.partialMathCoords);
                this.canvasCoords.unshift(...this.partialCanvasCoords);
                this.mathCoords.splice(nbPoints);
                this.canvasCoords.splice(nbPoints);
            }
            ,
            () => { // à droite
                const nbPoints = this.mathCoords.length;
                this.mathCoords.push(...this.partialMathCoords);
                this.canvasCoords.push(...this.partialCanvasCoords);
                this.mathCoords.splice(0, this.mathCoords.length - nbPoints);
                this.canvasCoords.splice(0, this.canvasCoords.length - nbPoints);
            }
        ];
    }

    resize() { // voir si l'héritage serait pas mieux
        this.layer.width = layers.width;
        this.layer.height = layers.height;
        this.width = this.layer.width;
        this.height = this.layer.height
    }

    // appelée à chaque clic sur le bouton Go
    init(fct, vars) {
        // fonction et vars correspondantes
        this.fct = fct;
        this.vars = vars;
        this.precisionFct = 0.01; // pourrait dépendre de la fct 
        this.initXGap();
    }

    chooseArray(number) { // number correspond au choix de tableau: voir commentaires constructor
        return [this.mathCoords, this.canvasCoords, this.partialMathCoords, this.partialCanvasCoords][number];
    }

    // crée un tableau contenant {x: undefined, y: undefined, isContToNextPoint: undefined} chaque point entre les 2 bornes
    // cest lui qu'on va modifier, remplir, etc
    initCurveArray(bounds) {
        // bornes deviennent un multiple de gap: permet de discrétiser les valeurs possibles de x
        const xInfGap = gapRound(bounds.inf, this.xGap);
        const xSupGap = gapRound(bounds.sup, this.xGap); 
        const nbPoints = Math.round((xSupGap - xInfGap) / this.xGap);
        const coordsWithContinuity = new Array(nbPoints);
        for(let i = 0; i < nbPoints; i++) {
            coordsWithContinuity[i] = {x: undefined, y: undefined, isContToNextPoint: undefined};
        }
        return coordsWithContinuity;
    }

    // à voir si ya pas moyen de regrouper cette méthode avec la suivante
    initGlobalArrs() {
        this.mathCoords = this.initCurveArray(layers.xBoundsReal);
        this.canvasCoords = this.initCurveArray(layers.xBoundsReal);
    }

    // arrayChoiceNumber doit etre le tableau de math de sorte que arrayChoiceNumber + 1 soit le meme tableau mais canvas
    initPartialArrs(bounds) {
        this.partialMathCoords = this.initCurveArray(bounds);
        this.partialCanvasCoords = this.initCurveArray(bounds);
    }

    // xGap change quand layers.zoom change
    initXGap() {
        this.xGap = this.precisionFct / layers.zoom;
    }

    // décale certains points pour les rapprocher de leur limite, 
    // ce qui améliore la précision de l'affichage
    adjustCoordsForContinuity(arrayChoiceNumber = 0) {
        const arrayChoiceMath = this.chooseArray(arrayChoiceNumber);
        const arrayChoiceCanvas = this.chooseArray(arrayChoiceNumber + 1);

        // init une valeur de continuité et donne la derniere
        // à gauche
        const xBeforeLeft = arrayChoiceMath[0].x - this.xGap;
        const yBeforeLeft = this.fct.evaluate({[this.vars[0]]: xBeforeLeft});
        const coord0Left = {xMath: xBeforeLeft, yMath: yBeforeLeft, yCanvas: null};
        const coord1Left = {xMath: arrayChoiceMath[0].x, yMath: arrayChoiceMath[0].y, yCanvas: null};
        let lastIsContToNextPoint = this.isContinuous(coord0Left, coord1Left, true);

        // à droite
        let isContToNextPoint = true;
        const xAfterRight = arrayChoiceMath[arrayChoiceMath.length - 1].x + this.xGap;
        const yAfterRight = this.fct.evaluate({[this.vars[0]]: xAfterRight});
        const coord0Right = {xMath: arrayChoiceMath[arrayChoiceMath.length - 1].x, yMath: arrayChoiceMath[arrayChoiceMath.length - 1].y, yCanvas: null};
        const coord1Right = {xMath: xAfterRight, yMath: yAfterRight, yCanvas: null};
        arrayChoiceMath[arrayChoiceMath.length - 1].isContToNextPoint = this.isContinuous(coord0Right, coord1Right, true);

        // PARCOURS LE TAB ET VERIFIE SI lastIsContToNextPoint EST IDENTIQUE A isContToNextPoint
        for(let i = 0; i < arrayChoiceMath.length; i++){
            isContToNextPoint = arrayChoiceMath[i].isContToNextPoint;
            if(isContToNextPoint !== lastIsContToNextPoint){ // changement dans la continuité
                const direction = +lastIsContToNextPoint - +isContToNextPoint; //-1 = gauche; +1 = droite
                // calcule des valeurs plus précises
                const preciseMathCoord = this.findDiscontinuity(arrayChoiceMath[i], direction, 0.000000000001 / layers.zoom, this.xGap);
                const preciseCanvasCoord = layers.mathToCanvasCoords(preciseMathCoord.x, preciseMathCoord.y);
                // remplace les anciennes coords par les precises
                arrayChoiceMath[i].x = preciseMathCoord.x;
                arrayChoiceMath[i].y = preciseMathCoord.y;
                arrayChoiceCanvas[i].x = preciseCanvasCoord.x;
                arrayChoiceCanvas[i].y = preciseCanvasCoord.y;
            }
            lastIsContToNextPoint = isContToNextPoint;
        }
    }

    // entre x0 = mathCoord0.x et x1 on a repéré un point de discontinuité (on sait pas exactement où): 
    // le but est de le situer entre 2 points distants au maximum de la precision demandée
    findDiscontinuity(mathCoord0, direction, precision, gap){ 
        if(gap < precision){ // le pt de discontinuité est localisé assez précisément: entre x0 et x1
            return mathCoord0;
        }
        gap = gap / 2;
        const x05 = mathCoord0.x + gap * direction;
        const y05 = this.fct.evaluate({[this.vars[0]]: x05});
        // si la discontinuité n'est pas entre x0 et x05, on recommence la recherche entre x05 et x1
        // formatage des args de isContinuous
        const coord0 = {xMath: mathCoord0.x, yMath: mathCoord0.y, yCanvas: null}; 
        const coord05 = {xMath: x05, yMath: y05, yCanvas: null};
        if(this.isContinuous(coord0, coord05, true)){
            return this.findDiscontinuity({x: x05, y: y05, isContToNextPoint: mathCoord0.isContToNextPoint}, direction, precision, gap);
        }
        // sinon on continue entre x05 et x1
        return this.findDiscontinuity(mathCoord0, direction, precision, gap); 
    }

    // le tableau doit etre initialisé à l'avance
    getAllCoords(xLeft, arrayChoiceNumber = 0) {
        this.updateXCoords(xLeft, arrayChoiceNumber);
        this.updateYCoords(arrayChoiceNumber);
        this.updateCanvasCoords(arrayChoiceNumber);
        this.updateContinuity(arrayChoiceNumber);
        this.adjustCoordsForContinuity(arrayChoiceNumber);
    }

    // prend en entrée 2 points unité maths et eventuellement avec la coord yCanvas si deja connue
    // vérifie si la fct est "continue" jusqu'au point suivant
    isContinuous(coord0, coord1, needCanvasCoords) {
        // parfois les canvasCoords sont deja connues mais sinon on les calcule
        if (needCanvasCoords) {
            coord0.yCanvas = layers.mathToCanvasCoordsY(coord0.yMath);
            coord1.yCanvas = layers.mathToCanvasCoordsY(coord1.yMath);
        }
        // vérif de la continuité
        if (Math.abs(coord1.yCanvas - coord0.yCanvas) < 5) { //si continuité visuelle
            return true; // si continuité visuelle
        }
        const yGap = Math.abs(coord1.yMath - coord0.yMath);
        const x05 = coord0.xMath + (coord1.xMath - coord0.xMath) / 2; //x_(1/2)
        const y05 = this.fct.evaluate({[this.vars[0]]: x05});
        //verifie si la distance (math) entre y0 et y_(1/2) est plus grand que entre y0 et y1
        return Math.abs(coord0.yMath - y05) < yGap && Math.abs(y05 - coord1.yMath) < yGap;
    }

    // arrayChoiceNumber doit etre le tableau de math de sorte que arrayChoiceNumber + 1 soit le meme tableau mais canvas
    // car on a besoin du tab de math pour update celui de canvas
    updateCanvasCoords(arrayChoiceNumber = 0) {
        const arrayChoiceMath = this.chooseArray(arrayChoiceNumber);
        const arrayChoiceCanvas = this.chooseArray(arrayChoiceNumber + 1);
        for(let i = 0; i < arrayChoiceMath.length; i++){
            const xCanvasCoord = layers.mathToCanvasCoordsX(arrayChoiceMath[i].x);
            const yCanvasCoord = layers.mathToCanvasCoordsY(arrayChoiceMath[i].y);
            arrayChoiceCanvas[i].x = xCanvasCoord;
            arrayChoiceCanvas[i].y = yCanvasCoord;
        }
    }

    // arrayChoiceNumber doit etre le tableau de math de sorte que arrayChoiceNumber + 1 soit le meme tableau mais canvas
    // car on veut modifier le tableau des coords math et celui canvas
    updateContinuity(arrayChoiceNumber = 0) {
        const arrayChoiceMath = this.chooseArray(arrayChoiceNumber);
        const arrayChoiceCanvas = this.chooseArray(arrayChoiceNumber + 1);
        for(let i = 0; i < arrayChoiceMath.length - 1; i++){
            // formatage des args de isContinuous
            const coord0 = {xMath: arrayChoiceMath[i].x, yMath: arrayChoiceMath[i].y, yCanvas: arrayChoiceCanvas[i].y}; 
            const coord1 = {xMath: arrayChoiceMath[i + 1].x, yMath: arrayChoiceMath[i + 1].y, yCanvas: arrayChoiceCanvas[i + 1].y};
            // vérif de la continuité
            const isContToNextPoint = this.isContinuous(coord0, coord1, false);
            // update
            arrayChoiceMath[i].isContToNextPoint = isContToNextPoint;
            arrayChoiceCanvas[i].isContToNextPoint = isContToNextPoint;
        }
    }

    updateXCoords(xLeft, arrayChoiceNumber = 0) { //arrayChoiceNumber est un entier entre 0 et 3
        const arrayChoice = this.chooseArray(arrayChoiceNumber);
        // bornes deviennent un multiple de gap: permet de discrétiser les valeurs possibles de x
        const xInfGap = gapRound(xLeft, this.xGap);

        for(let i = 0; i < arrayChoice.length; i++){
            arrayChoice[i].x = xInfGap + i * this.xGap;
        }
    }

    updateYCoords(arrayChoiceNumber = 0) {
        const arrayChoice = this.chooseArray(arrayChoiceNumber);
        // A CHANGER: f doit etre une propriété de this ou au moins passée à curve ET la var x doit etre adaptée en fct de l'expr
        for(let i = 0; i < arrayChoice.length; i++){
            arrayChoice[i].y = this.fct.evaluate({[this.vars[0]]: arrayChoice[i].x});
        }
    }

    traceCurve() {
        // efface avant de redessiner par dessus: 1 courbe = 1 layer
        this.ctx.clearRect(0, 0, this.width, this.height);
        //INITIALISATION: on a besoin de faire un 1er moveTo vers le 1er pt
        let yCanvasCoord = clamp(this.canvasCoords[0].y, 0, this.height); // evite que le premier point soit trop loin en dehors du canvas: evite un bug
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvasCoords[0].x, yCanvasCoord);

        //PARCOURS DU TABLEAU
        for(let i = 1; i < this.canvasCoords.length; i++){
            // gere les coords en dehors du canvas
            yCanvasCoord = clamp(this.canvasCoords[i].y, -5, this.height + 5); // evite que le point soit trop loin en dehors du canvas: evite un bug
            if(this.canvasCoords[i - 1].isContToNextPoint){
                this.ctx.lineTo(this.canvasCoords[i].x, yCanvasCoord);
            } else{
                this.ctx.moveTo(this.canvasCoords[i].x, yCanvasCoord);
            }
        }
        this.ctx.strokeStyle = "rgb(255, 0, 0)"; // changer couleur par fct si pls fct...
        this.ctx.stroke();
    }
}