function hello() {
    console.log("hello there");
    goodbye();
}

function goodbye() {
    console.log("bye!");
}

function init() {
    console.log("hello im the init");
    hello();
}

//New comment
window.onload = init; // it waits until the html and css finish to run the logic