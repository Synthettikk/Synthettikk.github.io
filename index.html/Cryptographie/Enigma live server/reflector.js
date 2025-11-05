export default class Reflector {

    constructor(wiring) { // wiring = cablage (alphabet mélangé des reflectors)
        this.left = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.right = wiring;
    }

    reflect(signal) {
        const letter = this.right[signal];
        signal = this.left.indexOf(letter);
        return signal;
    }
}