class Layers{
    constructor(){
        this.view = document.getElementById("view");
        this.ctx = this.view.getContext("2d");
        this.resize();
    }

    // efface le canvas
    clear(ctx) {
        ctx.clearRect(0, 0, this.width, this.height);
    }

    create() {
        const canvas = document.createElement('canvas');
        canvas.width = this.view.width;
        canvas.height = this.view.height;
        return canvas;
    }

    printAll() {
        // efface tout avant de tracer
        this.clear(this.ctx);
        // draw grid
        this.ctx.drawImage(grid.layer, 0, 0);
        this.ctx.drawImage(deformed.layer, 0, 0);
    }

    // clear all and draw the Base only
    reset() {
        // efface tout avant de tracer
        this.clear(this.ctx);
        // efface le layer grid et trace la nouvelle grid
        this.clear(grid.ctx);
        grid.drawGrid(); // devrait prendre la base en parametre (pas encore fait)
        // draw sur le canvas la grid
        this.ctx.drawImage(grid.layer, 0, 0);
    }

    drawArrow(ctx, x,y, color = 'red') {
        const x2 = x * 100;
        const y2 = y * 100;
        const vlength = Math.sqrt(x2*x2 + y2*y2);
        // length of the base MUST BE maxed out !
        const tempLength = 0.15;
        // max length (in pixels) = 20;
        const baseLength  = Math.sqrt((x2*tempLength)*(x2*tempLength) + (y2*tempLength)*(y2*tempLength))
        const maxed = Math.min(20, baseLength);
        const length = maxed / vlength;
        const base = [x2*length, y2*length];
        // get the coords of the base point
        const basePoint = [x2*(1-length), y2*(1-length)];
        // get the coords of one side of the arrow
        const point1 = [basePoint[0] - base[1]/2, basePoint[1] + base[0]/2];
        // get the other side
        const point2 = [basePoint[0] + base[1]/2, basePoint[1] - base[0]/2];
        // draw the triangle from points tip, point1, point2
        ctx.beginPath();
        ctx.moveTo(...(this.p2ctx([x2, y2])));
        ctx.lineTo(...(this.p2ctx(point1)));
        ctx.lineTo(...(this.p2ctx(point2)));
        ctx.lineTo(...(this.p2ctx([x2, y2])));
        ctx.fillStyle = color;
        ctx.fill();
        // draw the line of the vector
        ctx.beginPath();
        ctx.moveTo(...(this.p2ctx([0,0])));
        ctx.lineTo(...(this.p2ctx([x2*(1-length),y2*(1-length)])));
        // lineWidth = fraction of the length btw point1 & point2
        ctx.lineWidth = Math.sqrt((point1[0] - point2[0])*(point1[0] - point2[0])
                                + (point1[1] - point2[1])*(point1[1] - point2[1])) / 5;
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    drawLine(ctx, x0, y0, x1, y1, color, width = 1) {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    }

    draw2ctx(ctx, x0, y0, x1, y1, color, width = 1) {
        x0 = x0 + this.halfWidth;
        y0 = -y0 + this.halfHeight;
        x1 = x1 + this.halfWidth;
        y1 = -y1 + this.halfHeight;
        this.drawLine(ctx, x0, y0, x1, y1, color, width);
    }

    // take a equation of a line and returns the 2 points of this line at the extremity of the canvas
    getTouchingPoints(a, b){
        const points = [];
        const points2 = [];
        // check all bondaries of the canvas
        // TOP & BOTTOM ; y = -half, y = half
        [-this.halfHeight, this.halfHeight].forEach( y => {
            const x = (y - b) / a;
            if (x >= -this.halfWidth && x <= this.halfWidth && points.length < 4) {
                points.push(x, y);
                points2.push(-x, -y);
            }
        });
        // LEFT & RIGHT ; x = -half, x = half
        [-this.halfWidth, this.halfWidth].forEach( x => {
            const y = a * x + b;
            if (y >= -this.halfHeight && y <= this.halfHeight && points.length < 4) {
                points.push(x, y);
                points2.push(-x, -y);
            }
        })
        return [points, points2];
    }

    p2ctx(point) {
        return [point[0] + this.halfWidth, -point[1] + this.halfHeight];
    }

    // take a line equation and trace all its possible parallels spaced by "factor" in the canvas
    parallels(ctx, point, coef, factor, color = '#666') {
        let i = 0;
        const [x, y] = point;
        while (i < 8000) {
            const b = get_b(x, y, coef) * i;
            const [points, points2] = this.getTouchingPoints(coef, b);
            if (points.length !== 4 || (x === 0 && y === 0)) {
                break;
            }
            [points, points2].forEach( p => {
                this.draw2ctx(ctx, ...p, color);
            });
            i += factor;
        }
    }   

    // not used for the moment
    real(m) {
        // abscisses
        for (let i = -400; i<=400; i+=100) {
            const [x0,y0, x1,y1] = [...matrixPoint(m, [- this.halfWidth, i]), ...matrixPoint(m, [this.halfWidth, i])];
            this.drawLine(this.ctx, x0 + this.halfWidth, -y0 + this.halfHeight, x1 + this.halfWidth, -y1 + this.halfHeight, 'Red', 2);
        }

        // ordonnées
        for (let i = -400; i<=400; i+=100) {
            const [x0,y0, x1,y1] = [...matrixPoint(m, [i, -this.halfHeight]), ...matrixPoint(m, [i, half])];
            drawLine(this.ctx, x0 + this.halfWidth, -y0 + this.halfHeight, x1 + this.halfWidth, -y1 + this.halfHeight, 'lime', 2);
        }
    }

    resize(){
        this.view.height = window.innerHeight;
        this.view.width = window.innerWidth;
        this.width = this.view.width;
        this.height = this.view.height;
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;
    }
}