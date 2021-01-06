let result = [
  {
    name: "English",
    Student: [
      { sname: "raju", total: 25, mark: 16 },
      { sname: "ramu", total: 25, mark: 10 },
      { sname: "suku", total: 25, mark: 21 },
      { sname: "ambadi", total: 25, mark: 25 },
      { sname: "arjun", total: 25, mark: 19 },
      { sname: "arun", total: 25, mark: 15 },
      { sname: "madhu", total: 25, mark: 16 },
      { sname: "manoj", total: 25, mark: 22 },
      { sname: "anwer", total: 25, mark: 16 },
      { sname: "bappu", total: 25, mark: 25 },
      { sname: "ragu", total: 25, mark: 13 },
      { sname: "sundharan", total: 25, mark: 12 },
      { sname: "unni", total: 25, mark: 18 },
      { sname: "appu", total: 25, mark: 23 },
      { sname: "riju", total: 25, mark: 25 },
      { sname: "bhuvan", total: 25, mark: 20 },
      { sname: "jayan", total: 25, mark: 15 },
      { sname: "mohan", total: 25, mark: 14 },
      { sname: "bilal", total: 25, mark: 20 },
      { sname: "muthu", total: 25, mark: 19 },
      { sname: "aparna", total: 25, mark: 5 },
      { sname: "abhin", total: 25, mark: 18 }
    ]
  }
];

let submark = [];

function buildTable() {
  var table = document.createElement("table");
  table.className = "gridtable";
  var thead = document.createElement("thead");
  var tbody = document.createElement("tbody");
  var headRow = document.createElement("tr");

  let headings = ["NAME", "TOTAL MARK", "MARK"];
  //  console.log(headings);
  headings.forEach(ele => {
    let th = document.createElement("th");
    th.appendChild(document.createTextNode(ele));
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  result[0].Student.forEach(e => {
    var tr = document.createElement("tr");
    tr.id = "c" + e.sname;
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(e.sname));
    tr.appendChild(td);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  return table;
}
window.onload = function() {
  document.getElementById("content").appendChild(buildTable());
  document.getElementById("subject").innerHTML = result[0].name;

  result[0].Student.forEach(pre => {
    var names = pre.sname;
    // console.log(names);
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(pre.total));
    document.getElementById("c" + names).appendChild(td);
  });
  result[0].Student.forEach(pre => {
    var names = pre.sname;
    //   console.log(names);
    var td = document.createElement("td");
    var input = document.createElement("input");
    input.type = Number;
    input.value = pre.mark;
    input.id = names;
    // input.placeholder =pre.mark;
    td.appendChild(input);
    // td.appendChild(document.createTextNode(pre.mark))
    document.getElementById("c" + names).appendChild(td);
  });

  document.getElementById("submit").addEventListener("click", () => {
    result[0].Student.forEach(pre => {
      let names = pre.sname;
      let submitted_mark = document.getElementById(names).value;
      console.log(submitted_mark);
      pre.mark = submitted_mark;
    });
    submark = result;
    console.log(submark);
  });
};
