function getLineEquation(x1, y1, x2, y2) {
    // Calculate the slope of the line
    const m = (y2 - y1) / (x2 - x1);

    // Calculate the y-intercept of the line
    const b = y1 - m * x1;

    // Return the equation of the line in the form y = mx + b
    return `y = ${m}x + ${b}`;
}

// Example usage:
var x1 = 1;
var y1 = 3;
var x2 = 2;
var y2 = 5;
var equation = getLineEquation(x1, y1, x2, y2);
// console.log(equation);  // Output: y = 2.0x - 1.0