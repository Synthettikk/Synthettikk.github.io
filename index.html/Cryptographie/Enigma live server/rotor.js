export default class Rotor {

    constructor(wiring, notch) { // wiring = cablage (alphabet mélangé des rotors), notch = cran (ordre du rotor)
        this.left = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.right = wiring;
        this.notch = notch;
    }

    mod(number, divisor) {
        return ((number % divisor + divisor) % divisor);
    }

    forward(signal) { // signal: Right -> Left (inside one rotor)
        const letter = this.right[signal];
        signal = this.left.indexOf(letter);
        return signal;
    }

    backward(signal) { // signal: Left -> Right
        const letter = this.left[signal];
        signal = this.right.indexOf(letter);
        return signal;
    }

    rotate(n = 1, forward = 1) { // rotation de n crans (1 par defaut) forward = 1; backward = -1
        this.left = this.left.slice(this.mod((forward * n), 26)) + this.left.slice(0, this.mod((forward * n), 26));
        this.right = this.right.slice(this.mod((forward * n), 26)) + this.right.slice(0, this.mod((forward * n), 26));
    }

    rotate_to_letter(letter){ // rotation autour de la lettre choisie
        const n = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(letter);
        this.rotate(n);
    }

    set_ring(n){ 
    // tourne les rotors à l'envers
    this.rotate(n - 1, -1);
    // replace le notch à la meme position
    const n_notch = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(this.notch);
    this.notch = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[this.mod(n_notch - (n - 1), 26)];
    }
}