import JsonScalarType from "../units/JsonScalarType"
import UnitFloatScalarType from "../units/UnitFloatScalarType"

const resolvers = {
  UnitFloat: new UnitFloatScalarType("UnitFloat"),
  Meters: new UnitFloatScalarType("Meters", "m"),
  SquareMeters: new UnitFloatScalarType("SquareMeters", "m2"),
  CubicMilliMeters: new UnitFloatScalarType("CubicMilliMeters", "mm3"),
  CubicMeters: new UnitFloatScalarType("CubicMeters", "m3"),
  Amperes: new UnitFloatScalarType("Amperes", "A"),
  Kiloamperes: new UnitFloatScalarType("Kiloamperes", "kA"),
  Milliamperes: new UnitFloatScalarType("Milliamperes", "mA"),
  Watts: new UnitFloatScalarType("Watts", "W"),
  VoltAmperes: new UnitFloatScalarType("VoltAmperes", "VA"),
  LitersPerSecond: new UnitFloatScalarType("LitersPerSecond", "l_per_s"),
  //LitersPerSecondPerSquareMeters: new UnitFloatScalarType("LitersPerSecondPerSquareMeters", "l_per_s_per_m2"),
  JsonParam: new JsonScalarType("JsonParam"),

  //Custom resolver to search for RDT spaces by name, sectors, TC_Approved and isExisting
  // Query: {
  //   searchRDTSpacesWithFilters: async (parent, args, context, info) => {
  //     console.log('CUSTOM RESOLVER')
  //     console.log(args)
  //     if (args.searchString == '') args.searchString = "*";
  //     console.log(info);
  //     const session = context.driver.session();
  //     try {
  //       const result = await session.run(
  //         `CALL db.index.fulltext.queryNodes('fulltext_index_space_name', $searchString + '~')
  //           YIELD node
  //           WITH node
  //           MATCH (s:Sector)<-[:IS_IN_SECTOR]-(node)
  //           WHERE (node.TC_Approved=$isTCApproved AND size($sectors)=0) OR (node.TC_Approved=$isTCApproved AND size($sectors)>0 AND s.Id IN $sectors)        
  //           UNWIND
  //             CASE
  //             WHEN $isExisting=false
  //             THEN (node)-[:IS_IN]->(:Model {ModelRef:'RDT'})
  //             ELSE (node)-[:IS_IN]->(:Model {ModelRef:'RDT'}) OR (node)<-[:TEMPLATE_TO]-(:Space)-[:IS_IN]->(:Model {ModelRef:'RDT'})
  //             END AS result
  //           RETURN node`,
  //         args
  //       )        
  //       console.log(result.records);        
  //       return result.records.map(x => x._fields[0].properties)
  //     } finally {
  //       await session.close()
  //     }

  //   }
  // }
}

module.exports = resolvers;