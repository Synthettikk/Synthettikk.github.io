class Grid {
    constructor(){
        this.layer = layers.create();
        this.ctx = this.layer.getContext('2d');
        this.width = this.layer.width;
        this.height = this.layer.height;
        this.gridValues = {zerozero: undefined, subGap: undefined, subDivs: undefined, subsubDivs: undefined, subDivsMath: undefined};
        this.initGridValues();
    }

    resize() { // voir si l'héritage serait pas mieux
        this.layer.height = layers.height;
        this.layer.width = layers.width;
        this.height = layers.height;
        this.width = layers.width;
    }
    
    //calcul et renvoie les valeurs qui vont être utilisées pour tracer la grille
    initGridValues() { // 1subSubDiv = 24 pixels quand zoom = 1
        const zerozero = layers.mathToCanvasCoords(0, 0);
        const subDivs = [];
        const subDivsMath = []; // valeurs mathématiques correspondant aux subDivs du canvas
        const subsubDivs = [];
        // gap
        const subGap = layers.zoomCount % 2 === 0 ? 4 / layers.zoom : this.gridValues.subGap;
        const subsubGap = subGap / 5;
        const subGapOffsetX = gapRound(layers.xOffset, subGap);
        const subGapOffsetY = gapRound(layers.yOffset, subGap);
        const subDivsNb = Math.ceil(Math.max(this.width / 75, this.height / 75) / 2) * 2; // 75 = taille min en pixels des subdivs
        //calcul des subDivs
        for(let i = -(subDivsNb / 2 + 1) ; i <= subDivsNb / 2 + 1; i++){
            const xSubMath = i * subGap + subGapOffsetX;
            const ySubMath = i * subGap + subGapOffsetY;
            const subDiv = layers.mathToCanvasCoords(xSubMath, ySubMath);
            subDivs.push(subDiv);
            subDivsMath.push({x: xSubMath, y: ySubMath});
        }
        //calcul des subsubDivs
        for(let j = -(subDivsNb / 2 + 4) * 5; j <= (subDivsNb / 2 + 4) * 5; j++){
            const xSubSubMath = j * subsubGap + subGapOffsetX;
            const ySubSubMath = j * subsubGap + subGapOffsetY;
            const subsubDiv = layers.mathToCanvasCoords(xSubSubMath, ySubSubMath);
            subsubDivs.push(subsubDiv);
        }
        // diminue le garbage collector meme si pas parfait
        //this.gridValues = {zerozero: zerozero, subGap: subGap, subDivs: subDivs, subsubDivs: subsubDivs, subDivsMath: subDivsMath};
        this.gridValues.zerozero = zerozero;
        this.gridValues.subGap = subGap;
        this.gridValues.subDivs = subDivs;
        this.gridValues.subsubDivs = subsubDivs;
        this.gridValues.subDivsMath = subDivsMath;
    }

    //axe orthonormé
    traceAxis(gridValues) {
        //trace
        this.ctx.beginPath();
        //barre horizontale: va de x:0, y:0 -> x:max, y:0
        this.ctx.moveTo(0, gridValues.zerozero.y);
        this.ctx.lineTo(this.width, gridValues.zerozero.y);
        // barre verticale: va de 
        this.ctx.moveTo(gridValues.zerozero.x, 0);
        this.ctx.lineTo(gridValues.zerozero.x, this.height);
        // dessine
        this.ctx.strokeStyle = "rgb(0, 0, 0)";
        this.ctx.stroke();
    }

    traceGraduations(gridValues) {
        const zoomPowerOfTen = ceilToPowerOf10(layers.zoom); // sert à gérer la précision des graduations
        for(let i = 0; i < gridValues.subDivs.length; i++){
            const xGraduation = Math.round(gridValues.subDivsMath[i].x * zoomPowerOfTen) / zoomPowerOfTen; //gapRound marche pas
            const xGraduationWidth =  this.ctx.measureText(xGraduation).width;
            const xGraduationXPosition = gridValues.subDivs[i].x - xGraduationWidth / 2; // - xGraduationWidth / 2 pour centrer
            const yGraduation = Math.round(gridValues.subDivsMath[i].y * zoomPowerOfTen) / zoomPowerOfTen;
            const yGraduationYPosition = gridValues.subDivs[i].y + 2.5; //+2.5 car ca a l'air de bien marcher (arbitraire)
            // si zerozero.x,y (position des graduations) sont en dehors du canvas, on les met à la bordure
            ///// les y
            if(gridValues.zerozero.x < 0) {
                this.ctx.textAlign = "left";
                this.ctx.fillText(yGraduation, 0 + 2.5, yGraduationYPosition);
            } else if(gridValues.zerozero.x > this.width - xGraduationWidth){
                this.ctx.textAlign = "right";
                this.ctx.fillText(yGraduation, this.width, yGraduationYPosition);
            } else{
                this.ctx.textAlign = "left";
                this.ctx.fillText(yGraduation, gridValues.zerozero.x + 2.5, yGraduationYPosition);
            }
            ///// les x
            this.ctx.textAlign = "left";
            if(gridValues.zerozero.y < 0) {
                this.ctx.fillText(xGraduation, xGraduationXPosition, 0 + 10); // +10 en y pour le mettre sous la barre
            } else if(gridValues.zerozero.y > this.height - 15){
                this.ctx.fillText(xGraduation, xGraduationXPosition, this.height - 5); // -5 en y pour que ce depasse pas du canvas
            } else {
                this.ctx.fillText(xGraduation, xGraduationXPosition, gridValues.zerozero.y + 10); // +10 en y pour le mettre sous la barre
            }
        }
    }

    traceGrid() {
        //efface tout sur le layer grid avant de retracer
        this.ctx.clearRect(0, 0, this.width, this.height);
        // trace
        this.traceAxis(this.gridValues);
        this.traceSubAxis(this.gridValues);
        this.traceGraduations(this.gridValues);
        this.traceSubSubAxis(this.gridValues);
    }

    traceSubAxis(gridValues) { 
        this.ctx.beginPath();
        gridValues.subDivs.forEach(subDiv => {
            //barres horizontales
            this.ctx.moveTo(0, subDiv.y);
            this.ctx.lineTo(this.width, subDiv.y);
            //barres verticales
            this.ctx.moveTo(subDiv.x, 0);
            this.ctx.lineTo(subDiv.x, this.height);
        });
        this.ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.stroke();
    }

    traceSubSubAxis(gridValues) {
        this.ctx.beginPath();
        gridValues.subsubDivs.forEach(subsubDiv => {
            //barres horizontales
            this.ctx.moveTo(0, subsubDiv.y);
            this.ctx.lineTo(this.width, subsubDiv.y);
            //barres verticales
            this.ctx.moveTo(subsubDiv.x, 0);
            this.ctx.lineTo(subsubDiv.x, this.height);
        });
        this.ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        this.ctx.stroke();
    }
}
