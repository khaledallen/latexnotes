//Change doSomething function name later

const textArea = document.querySelector(".latex");
textArea.addEventListener("onchange", doSomething);
textArea.addEventListener("keyup", doSomething);

function doSomething() {
  console.log("it works");
}
