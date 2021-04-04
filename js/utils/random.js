function random(x) {
    return x * Math.random();
};

function irandom(i) {
    let max = Math.floor(i);
    return Math.floor(Math.random() * (max + 1)); //Inclusive
};

function irandomRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Inclusive
};

function choose(arr) {
    return arr[irandom(arr.length - 1)];
};

 function chooseN(arr, n) {
    let o = [];
    for (let i=0; i<n; i++) {
        o.push(arr.splice(irandom(arr.length - 1), 1)[0]);
    }
    return o;
};

function chooseChance(...arg) {
    let totalProb = 0;
    arg.forEach(function(value) { totalProb += value; });
    let answer = random(totalProb);
    for (let i=0; i<arg.length; i++) {
        if (answer<arg[i]) return i;
        answer -= arg[i];
    }
};