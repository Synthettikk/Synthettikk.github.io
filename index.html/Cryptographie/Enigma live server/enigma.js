export default class Enigma {

    constructor(reflector, rotor1, rotor2, rotor3, plugboard, keyboard) {
        this.reflector = reflector;
        this.rotor1 = rotor1;
        this.rotor2 = rotor2;
        this.rotor3 = rotor3;
        this.plugboard = plugboard;
        this.keyboard = keyboard;
    }

    set_rings(rings) {
        this.rotor1.set_ring(rings[0]);
        this.rotor2.set_ring(rings[1]);
        this.rotor3.set_ring(rings[2]);
    }

    set_key(key) {
        this.rotor1.rotate_to_letter(key[0]);
        this.rotor2.rotate_to_letter(key[1]);
        this.rotor3.rotate_to_letter(key[2]);
    }

    encipher(letter) {

        //rotation des rotors
        if (this.rotor2.left[0] === this.rotor2.notch) { //double stepping
            this.rotor1.rotate();
            this.rotor2.rotate();
        }
        else {
            if (this.rotor3.left[0] === this.rotor3.notch) {
                this.rotor2.rotate();
            }
        }
        this.rotor3.rotate();

        //passage de la lettre dans la machine
        let signal = this.keyboard.forward(letter);
        signal = this.plugboard.forward(signal);
        signal = this.rotor3.forward(signal);
        signal = this.rotor2.forward(signal);
        signal = this.rotor1.forward(signal);
        signal = this.reflector.reflect(signal);
        signal = this.rotor1.backward(signal);
        signal = this.rotor2.backward(signal);
        signal = this.rotor3.backward(signal);
        signal = this.plugboard.backward(signal);
        letter = this.keyboard.backward(signal);

        return letter;
    }
}