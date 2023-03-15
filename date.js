module.exports = getDate;

function getDate() {
  var today = new Date();
  // var currentDay = today.getDay();
  // const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // var day = days[currentDay];

  var options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  var day = today.toLocaleDateString("en-US", options);
  return day;
}
