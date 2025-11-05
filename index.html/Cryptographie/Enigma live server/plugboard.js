export default class Plugboard {

    constructor(pairs) { // tableau avec les couples de lettres à echanger
        this.left = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.right = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        pairs.forEach(pair => {
            const letter1 = pair[0];
            const letter2 = pair[1];
            const pos_letter1 = this.left.indexOf(letter1);
            const pos_letter2 = this.left.indexOf(letter2);
            this.left = this.left.slice(0, pos_letter1) + letter2 + this.left.slice(pos_letter1 + 1);
            this.left = this.left.slice(0, pos_letter2) + letter1 + this.left.slice(pos_letter2 + 1);
        });
    }

    forward(signal) { // signal: Plugboard -> Right
        const letter = this.right[signal];
        signal = this.left.indexOf(letter);
        return signal;
    }

    backward(signal) { // signal: Right -> Plugboard
        const letter = this.left[signal];
        signal = this.right.indexOf(letter);
        return signal;
    }
}