class Grid{ // Base
    constructor(){
        this.layer = layers.create();
        this.ctx = this.layer.getContext('2d');
        this.width = this.layer.width;
        this.height = this.layer.height;
        this.resize();
        this.initGridValues();
    }

    initGridValues(){
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;
        // maybe we will need more
    }

    // we suppose that its the canonic base, later it will take the base in arg
    drawGrid() {
        // clear grid canvas first
        layers.clear(this.ctx); 

        // subsubdivisions : we hide it (its too much)
        // for (let i = 0; i < 800; i += 20) {
        // 	drawLine(ctx, i, 0, i, 800, '#333');
        // 	drawLine(ctx, 0, i, 800, i, '#333');
        // }

        //subdivs
        for(let i = 100; i < this.width / 2; i += 100){ // from the center to the sides : | -> | | | -> | | | | | -> ...
            // verticals
            layers.drawLine(this.ctx, this.width / 2 + i, 0, this.width / 2 + i, this.height, 'rgba(141, 143, 0, 0.9)'); // 
            layers.drawLine(this.ctx, this.width / 2 - i, 0, this.width / 2 - i, this.height, 'rgba(141, 143, 0, 0.9)'); // 'rgba(0, 128, 0, 0.9)'
        }
        for(let i = 100; i < this.height / 2; i += 100){ // same but horizontals
            // horizontals
            layers.drawLine(this.ctx, 0, this.height / 2 + i, this.width, this.height / 2 + i, 'rgba(0,100,139,0.9)'); // 'rgba(0,100,139,0.9)'
            layers.drawLine(this.ctx, 0, this.height / 2 - i, this.width, this.height / 2 - i, ); // 'rgba(139, 0, 0, 0.9)'
        }

        // base
        layers.drawLine(this.ctx, 0, this.halfHeight, this.width, this.halfHeight, 'rgba(0,100,139,0.9)', 3); // horizontale
        let [x2, y2] = [1, 0]; // canonic base
        layers.drawArrow(this.ctx, x2,y2, 'rgba(0,100,139,0.9)');
        layers.drawLine(this.ctx, this.halfWidth, 0, this.halfWidth, this.height, 'rgba(141, 143, 0, 0.9)', 3); // verticale
        [x2, y2] = [0, 1]; // canonic base
        layers.drawArrow(this.ctx, x2,y2, 'rgba(141, 143, 0, 0.9)');
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