//Checks the latex input area and updates the rendered text area
//every keyup or every time anything is changed
const textArea = document.querySelector(".latex");
const renderArea = document.querySelector(".rendered");
const searchBar = document.getElementById('search-form-wrapper');
const search = document.querySelector(".search");

search.addEventListener("change", matchResults);
search.addEventListener("keyup", matchResults);

textArea.addEventListener("onchange", renderText);
textArea.addEventListener("keyup", renderText);
textArea.addEventListener("keydown", showSearch);
searchBar.addEventListener("keydown", hideSearch);
search.addEventListener("keydown", navigateResults);

window.onload = function() {
	textArea.focus();
};

$(".search-form").submit(function(event) {  //prevents the form refreshing the page when ENTER is typed
	event.preventDefault();
});

function renderText() {
  var text = textArea.value;
  text = text.replace(/\B\$\$/m, `<span class="latex-wrap">$$$`);
  text = text.replace(/\b\$\$/gm, `$$$</span>`);

  $(".rendered").html(text);
  MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}

function showSearch(e) {
	if (e.key == "s" && e.ctrlKey) {
		if (getComputedStyle(searchBar, null).display == "none") {
			var coordinates = getCaretCoordinates(this, this.selectionEnd);
			var topOffset = coordinates.top + this.getBoundingClientRect().top;
			var leftOffset = coordinates.left + this.getBoundingClientRect().left;
			var cssString = "display: block; top: " + topOffset + "px; left: " + leftOffset + "px;";
			searchBar.setAttribute("style", cssString);
			search.focus();
		}
	}
}

function hideSearch(e) {
	if ((e.key == "s" && e.ctrlKey) || e.keyCode == 27 || e.keyCode == 13) { //if ctr-s or esc or enter is pressed, hide searchBar
		searchBar.setAttribute("style", "display: none;");
		textArea.focus();
		e.preventDefault();
	}
}

function insertAtCursor(ins, field) {
	if(field.selectionStart){
		let startPos = field.selectionStart;
		let endPos = field.selectionEnd;

		field.value = field.value.substring(0, startPos) + ins + field.value.substring(endPos, field.value.length);
		field.selectionStart = endPos + ins.length;
		field.selectionEnd = endPos + ins.length;
	} else {
		field.value = ins;
	}
}

function navigateResults(e){
	var activeIndex = $(".active").index();
	var next;

	if (e.keyCode == 40) {
		next = $("li").get(activeIndex + 1);
		$(".results li").removeClass("active");
		$(next).addClass("active");
	}
	if (e.keyCode == 38) {
		next = $("li").get(activeIndex - 1);
		$(".results li").removeClass("active");
		$(next).addClass("active");
	}
	if (e.keyCode == 13) {
		let term = $("li").get(activeIndex);
		term = $(".active .keyword").text();
		insertAtCursor(term, textArea);
		search.value = "";
	}
}


const endpoint = "https://gist.githubusercontent.com/awareness481/"
									+ "a1be0fb9b3a91eb78b6a4c1805da1f9f/raw/0512a07d86"
									+ "ccf5e4ff8e2791d1b68c2da47e0566/l.json";
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
    if (math.key.match(regex) || math.description.match(regex))
			return true;
  });
}

var results = document.querySelector(".results");

function matchResults(e) {
if (e.keyCode != 13 && e.keyCode != 40 && e.keyCode != 38) { //Do nothing if ENTER, UP, or DOWN are pressed
	if (!this.value) {
		results.innerHTML = ""; //This is to prevent results from popping up when search is empty
		return 0;
	}
}

	const resultsArray = findLatex(this.value, syntax);
	console.log(this.value);
	const html = resultsArray.map(math => {
		return `
			<li>
			<span class="keyword">${math.key}</span>
			<span class="desc">${math.description}</span>
			</li>
			`;
	}).join('');
	results.innerHTML = html;

	$("li:first-of-type").addClass("active");
	//description css
	// Doesnt work as of yet
	// const node = document.querySelectorAll(".desc");
	// const desc = Array.from(node);
	// desc.forEach(box => box.classList.add("style"));
}

$("ul").on("click", "li", function(e) {
  for (let i = 0; i < syntax.length; i++) {
    if (e.target.innerText === syntax[i].key) {
      document.querySelector(".doc").innerHTML = `<code>${syntax[i].syntax}</code>`;
      results.innerHTML = "";
      break;
    }
  }
});
