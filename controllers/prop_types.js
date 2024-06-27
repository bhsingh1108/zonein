const PropertyTypes = require('../models/enums/property_types');
exports.getPropertyTypes= (req, res) => {
    const typeNames = Object.values(PropertyTypes).map(type => type.name);
    res.json(typeNames);
};