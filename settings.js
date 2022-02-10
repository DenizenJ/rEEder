const druids = [3578,4018,46,4395,4019,2667,3577,1065,4124,1534,1667,233,2510,3572,47,289,4637,2948,4949]
const assassins = [3567,3568,123,1064,1535,2230,2231,2483,3217,2805,3134,3214,3579,4950,4977]
const rangers = [3561,3569,3557,3559,3020,3565,2581,2731,4501,288,994,2591,258,4017,4158,4157,4951]

// CAMPAIGN VARIABLES
const lowLevel = 7
const midLevel = 14
const highLevel = 30

const lowCamp = 4
const midCamp = 5
const highCamp = 6


// RUNTIME VARIABLES
// Testing interval - 5 seconds
// const interval = 5000;

// Prod interval - 5 minutes
const interval = 300000;

const acceptableGwei = 90;
const priorityGwei = 120;

module.exports = {
  druids,
  assassins,
  rangers,
  lowLevel,
  midLevel,
  highLevel,
  lowCamp,
  midCamp,
  highCamp,
  interval,
  acceptableGwei,
  priorityGwei,
}