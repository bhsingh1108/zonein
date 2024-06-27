// import * as emoji from 'node-emoji';
const emoji = require('node-emoji');
const ammenities = [
  { id: 1, name: "Swimming Pool",clip:`${emoji.get(':swimming_man:') }` },
  { id: 2, name: "Centralised AC",clip:`${emoji.get(':snowflake:') }` },
  { id: 3, name: "Parking",clip:`${emoji.get(':parking:') }` },
  { id: 4, name: "360 degree camera",clip:`${emoji.get(':unicorn:') }` },
  { id: 5, name: "Gym",clip:`${emoji.get(':unicorn:') }` },
  { id: 6, name: "Power Backup",clip:`${emoji.get(':unicorn:') }` },
  { id: 7, name: "Lift",clip:`${emoji.get(':unicorn:') }` },
  { id: 8, name: "House Keeping",clip:`${emoji.get(':unicorn:') }` },
  { id: 9, name: "Security",clip:`${emoji.get(':unicorn:') }` },
  { id: 10, name: "Geyser",clip:`${emoji.get(':unicorn:') }` },
];

module.exports = ammenities;