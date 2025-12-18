const arts=[
 "Tamil","English","History","Geography","Economics",
 "Mathematics","Physics","Chemistry",
 "Computer Science","B.Com","BCA"
];

const eng=[
 "CSE","IT","AI & DS","ECE","EEE","Mechanical","Civil"
];

let selectedEl=null;

function openSheet(type){
  overlay.style.display="block";
  sheet.classList.add("open");

  sheetTitle.innerText=
    type==="arts" ? "Arts & Science Departments" : "Engineering Departments";

  const list=type==="arts"?arts:eng;
  options.innerHTML="";
  selectedEl=null;

  list.forEach(d=>{
    const div=document.createElement("div");
    div.className="option";
    div.innerText=d;
    div.onclick=()=>selectDept(div,d);
    options.appendChild(div);
  });
}

function closeSheet(){
  overlay.style.display="none";
  sheet.classList.remove("open");
}

function selectDept(el,dept){
  if(selectedEl) selectedEl.classList.remove("selected");
  el.classList.add("selected");
  selectedEl=el;

 fetch("/save-department", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ department: dept })
}).then(() => {
  window.location.href = HOME_URL;
});


  setTimeout(()=>{
    window.location.href=HOME_URL;
  },450);
}

