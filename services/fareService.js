// Basic fare formula: baseFare + perKmRate x distance.
// Real LTFRB fares can work differently (for example, the base fare may cover the
// first few kilometers). Change this one function when the real rules are known.
function calculateFare(fare, distanceKm) {
  const regular = fare.baseFare + fare.perKmRate * distanceKm;
  const discounted = regular * (1 - fare.discountRate);
  return {
    regular: Math.round(regular * 100) / 100,
    discounted: Math.round(discounted * 100) / 100,
  };
}

module.exports = { calculateFare };
