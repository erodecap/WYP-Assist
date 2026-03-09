# Point Load Estimator

The Point Load Estimator calculates individual point loads for overhead rigging systems based on total weight, span length, and number of suspension points.

## Getting Started

1. Select **Imperial** or **Metric** units
2. Choose your **System Type**: Straight, Curved, or Circular
3. Enter the **Total Load** (weight of your entire system)
4. Enter the **Number of Points** (how many suspension points)
5. Enter the **Span Length** (total distance of your rig)

## System Types

### Straight
A linear truss or pipe run. Points are distributed along a straight line.

### Curved
An arc-shaped rig. Enter the **arc angle** in degrees to define the curvature. Loads are distributed accounting for the curved geometry.

### Circular
A full or partial circle (e.g., circular truss). Enter the **diameter** and the calculator handles the circular load distribution.

## Loading Modes

### Even Distribution
Distributes the total load equally across all points. Best for uniformly loaded trusses.

### Custom Loads
Assign specific weights to each point individually. Use this when you have uneven loading (e.g., a heavy speaker cluster on one point).

## Point Spacing

### Even Spacing
Points are distributed at equal intervals along the span.

### Custom Positions
Set exact positions for each point along the span. Useful when rigging points must align with specific structural attachment locations.

## Reading Results

The results table shows:
- **Point number** and position along the span
- **Individual point load** in your selected unit
- **Safety factor** applied (5:1 minimum for overhead rigging)
- **Recommended hardware** (shackles, hoists, etc.)

## Tips

- Always verify calculations with a qualified structural engineer
- The 5:1 safety factor is a minimum — some venues require higher
- Account for dynamic loading factors not included in static calculations
- Check that venue steel can handle the calculated point loads
