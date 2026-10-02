/// <reference lib="webworker" />

import { pipeline } from "@huggingface/transformers";
import {
  QUERY_FILTER_CLASSIFICATION_GROUPS,
  QUERY_UNDERSTANDING_MODEL
} from "./queryUnderstandingConfig";
import {
  ModelFilterDiagnostic,
  ModelFilterEvidence,
  QueryFilterValues,
  QueryUnderstandingWorkerRequest,
  QueryUnderstandingWorkerResponse
} from "./queryUnderstandingTypes";

interface ZeroShotOutput {
  labels: string[];
  scores: number[];
}

type ZeroShotClassifier = (
  text: string,
  candidateLabels: string[],
  options: { hypothesis_template: string; multi_label: boolean }
) => Promise<ZeroShotOutput>;

const workerScope = self as unknown as DedicatedWorkerGlobalScope;
let classifierPromise: Promise<ZeroShotClassifier> | undefined;
let modelReady = false;

const post = (message: QueryUnderstandingWorkerResponse) =>
  workerScope.postMessage(message);

const getClassifier = () => {
  if (!classifierPromise) {
    const startedAt = performance.now();
    post({
      type: "model-loading",
      modelId: QUERY_UNDERSTANDING_MODEL.id,
      device: QUERY_UNDERSTANDING_MODEL.device
    });

    classifierPromise = pipeline(
      "zero-shot-classification",
      QUERY_UNDERSTANDING_MODEL.id,
      {
        dtype: QUERY_UNDERSTANDING_MODEL.dtype,
        device: QUERY_UNDERSTANDING_MODEL.device,
        progress_callback: progress => {
          const progressData = progress as {
            file?: string;
            progress?: number;
            loaded?: number;
            total?: number;
          };
          post({
            type: "model-progress",
            modelId: QUERY_UNDERSTANDING_MODEL.id,
            file: progressData.file,
            progress: progressData.progress,
            loaded: progressData.loaded,
            total: progressData.total
          });
        }
      }
    ).then(classifierPipeline => {
      modelReady = true;
      post({
        type: "model-ready",
        modelId: QUERY_UNDERSTANDING_MODEL.id,
        durationMs: performance.now() - startedAt
      });
      return classifierPipeline as unknown as ZeroShotClassifier;
    });
  }

  return classifierPromise;
};

workerScope.onmessage = async event => {
  const message = event.data as QueryUnderstandingWorkerRequest;
  if (message.type !== "classify") return;

  const startedAt = performance.now();

  try {
    const classifier = await getClassifier();
    const inferredFilters: QueryFilterValues = {};
    const evidence: ModelFilterEvidence[] = [];
    const diagnostics: ModelFilterDiagnostic[] = [];
    const excludedFilterIds = new Set(message.excludedFilterIds);
    const groupsToClassify = QUERY_FILTER_CLASSIFICATION_GROUPS.filter(
      group => !excludedFilterIds.has(group.filterId)
    );
    const topicLabels = groupsToClassify.map(group => group.topicLabel);
    const topicOutput = topicLabels.length
      ? await classifier(message.query, topicLabels, {
          hypothesis_template:
            QUERY_UNDERSTANDING_MODEL.topicHypothesisTemplate,
          multi_label: true
        })
      : { labels: [], scores: [] };
    const topicScoreByLabel = new Map(
      topicOutput.labels.map((label, index) => [label, topicOutput.scores[index]])
    );

    for (const group of QUERY_FILTER_CLASSIFICATION_GROUPS) {
      const skippedByRule = excludedFilterIds.has(group.filterId);
      const topicScore = topicScoreByLabel.get(group.topicLabel) ?? 0;
      const topicAccepted =
        !skippedByRule && topicScore >= group.minimumTopicScore;

      if (!topicAccepted) {
        diagnostics.push({
          filterId: group.filterId,
          accepted: false,
          topicScore,
          combinedScore: 0,
          topicAccepted: false,
          skippedByRule,
          noMatchScore: 0,
          candidates: []
        });
        continue;
      }

      const candidateLabels = [
        ...group.candidates.map(candidate => candidate.label),
        group.noMatchLabel
      ];
      const output = await classifier(message.query, candidateLabels, {
          hypothesis_template:
            QUERY_UNDERSTANDING_MODEL.valueHypothesisTemplate,
          multi_label: false
      });
      const scoreByLabel = new Map(
        output.labels.map((label, index) => [label, output.scores[index]])
      );
      const candidates = group.candidates
        .map(candidate => ({
          value: candidate.value,
          label: candidate.label,
          score: scoreByLabel.get(candidate.label) ?? 0
        }))
        .sort((left, right) => right.score - left.score);
      const noMatchScore = scoreByLabel.get(group.noMatchLabel) ?? 0;
      const best = candidates[0];
      const runnerUpScore = Math.max(candidates[1]?.score ?? 0, noMatchScore);
      const margin = best.score - runnerUpScore;
      const combinedScore = topicScore * best.score;
      const accepted =
        best.score >= group.minimumScore &&
        margin >= group.minimumMargin &&
        best.score > noMatchScore &&
        combinedScore >= group.minimumCombinedScore;

      diagnostics.push({
        filterId: group.filterId,
        accepted,
        topicScore,
        combinedScore,
        topicAccepted,
        skippedByRule,
        noMatchScore,
        candidates
      });

      if (!accepted) continue;

      inferredFilters[group.filterId] = [best.value];
      evidence.push({
        filterId: group.filterId,
        value: best.value,
        label: best.label,
        confidence: best.score,
        margin,
        combinedScore
      });
    }

    post({
      type: "result",
      requestId: message.requestId,
      result: { inferredFilters, evidence, diagnostics },
      durationMs: performance.now() - startedAt
    });
  } catch (error) {
    if (!modelReady) classifierPromise = undefined;
    post({
      type: "error",
      requestId: message.requestId,
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

export {};
