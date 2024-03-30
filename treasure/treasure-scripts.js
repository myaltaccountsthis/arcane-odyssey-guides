const directionNames = ["East", "East Southeast", "Southeast", "South Southeast", "South", "South Southwest", "Southwest", "West Southwest", "West", "West Northwest", "Northwest", "North Northwest", "North", "North Northeast", "Northeast", "East Northeast"];
const distanceNames = ["Few paces", "Halfway", "On the edge"];
const islandNames = [
  "Frostmill Island", "Ravenna", "Forest of Cernunno", "Shell Island",
  "Harvest Island", "Whitesummit", "Munera Garden", "Wind-Row Island",
  "Palo Town", "Blasted Rock", "Sameria", "Shale Reef", "Drakos Arch", "Claw Island"
  // "Thorin's Refuge", "Limestone Key", "Akursius Keep", "Silverhold"
];
let directionIndex = 0;
let distanceIndex = 1;
let islandIndex = 0;
if (window.sessionStorage.getItem("direction")) {
  directionIndex = parseInt(window.sessionStorage.getItem("direction"));
  distanceIndex = parseInt(window.sessionStorage.getItem("distance"));
  islandIndex = parseInt(window.sessionStorage.getItem("island"));
}

const RADIUS = 256;

const image = new Image();
image.onload = () => drawCanvas();

// angle goes clockwise starting from the x-axis
function get2DComponents(angle, radius) {
  return {x: RADIUS + radius * Math.cos(-angle), y: RADIUS + radius * Math.sin(-angle)};
}

function drawCanvas() {
  const ctx = getContext();
  // draw island
  ctx.drawImage(image, 0, 0, 512, 512);
  // needed variables
  const angle = Math.PI * directionIndex / 8;
  const a1 = angle - Math.PI / 16, a2 = angle + Math.PI / 16
  const r1 = distanceIndex * RADIUS / 3, r2 = r1 + RADIUS / 3;
  const {xL1, yL1} = get2DComponents(a1, r1);
  const {xL2, yL2} = get2DComponents(a1, r2);
  const {xU1, yU1} = get2DComponents(a2, r1);
  const {xU2, yU2} = get2DComponents(a2, r2);
  /*
  // draw angle
  ctx.fillStyle = "rgba(255, 255, 255, .2)";
  ctx.strokeStyle = "rgba(0, 0, 0, .4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(RADIUS, RADIUS);
  ctx.arc(RADIUS, RADIUS, RADIUS, a1, a2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  */
  // draw the semi sector
  ctx.fillStyle = "rgba(0, 207, 11, .2)";
  ctx.strokeStyle = "rgba(0, 0, 0, 1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(xL1, yL1);
  ctx.lineTo(xL2, yL2);
  ctx.moveTo(xL2, yL2);
  ctx.arc(RADIUS, RADIUS, r2, a1, a2);
  ctx.lineTo(xU1, yU1);
  ctx.arc(RADIUS, RADIUS, r1, a2, a1, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function getContext() {
  const canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    return canvas.getContext("2d");
  }
}

function update() {
  document.getElementById("direction").innerText = directionNames[directionIndex];
  document.getElementById("distance").innerText = distanceNames[distanceIndex];
  document.getElementById("island").innerText = islandNames[islandIndex];
  window.sessionStorage.setItem("direction", directionIndex);
  window.sessionStorage.setItem("distance", distanceIndex);
  window.sessionStorage.setItem("island", islandIndex);
  ctx = getContext();
  image.src = `treasure/${islandNames[islandIndex]}.png`;
}

function directionLeft() {
  directionIndex = (directionIndex + directionNames.length - 1) % directionNames.length;
  update();
}

function directionRight() {
  directionIndex = (directionIndex + 1) % directionNames.length;
  update();
}

function distanceLeft() {
  distanceIndex = (distanceIndex + distanceNames.length - 1) % distanceNames.length;
  update();
}

function distanceRight() {
  distanceIndex = (distanceIndex + 1) % distanceNames.length;
  update();
}

function islandLeft() {
  islandIndex = (islandIndex + islandNames.length - 1) % islandNames.length;
  update();
}

function islandRight() {
  islandIndex = (islandIndex + 1) % islandNames.length;
  update();
}

function toggleInfo(element) {
  const infoElement = document.getElementById("info");
  infoElement.style.display = infoElement.style.display == "none" ? "" : "none";
  element.innerText = infoElement.style.display == "" ? "Hide Info" : "Show Info";
  window.sessionStorage.setItem("showInfo", infoElement.style.display);
}

function onBodyLoad() {
  update();
  if (window.sessionStorage.getItem("showInfo"))
    toggleInfo(document.getElementById("visibility-button"));
}