let menuicn = document.querySelector(".menuicn");
let nav = document.querySelector(".navcontainer");

menuicn.addEventListener("click",() => {
	nav.classList.toggle("navclose");
})

let birthId = document.getElementById('birthId');
birthId.addEventListener("click", ()=>{
    birthId.style.display = "block";
})

var dropdown = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
  });
}



// let dash_nav = document.getElementsById('dash_nav');
// let main_id = document.getElementsById('main_id');
// dash_nav.addEventListener("click", ()=>{
//     mainContainer.style.display="none";
// })

