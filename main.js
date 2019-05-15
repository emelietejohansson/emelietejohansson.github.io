// Select main svg container for adding nodes within.
// Why: we need this container to insert our circle shapes (dots) into!
const svgContainer = document.getElementById('svgContainer');

// Declare dotsRightNow and initiate MutationObserver to update dotsRightNow as DOM changes.
// Why: we need to keep a current list of dots in order to hover over and hide them.
let dotsRightNow = [];
const svgObserver = new MutationObserver(() => {
  dotsRightNow = document.querySelectorAll(`.${set.class}`);
  dotsRightNow.forEach(dot => dot.addEventListener('mouseover', e => dotHide(e)));
});
svgObserver.observe(svgContainer, { childList: true });

// Grab/assign window height to modify svg Viewbox height.
// Why: to make the event listener below more readable.
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

// On page load, add viewbox attribute based on initial window height/width. May add in a resize event later also.
// Why: because the Viewbox is an HTML attribute that only takes measurable units and we can't apply "100vh" and "100vw" to it.
document.addEventListener('load', () => {
  svgContainer.setAttribute('viewBox', `0 0 ${windowWidth} ${windowHeight}`);
});

// Where the magic happens; this is our random number generator!
// Why: because we want to be surprised when a new dot appears.
const n = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// Global settings for the dots
// Why: because we use these in a few functions and it's better to declare them all once in a neat object
const set = {
  dots: n(20, 25), // Dot count (minimum, maximum)
  radius: 5, // Dot radius (pixels)
  fade: 1, // Dot fade in/out duration (seconds)
  class: 'dot', // Dot classname
  x: windowWidth, // Match dot's maximum x value with window width
  y: windowHeight // Match dot's maximum y value with window height
};

// Add dot color palette for looping through later in dotCreate()
// Why: because we'll iterate over dotColors soon
const purple = '#5F60B2';
const blue = '#3172F2';
const teal = '#66CCC4';
const yellow = '#E8BF41';
const orange = '#E3835E';
const red = '#C22D20';
const pink = '#EA33A2';
const dotColors = [purple, blue, teal, yellow, orange, red, pink];

// Element factory function to create new elements and add attributes based on an 'attributes' object.
// Why: because using .setAttribute is easy for one attribute, but tedious for multiple (you have to declare each one separately)
const elementFactory = (elementType, attributeList, elementDest) => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', elementType);
  element.style.animation = `fade-in ${set.fade}s linear`;
  for (let i in attributeList) {
    element.setAttribute(i, attributeList[i]);
  }
  elementDest.appendChild(element);
};

// Dot-specific maker function, but can be switched out for rects with different attributes.
// Why: we need to do a lot to create a dot: set the color, iterate through the colors, set unique attributes, etc.
const dotMachine = (dots = 20, fade = 1) => {
  let color = 0;
  const seconds = (fade + .99) * 1000;
  const dotCreate = () => {
    const dotColor = () => {
      color++;
      if (color === dotColors.length) { color = 0; }
      return dotColors[color];
    };
    const attributes = {
      class: set.class,
      r: set.radius,
      cx: n(0, set.x),
      cy: n(0, set.y),
      fill: dotColor()
    };

    elementFactory('circle', attributes, svgContainer);
  };
  const dotReplace = () => {
    dotsRightNow[0].style.animation = `fade-out ${set.fade}s linear`;
    setTimeout(() => svgContainer.removeChild(dotsRightNow[0]), set.fade * .99 * 1000);
    dotCreate();
  };
  const dotToTheMax = () => {
    for (let i = 0; i < dots; i++) dotCreate();

    return true;
  };

  // Generate initial dots, then start replacing. Based on setInterval for now, will switch out for requestAnimationFrame later
  // Why: Because we want to start with a bunch of dots initially in which to start slowly replacing
  if (dotToTheMax()) {
    setInterval(() => dotReplace(), seconds);
  }
};

// Start the dot machine!
// Why: because it would be a weird blue background otherwise
dotMachine(set.dots, set.fade);

// Dot hide function to hide dots as you mouseover. If you hover/hide them all in time, the counter haults and it stops generating circles.
// Why: because interactivity is fun!
const dotHide = e => {
  e.target.style.animation = `fade-out ${set.fade}s linear`;
  setTimeout(() => e.target.remove(), set.fade * .99 * 1000);
};