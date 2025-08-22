let isVisible = true; // global avriable to track visibility

function toggleVisibility() {
    if (isVisible) {
        $("#form").fadeOut(); // hide the form section
        isVisible = false; // update the visibilty state
    }else{
        $("#form").fadeIn(); // show the form section
        isVisible = true; // update the visibility state
    }
}

function saveTask() {
  console.log("hellow im the save task");
  // get the value of the input

  //create a new task object

  // add the task to the list
}

function init() {
  console.log("hello im the init");
  // hooks
  $("#btnAdd").click(saveTask);
  $("#btnDetails").click(toggleVisibility);
}

//New comment
window.onload = init; // it waits until the html and css finish to run the logic