export default class Keyboard {

    forward(letter) {
        let signal = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(letter);
        return signal;
    }

    backward(signal) {
        let letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[signal];
        return letter;
    }
}