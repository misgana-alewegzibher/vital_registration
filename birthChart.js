alert("HEllo");

 function totalGender(maleSize, femaleSize){
window.alert("Called");
var xValues = ["Male", "Female"];
var yValues = [parseInt(maleSize), parseInt(femaleSize)];
var barColors = ["orange","brown"];

new Chart("totalGender", {
  type: "pie",
  data: {
    labels: xValues,
    datasets: [{
      backgroundColor: barColors,
      data: yValues
    }]
  },
  options: {}
});
}

// export  function totalGenderw();

var xValues = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var yValues = [20, 30,18,22,34,22,43];
var barColors = ["orange","brown","pink", "green", "yellow", "blue", "Cyan"];

new Chart("totalWeekly", {
  type: "bar",
  data: {
    labels: xValues,
    datasets: [{
      backgroundColor: barColors,
      data: yValues
    }]
  },
  options: {}
});