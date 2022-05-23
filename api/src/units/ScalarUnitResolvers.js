const UnitFloatScalarType = require("./UnitFloatScalarType.js");


const ScalarUnitResolvers = {
    SquareMeters: new UnitFloatScalarType("SquareMeters", "m2"),
    CubicMeters: new UnitFloatScalarType("CubicMeters", "m3")
}


module.exports = ScalarUnitResolvers