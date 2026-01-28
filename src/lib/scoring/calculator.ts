export interface MetricScore {
  metricId: string;
  metricCode: string;
  predictedValue: number;
  actualValue: number;
  weight: number;
  percentageError: number;
  weightedError: number;
}

export interface PredictionScore {
  predictionId: string;
  userId: string;
  metricScores: MetricScore[];
  totalWeightedError: number;
  rank?: number;
}

/**
 * Calculate the percentage error for a single metric
 * Formula: |predicted - actual| / |actual| * 100
 */
export function calculatePercentageError(
  predicted: number,
  actual: number
): number {
  if (actual === 0) {
    // Handle division by zero - use absolute difference
    return predicted === 0 ? 0 : Math.abs(predicted) * 100;
  }
  return (Math.abs(predicted - actual) / Math.abs(actual)) * 100;
}

/**
 * Calculate weighted error for a single metric
 * Formula: percentageError * weight
 */
export function calculateWeightedError(
  percentageError: number,
  weight: number
): number {
  return percentageError * weight;
}

/**
 * Calculate total weighted average error for a prediction
 * Formula: Sum(weightedError) / Sum(weights)
 * Lower score = better prediction
 */
export function calculateTotalScore(metricScores: MetricScore[]): number {
  const totalWeight = metricScores.reduce((sum, m) => sum + m.weight, 0);
  const totalWeightedError = metricScores.reduce(
    (sum, m) => sum + m.weightedError,
    0
  );

  if (totalWeight === 0) return 0;
  return totalWeightedError / totalWeight;
}

interface PredictionWithValues {
  id: string;
  userId: string;
  values: Array<{
    metricId: string;
    value: number;
    metric: {
      code: string;
      weight: number;
    };
  }>;
}

interface MetricResultMap {
  [metricId: string]: {
    actualValue: number;
  };
}

/**
 * Score all predictions for a competition
 */
export function scoreCompetition(
  predictions: PredictionWithValues[],
  actualResults: MetricResultMap
): PredictionScore[] {
  const scores: PredictionScore[] = [];

  for (const prediction of predictions) {
    const metricScores: MetricScore[] = [];

    for (const pv of prediction.values) {
      const actual = actualResults[pv.metricId];
      if (!actual) continue;

      const percentageError = calculatePercentageError(
        pv.value,
        actual.actualValue
      );
      const weightedError = calculateWeightedError(
        percentageError,
        pv.metric.weight
      );

      metricScores.push({
        metricId: pv.metricId,
        metricCode: pv.metric.code,
        predictedValue: pv.value,
        actualValue: actual.actualValue,
        weight: pv.metric.weight,
        percentageError,
        weightedError,
      });
    }

    const totalWeightedError = calculateTotalScore(metricScores);

    scores.push({
      predictionId: prediction.id,
      userId: prediction.userId,
      metricScores,
      totalWeightedError,
    });
  }

  // Sort by total error (ascending - lower is better)
  scores.sort((a, b) => a.totalWeightedError - b.totalWeightedError);

  // Assign ranks (handling ties)
  let currentRank = 1;
  for (let i = 0; i < scores.length; i++) {
    if (
      i > 0 &&
      scores[i].totalWeightedError !== scores[i - 1].totalWeightedError
    ) {
      currentRank = i + 1;
    }
    scores[i].rank = currentRank;
  }

  return scores;
}

/**
 * Default metric weights configuration
 */
export const DEFAULT_METRIC_WEIGHTS: Record<string, number> = {
  REVENUE: 0.25,
  EPS: 0.25,
  NET_INCOME: 0.2,
  FORWARD_REVENUE_GUIDANCE: 0.15,
  FORWARD_EPS_GUIDANCE: 0.15,
};
