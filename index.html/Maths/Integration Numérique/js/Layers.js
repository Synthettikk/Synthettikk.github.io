class Layers {
    constructor() {
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.init();
        this.resize();
    }

    // init les vars globales d'etat du canvas: offsets, zoom etc
    init(y = 0) {
        this.isOffseting = false;
        this.xOffset = 0;
        if(isReal(y)){
            this.yOffset = y; // y sert à centrer des fct en y = f(0) quand la valeur en x = 0 est loin de y = 0 (et qu'elle est réelle)
        } else {
            this.yOffset = 0;
        }
        this.zoom = 4;
        this.zoomCount = 0;
        this.xBoundsReal = {inf: this.canvasToMathCoordsX(0), sup: this.canvasToMathCoordsX(this.width)};
    }

    resize() {
        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.heightOver2 = this.height / 2; // souvent utiles: on les calc 1 seule fois ici
        this.widthOver2 = this.width / 2;
        this.updateBounds();
    }

    // efface le canvas
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    canvasToMathCoords(X, Y){ //X, Y unité canvas, les offset en unité maths
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
        // x = x + xOffset; // applique l'offset: indépendant du zoom
        // y = y + yOffset;
        //return {x: x, y: y};
        return {x: this.canvasToMathCoordsX(X), y: this.canvasToMathCoordsY(Y)};
    }

    canvasToMathCoordsX(X){ //X unité canvas, offset en unité maths
        //voir fct canvasToMathCoords pour les explications
        return ((X - this.widthOver2) / 30) / this.zoom + this.xOffset;
    }
    
    canvasToMathCoordsY(Y){ //Y unité canvas, offset en unité maths
        //voir fct canvasToMathCoords pour les explications
        return ((this.heightOver2 - Y) / 30) / this.zoom + this.yOffset;
    }

    create() {
        const canvas = document.createElement('canvas');
        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;
        return canvas;
    }

    drawAll() {
        // efface tout avant de tracer
        this.clear();
        // dessine le tout sur le canvas: mettre une boucle si pls fct / integrales
        this.ctx.drawImage(grid.layer, 0, 0);
        this.ctx.drawImage(curve0.layer, 0, 0);
        if (integral0.isDraw) {
            this.ctx.drawImage(integral0.layer, 0, 0);
        }
    }

    getMousePosition(event) {
        this.mousePositionX = event.offsetX;
        this.mousePositionY = event.offsetY;
    }

    // quand offseting, donne les bornes de la parcelle ajoutée
    getPartialBounds() {
        // delta donne la diff entre l'inf updated et l'ancien
        const newXInf = this.canvasToMathCoordsX(0);
        const newXSup = this.canvasToMathCoordsX(this.canvas.width);
        const delta = newXInf - this.xBoundsReal.inf;
        if(delta < 0){ // décalage vers la gauche
            this.partialBounds = {side: 0, inf: newXInf, sup: this.xBoundsReal.inf};
        } else{ // décalage vers la droite
            this.partialBounds = {side: 1, inf: this.xBoundsReal.sup, sup: newXSup};
        }
    }

    offseting(event) {
        const newMousePositionX = event.offsetX;
        const newMousePositionY = event.offsetY;
        const newXOffset = this.canvasToMathCoordsX(this.mousePositionX) - this.canvasToMathCoordsX(newMousePositionX);
        const newYOffset = this.canvasToMathCoordsY(this.mousePositionY) - this.canvasToMathCoordsY(newMousePositionY);
        this.xOffset += newXOffset;
        this.yOffset += newYOffset;
        // update la position de la souris
        this.mousePositionX = newMousePositionX;
        this.mousePositionY = newMousePositionY;
        this.getPartialBounds();
        this.updateBounds();
    }

    //fonction inverse de canvasToMathCoords
    mathToCanvasCoords(x, y){ //entrée en unité maths
        return {x: this.mathToCanvasCoordsX(x), y: this.mathToCanvasCoordsY(y)};
    }

    //fonction inverse de canvasToMathCoordsX
    mathToCanvasCoordsX(x){ //entrée en unité maths
        return (x - this.xOffset) * this.zoom * 30 + this.widthOver2;
    }

    //fonction inverse de canvasToMathCoordsX
    mathToCanvasCoordsY(y){ //entrée en unité maths
        return -(y - this.yOffset) * this.zoom * 30 + this.heightOver2;
    }

    // quand zoom ou offset
    updateBounds() {
        this.xBoundsReal.inf = this.canvasToMathCoordsX(0);
        this.xBoundsReal.sup = this.canvasToMathCoordsX(this.width);
    }

    zooming(e) { // e pour event
        e.preventDefault(); //empeche le scroll de la page
        const xCanvasMouseCoord = e.offsetX; // change pas 
        const yCanvasMouseCoord = e.offsetY; // change pas
        const oldMathMouseCoords = this.canvasToMathCoords(xCanvasMouseCoord, yCanvasMouseCoord);
        // il faut obtenir les coords de la souris, les passer en coords x, y
        // mathématiques, appliquer le zoom, réobtenir les coords de la souris
        // en x, y mathématiques: il auront donc changé car la souris a pas bougé
        // mais il y a eu zoom
        // on compense ce décalage en ajoutant les offset x et y coorespondants
        // à la différence de pos. de la souris (entre nouveau et ancien)
        //de manière à ce qu'ils redeviennent identiques à ceux de depart
        if(e.deltaY < 0){
            this.zoom *= this.zoomManage(this.zoomCount); // 2^(1/2) ou (5/2)^(1/2)
            this.zoomCount += 1;
        }
        //dezoom
        else{
            this.zoomCount -= 1;
            this.zoom /= this.zoomManage(this.zoomCount); // 2^(1/2) ou (5/2)^(1/2)
        }
        // update des offsets
        const newMathMouseCoords = this.canvasToMathCoords(xCanvasMouseCoord, yCanvasMouseCoord);
        this.xOffset += oldMathMouseCoords.x - newMathMouseCoords.x;
        this.yOffset += oldMathMouseCoords.y - newMathMouseCoords.y;
        // il faut update les offsets unité canvas ?
        // update des bornes
        this.updateBounds();
    }

    //en fonction de zoom count renvoie le zoom à appliquer
    zoomManage() {
        if(modulo(this.zoomCount, 6) > 1) return 1.4142135623730951; // 2^(1/2)
        return 1.5811388300841898; // (5/2)^(1/2)
    }
}

//const layers = new Layers();

