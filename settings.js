// const druids = [1065, 1534, 1687, 233, 2510, 2667, 289, 3572, 3577, 3578, 4018, 4019, 46, 47]
// const assassins = [1064, 122, 123, 1535, 2230, 2231, 2483, 259, 2805, 3134, 3214, 3217, 3567, 3568, 3579]  
// const rangers = [232, 2482, 258, 2581, 2591, 2731, 288, 3020, 3557, 3559, 3561, 3565, 3569, 4017, 994]

const druids = [3572,3577,3578,4018,4019,4124,4395,46,47,233,289,1065,1534,1687,2510,2667]
const assassins = [3568,3134,2805,3214,3567,3579,2230,1535,1064,123,3217,2483,2231]
const rangers = [4158,3020,3565,3569,4017,4157,4501,258,288,2581,2591,2731,3557,3559,3561,994]

// CAMPAIGN VARIABLES
const lowLevel = 7
const midLevel = 14
const highLevel = 30


// RUNTIME VARIABLES
// Testing interval - 5 seconds
const interval = 5000;

// Prod interval - 5 minutes
// const interval = 300000;

const acceptableGwei = 90;
const priorityGwei = 120;

module.exports = {
  druids,
  assassins,
  rangers,
  lowLevel,
  midLevel,
  highLevel,
  interval,
  acceptableGwei,
  priorityGwei,
}