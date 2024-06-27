const ammenities = require('../models/enums/ammenties');
exports.getammenities= (req, res) => {
  //  const ammentiesTypes = Object.values(ammenities).map(type => type.name);
    const ammentiesTypes = Object.values(ammenities).map(type => `${type.clip} - ${type.name}`);

    res.json(ammentiesTypes);
};