//Checks the latex input area and updates the rendered text area
//every keyup or every time anything is changed
const textArea = document.querySelector(".latex");
const renderArea = document.querySelector(".rendered");
const searchBar = document.getElementById('search-form-wrapper');

window.onload = function() {
	textArea.focus();
}

//onchange doesn't work, keep change
textArea.addEventListener("onchange", renderText);
textArea.addEventListener("keyup", renderText);
textArea.addEventListener("keydown", showSearch);
searchBar.addEventListener("keydown", hideSearch);

function renderText() {
  var text = textArea.value;
  text = text.replace(/\B\$\$/m, `<span class="latex-wrap">$$$`);
  text = text.replace(/\b\$\$/gm, `$$$</span>`);

  $(".rendered").html(text);
  MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}

function showSearch(e) {
	var x = e.key;
	if (x == "s" && e.ctrlKey) {
		if (getComputedStyle(searchBar, null).display == "none"){
			var coordinates = getCaretCoordinates(this, this.selectionEnd);
			var topOffset = coordinates.top + this.getBoundingClientRect().top;
			var leftOffset = coordinates.left + this.getBoundingClientRect().left;
			var cssString = "display: block; top: " + topOffset + "px; left: " + leftOffset + "px;"; 
			searchBar.setAttribute("style", cssString);
			document.querySelector(".search").focus();
		}
	}
}

function hideSearch(e) {
	var x = e.key;
	if ((x == "s" && e.ctrlKey) || e.keyCode === 27) {
		searchBar.setAttribute("style", "display: none;");
		textArea.focus();
	}
}

	const endpoint = "https://gist.githubusercontent.com/awareness481/82e9a75a73602dd59d06c4696c1bfe0f/raw/1d35b515e2570733d7bacf50d64203930128c63a/v2.json";
const syntax = [];

var myHeaders = new Headers();

var myInit = {
  method: 'GET',
  headers: myHeaders,
  cache: "no-cache",
  mode: "cors"
};

/*
 *Transferring the json data to syntax array.
 *fetch() not supported by IE, we will have to think about this
 */
fetch(endpoint, myInit)
  .then(blob => blob.json())
  .then(data => syntax.push(...data));

//Returns true when search term matches keyword on json
function findLatex(wordQuery, syntax) {
  return syntax.filter(math => {
    const regex = new RegExp(wordQuery, "gi");
    if (math.key == undefined)
      return false;
    return math.key.match(regex);
  });
}

var results = document.querySelector(".results");

function matchResults() {

  if (!this.value) {
    results.innerHTML = ""; //This is to prevent results from popping up when search is empty
    return 0;
  }

  const resultsArray = findLatex(this.value, syntax);
  console.log(this.value);
  const html = resultsArray.map(math => {
    return `
      <div class="elements">
      <li>
        <span class="keyword">${math.key}</span>
      </li>
      </div>
    `;
  }).join('');
  results.innerHTML = html;
}

const search = document.querySelector(".search");
search.addEventListener("change", matchResults);
search.addEventListener("keyup", matchResults);

$("ul").on("click", "li", function(e) {
  for (let i = 0; i < syntax.length; i++) {
    if (e.target.innerText === syntax[i].key) {
      document.querySelector(".doc").innerHTML = `<code>${syntax[i].syntax}</code>`;
      results.innerHTML = "";
      break;
    }
  }
});
