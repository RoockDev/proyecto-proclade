import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  MatchingThresholds,
  MatchingWeights,
} from './types/chatbot.types';

type MatchingConfigSnapshot = {
  weights: MatchingWeights;
  thresholds: MatchingThresholds;
  fuzzyInternalMin: number;
};

@Injectable()
export class ChatbotMatchingConfigService {
  private runtimeOverride: MatchingConfigSnapshot | null = null;

  constructor(private readonly configService: ConfigService) {}

  setRuntimeConfig(config: MatchingConfigSnapshot) {
    this.runtimeOverride = config;
  }

  getWeights = (): MatchingWeights => {
    if (this.runtimeOverride) {
      return this.runtimeOverride.weights;
    }

    const rawWeights = {
      keyword: this.getNumber('CHATBOT_WEIGHT_KEYWORD', 0.2, 0, 1),
      fuzzy: this.getNumber('CHATBOT_WEIGHT_FUZZY', 0.28, 0, 1),
      semantic: this.getNumber('CHATBOT_WEIGHT_SEMANTIC', 0.42, 0, 1),
      context: this.getNumber('CHATBOT_WEIGHT_CONTEXT', 0.1, 0, 1),
    };

    const totalWeight =
      rawWeights.keyword +
      rawWeights.fuzzy +
      rawWeights.semantic +
      rawWeights.context;

    if (totalWeight <= 0) {
      return {
        keyword: 0.2,
        fuzzy: 0.28,
        semantic: 0.42,
        context: 0.1,
      };
    }

    return {
      keyword: rawWeights.keyword / totalWeight,
      fuzzy: rawWeights.fuzzy / totalWeight,
      semantic: rawWeights.semantic / totalWeight,
      context: rawWeights.context / totalWeight,
    };
  };

  getThresholds = (): MatchingThresholds => {
    if (this.runtimeOverride) {
      return this.runtimeOverride.thresholds;
    }

    const directAnswer = this.getNumber(
      'CHATBOT_THRESHOLD_DIRECT_ANSWER',
      0.66,
      0,
      1,
    );
    const clarification = this.getNumber(
      'CHATBOT_THRESHOLD_CLARIFICATION',
      0.45,
      0,
      1,
    );

    if (clarification > directAnswer) {
      return {
        directAnswer: clarification,
        clarification: clarification,
      };
    }

    return {
      directAnswer,
      clarification,
    };
  };

  getFuzzyInternalMin = () => {
    if (this.runtimeOverride) {
      return this.runtimeOverride.fuzzyInternalMin;
    }

    return this.getNumber('CHATBOT_FUZZY_INTERNAL_MIN', 0.33, 0, 1);
  };

  private getNumber = (
    key: string,
    fallback: number,
    min: number,
    max: number,
  ) => {
    const rawValue = this.configService.get<string>(key);

    if (!rawValue) {
      return fallback;
    }

    const parsedValue = Number(rawValue);

    if (Number.isNaN(parsedValue)) {
      return fallback;
    }

    if (parsedValue < min) {
      return min;
    }

    if (parsedValue > max) {
      return max;
    }

    return parsedValue;
  };
}
