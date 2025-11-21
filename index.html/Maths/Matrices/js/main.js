const layers = new Layers();
const grid = new Grid();
const deformed = new Deformed();
grid.drawGrid();
layers.printAll();
let hasAnimated = false; // boolean that knows if a matrix has been animated (can be used to (re)print or not deformed)

window.addEventListener("resize", () => {
    // resize
    layers.resize();
    grid.resize();
    deformed.resize();
    // retrace
    grid.drawGrid();
    const verifMat = verifMatrix();
    if(hasAnimated && verifMat.is){
    deformed.drawDeformed(1, verifMat.M); // use the current parameters
    }
    // print on canvas
    layers.printAll();
});

const dashboard = document.getElementById("dashboard");
const toggleButton = document.getElementById("toggleButton")
toggleButton.addEventListener('click', () => {
    if(dashboard.style.display === "none"){
        dashboard.style.display = "flex";
        toggleButton.innerText = "Cacher le menu";
    } else {
        dashboard.style.display = "none";
        toggleButton.innerText = "Afficher le menu";
    }
});

//anim button + add listener on click
const goBtn = document.getElementById('anim_button');
goBtn.addEventListener('click', () => {
    animate();
    hasAnimated = true;
});

// matrix = [a, b, c, d]
//
//          | a  b |
// matrix = |      | : xAxis = [a, c] ; yAxis = [b, d]
//          | c  d |

// drawGrid();
// real();


function animate(){
    const verifMat = verifMatrix();
    if(!verifMat.is){
        layers.reset(); // clear and draw grid
        return;
    }
    const start = performance.now();
    const M = verifMat.M; // matrix given by user
    const frame = (time) => { // time is given by requestAnimationFrame
        let factor = (time - start) / 4000;
        //if (factor > 1) factor = 1;

        grid.drawGrid();
        deformed.drawDeformed(factor, M);
        layers.printAll();

        if (factor < 1) {
            requestAnimationFrame(frame);
        return;
        }
    }
    requestAnimationFrame(frame);
}

function get_b(x1, y1, a) {
    return y1 - a * x1;
}

function getCoeff(x1, y1, x2, y2) {
    let a;
    if (Math.abs(x2 - x1) === 0) {
        a = 1e12;
    } else {
        a = (y2 - y1) / (x2 - x1);
    }
    return a;
}

function lerp(a, b, factor) {
    return factor * (b - a) + a;
}

// lerp 2 rgba colors
function lerpColor(color1, color2, factor){
    const [r1, g1, b1, a1] = color1.replace('rgba(', '').replace(')', '').split(',').map(str => Number(str));
    const [r2, g2, b2, a2] = color2.replace('rgba(', '').replace(')', '').split(',').map(str => Number(str));
    const lerped = {r: Math.round(lerp(r1, r2, factor)), g: Math.round(lerp(g1, g2, factor)), b: Math.round(lerp(b1, b2, factor)), a: lerp(a1, a2, factor)};
    return 'rgba(' + String(lerped.r) + ',' + String(lerped.g) + ',' + String(lerped.b) + ',' + String(lerped.a) + ')';
}

function smoothstep(a, b, x) {
    x = x * x * (3.0 - 2.0 * x);
    // x = 1 - (1 - x) ** 3;
    return x * (b - a) + a;
}

function lerpMatrix(m, fc, factor) {
    return [fc(1, m[0], factor), fc(0, m[1], factor),
            fc(0, m[2], factor), fc(1, m[3], factor)];
}

function matrixPoint(m, p) {
	const [a, b, c, d] = [...m];
    const [x, y] = p;
	return [a * x + b * y, c * x + d * y];
}


function verifMatrix(){
    const a = document.getElementById("coef_1").valueAsNumber;
    const b = document.getElementById("coef_2").valueAsNumber;
    const c = document.getElementById("coef_3").valueAsNumber;
    const d = document.getElementById("coef_4").valueAsNumber;
    if(Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c) || Number.isNaN(d)) {
        document.querySelectorAll('#matrix input[type="number"]')
            .forEach(el => el.classList.add('invalid'));
        console.log('Les éléments de la matrice doivent être des nombres réels.')
        return {is: false, M:[]};
    }
    document.querySelectorAll('#matrix input[type="number"]')
            .forEach(el => el.classList.remove('invalid'));
    return {is: true, M: [a, b, c, d]};
}



