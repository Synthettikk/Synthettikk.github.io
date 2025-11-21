class Deformed{
    constructor(){
        this.layer = layers.create();
        this.ctx = this.layer.getContext('2d');
        this.width = this.layer.width;
        this.height = this.layer.height;
        this.resize();
    }

    drawDeformed(factor, m){
        // clear this canvas first
        layers.clear(this.ctx);

        // draw
        // calc position of the moving grid
        const matrix = lerpMatrix(m, smoothstep, factor);
        const [am, bm, cm ,dm] = matrix;
        // the slopes are equal for all transformed abscisses
        // calculate the equation of the transformed vector 0,0,1,0 (x axis)
        const ax = getCoeff(0, 0, am, cm);
        // calculate the equation of the transformed vector 0,0,0,1 (y axis)
        const ay = getCoeff(0, 0, bm, dm);
        // get transformed vector1 (0,1,1,1) // x axis, 1st line with y=1
        const [x1, y1] = matrixPoint(matrix, [0, 1]);
        // get transformed vector1 (0,1,1,1) // x axis, 1st line with y=1
        const [x2, y2] = matrixPoint(matrix, [1, 0]);

        // draw the moving grid
        //subsubdivs : we hide them (its too much)
        // parallels([x1, y1], ax, 20);
        // parallels([x2, y2], ay, 20);
        // const absColor = lerpColor('rgba(139,0,0,1)', 'rgba(255,0,0,1)', factor); // 'red'
        // const ordColor = lerpColor('rgba(0,128,0,1)', 'rgba(0,255,0,1)', factor); // 'lime'
        const absColor = lerpColor('rgba(0, 145, 202, 0.9)', 'rgba(0, 217, 255, 1)', factor); // 'red'
        const ordColor = lerpColor('rgba(197, 201, 0, 0.9)', 'rgba(255, 255, 0, 1)', factor); // 'lime'
        //console.log(absColor);
        //const ordColor = lerpColor('')
        //subdivs
        layers.parallels(this.ctx, [x1, y1], ax, 100, absColor); // 'red'
        layers.parallels(this.ctx, [x2, y2], ay, 100, ordColor); //'lime
        // vectors of the base
        layers.drawArrow(this.ctx, x1,y1, ordColor);
        layers.drawArrow(this.ctx, x2,y2, absColor);
    }

    resize(){
        this.layer.height = window.innerHeight;
        this.layer.width = window.innerWidth;
        this.width = this.layer.width;
        this.height = this.layer.height;
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;
    }
}