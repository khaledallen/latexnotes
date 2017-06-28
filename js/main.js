//Checks the latex input area and updates the rendered text area
//every keyup or every time anything is changed

const textArea = document.querySelector(".latex");
const renderArea = document.querySelector(".rendered");

//onchange doesn't work, keep change
textArea.addEventListener("onchange", renderText);
textArea.addEventListener("keyup", renderText);
textArea.addEventListener("keydown", showSearch);

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
      console.log("Trigger search");
    }
}

const endpoint = "https://gist.githubusercontent.com/tstusr441/ea890ae6b7e9b1f67f4c8c504f395c3d/raw/12eac49825cf53e500b2c1fa6c7829a1e23c1608/.json";
const syntax = [];

var myHeaders = new Headers();

var myInit = {
  method: 'GET',
  headers: myHeaders,
  mode: 'cors'
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
    return math.keyword.match(regex);
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
        <span class="keyword">${math.keyword}</span>
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
    if (e.target.innerText === syntax[i].keyword) {
      document.querySelector(".doc").innerHTML = `<code>${syntax[i].syntax}</code>`;
      results.innerHTML = "";
      break;
    }
  }
});
