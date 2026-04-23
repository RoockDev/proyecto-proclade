import { Injectable } from '@nestjs/common';
import type {
  KnowledgeCandidate,
  MatchingSessionContext,
  ScoredCandidate,
  ScoreBreakdown,
} from './types/chatbot.types';
import { ChatbotMatchingConfigService } from './chatbot-matching-config.service';

type ScoreCandidatesInput = {
  normalizedMessage: string;
  candidates: KnowledgeCandidate[];
  pageContext?: string;
  sessionContext: MatchingSessionContext;
};

type SemanticArtifacts = {
  fingerprint: string;
  idfByToken: Map<string, number>;
  vectorByCandidateId: Map<number, Map<string, number>>;
};

const CRITICAL_KEYWORD_WEIGHTS = new Map<string, number>([
  ['donar', 1.4],
  ['donacion', 1.4],
  ['noticias', 1.3],
  ['colabora', 1.3],
  ['colaborar', 1.3],
  ['superheroe', 1.3],
  ['superheroes', 1.3],
  ['contacto', 1.2],
  ['retos', 1.2],
  ['bibliotecas', 1.2],
  ['hambre', 1.2],
]);

const SPANISH_STOPWORDS = new Set<string>([
  'a',
  'al',
  'algo',
  'algunas',
  'algunos',
  'ante',
  'como',
  'con',
  'contra',
  'cual',
  'cuales',
  'de',
  'del',
  'desde',
  'donde',
  'el',
  'ella',
  'ellas',
  'ellos',
  'en',
  'entre',
  'era',
  'eramos',
  'eran',
  'es',
  'esa',
  'esas',
  'ese',
  'eso',
  'esos',
  'esta',
  'estaba',
  'estaban',
  'este',
  'esto',
  'estos',
  'fue',
  'ha',
  'hacia',
  'hasta',
  'hay',
  'la',
  'las',
  'le',
  'les',
  'lo',
  'los',
  'me',
  'mi',
  'mis',
  'muchas',
  'muchos',
  'muy',
  'nos',
  'o',
  'para',
  'pero',
  'por',
  'que',
  'quien',
  'se',
  'si',
  'sin',
  'sobre',
  'su',
  'sus',
  'te',
  'tu',
  'tus',
  'un',
  'una',
  'uno',
  'unos',
  'unas',
  'y',
  'ya',
]);

const DOMAIN_PHRASE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bsuper\s+errores\b/g, 'superheroes'],
  [/\bsuper\s+heroes\b/g, 'superheroes'],
  [/\bsuper\s+heroe\b/g, 'superheroe'],
  [/\bequipo\s+patch\b/g, 'equipo puch'],
  [/\bequipo\s+punch\b/g, 'equipo puch'],
  [/\bbiblioteca\s+humana\b/g, 'bibliotecas humanas'],
];

@Injectable()
export class ChatbotMatchingEngineService {
  private semanticArtifactsCache: SemanticArtifacts | null = null;

  constructor(
    private readonly chatbotMatchingConfigService: ChatbotMatchingConfigService,
  ) {}

  scoreCandidates = (input: ScoreCandidatesInput): ScoredCandidate[] => {
    const rawNormalizedMessage = this.normalizeText(input.normalizedMessage);
    const candidateVocabulary = this.buildCandidateVocabulary(input.candidates);
    const queryTokens = this.normalizeQueryTokens(
      this.tokenize(rawNormalizedMessage, true),
      candidateVocabulary,
    );
    const correctedNormalizedMessage = queryTokens.join(' ').trim();
    const artifacts = this.getSemanticArtifacts(input.candidates);

    return input.candidates
      .map((candidate) => {
        const scoreBreakdown = this.computeScoreBreakdown({
          normalizedMessage: rawNormalizedMessage,
          correctedNormalizedMessage,
          queryTokens,
          candidate,
          pageContext: input.pageContext,
          sessionContext: input.sessionContext,
          semanticArtifacts: artifacts,
        });

        return {
          candidate,
          score: scoreBreakdown.finalScore,
          scoreBreakdown,
        };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, 5);
  };

  getConfigSnapshot = () => {
    return {
      weights: this.chatbotMatchingConfigService.getWeights(),
      thresholds: this.chatbotMatchingConfigService.getThresholds(),
      fuzzyInternalMin: this.chatbotMatchingConfigService.getFuzzyInternalMin(),
    };
  };

  private computeScoreBreakdown = (input: {
    normalizedMessage: string;
    correctedNormalizedMessage: string;
    queryTokens: string[];
    candidate: KnowledgeCandidate;
    pageContext?: string;
    sessionContext: MatchingSessionContext;
    semanticArtifacts: SemanticArtifacts;
  }): ScoreBreakdown => {
    const keywordScore = this.computeKeywordScore(
      input.queryTokens,
      input.candidate,
    );
    const fuzzyScore = this.computeFuzzyScore(
      input.normalizedMessage,
      input.correctedNormalizedMessage,
      input.queryTokens,
      input.candidate,
    );
    const semanticScore = this.computeSemanticScore(
      input.queryTokens,
      input.candidate,
      input.semanticArtifacts,
    );
    const contextScore = this.computeContextScore({
      candidate: input.candidate,
      pageContext: input.pageContext,
      sessionContext: input.sessionContext,
    });
    const finalScore = this.composeScore({
      keywordScore,
      fuzzyScore,
      semanticScore,
      contextScore,
    });
    const adjustedFinalScore = this.applyShortQueryPenalty({
      finalScore,
      queryTokens: input.queryTokens,
      normalizedMessage: input.normalizedMessage,
      correctedNormalizedMessage: input.correctedNormalizedMessage,
      candidate: input.candidate,
    });

    return {
      keywordScore,
      fuzzyScore,
      semanticScore,
      contextScore,
      finalScore: adjustedFinalScore,
    };
  };

  private computeKeywordScore = (
    queryTokens: string[],
    candidate: KnowledgeCandidate,
  ) => {
    const candidateKeywords = this.buildCandidateKeywords(candidate);

    if (candidateKeywords.length === 0) {
      return 0;
    }

    const queryTokenSet = new Set(queryTokens);
    const totalWeight = candidateKeywords.reduce((accumulator, keyword) => {
      return accumulator + this.getKeywordWeight(keyword);
    }, 0);

    if (totalWeight <= 0) {
      return 0;
    }

    const matchedWeight = candidateKeywords.reduce((accumulator, keyword) => {
      if (!queryTokenSet.has(keyword)) {
        return accumulator;
      }

      return accumulator + this.getKeywordWeight(keyword);
    }, 0);

    return this.roundScore(matchedWeight / totalWeight);
  };

  private computeFuzzyScore = (
    normalizedMessage: string,
    correctedNormalizedMessage: string,
    queryTokens: string[],
    candidate: KnowledgeCandidate,
  ) => {
    const candidateTexts = [candidate.questionCanonical, ...candidate.phrases]
      .map((value) => this.normalizeText(value))
      .filter((value) => value.length > 0);

    if (candidateTexts.length === 0) {
      return 0;
    }

    const candidateSimilarities = candidateTexts.map((candidateText) => {
      const jaroWinklerBase = this.jaroWinklerSimilarity(
        normalizedMessage,
        candidateText,
      );
      const jaroWinklerCorrected = correctedNormalizedMessage
        ? this.jaroWinklerSimilarity(correctedNormalizedMessage, candidateText)
        : 0;
      const candidateTokens = this.tokenize(candidateText, true);
      const tokenLevenshtein = this.tokenLevenshteinSimilarity(
        queryTokens,
        candidateTokens,
      );

      return Math.max(jaroWinklerBase, jaroWinklerCorrected, tokenLevenshtein);
    });

    let fuzzyScore = Math.max(...candidateSimilarities);

    // Penalización de coincidencias engañosas en frases demasiado cortas.
    if (queryTokens.length <= 1 && normalizedMessage.length <= 4) {
      fuzzyScore *= 0.6;
    }

    const fuzzyInternalMin =
      this.chatbotMatchingConfigService.getFuzzyInternalMin();
    if (fuzzyScore < fuzzyInternalMin) {
      return 0;
    }

    return this.roundScore(fuzzyScore);
  };

  private computeSemanticScore = (
    queryTokens: string[],
    candidate: KnowledgeCandidate,
    artifacts: SemanticArtifacts,
  ) => {
    const queryVector = this.buildTfidfVector(
      queryTokens,
      artifacts.idfByToken,
    );
    const candidateVector = artifacts.vectorByCandidateId.get(candidate.id);

    if (!candidateVector || queryVector.size === 0) {
      return 0;
    }

    return this.roundScore(this.cosineSimilarity(queryVector, candidateVector));
  };

  private computeContextScore = (input: {
    candidate: KnowledgeCandidate;
    pageContext?: string;
    sessionContext: MatchingSessionContext;
  }) => {
    const intentRecency =
      input.sessionContext.lastDetectedIntentCode &&
      input.candidate.intentCode &&
      input.sessionContext.lastDetectedIntentCode === input.candidate.intentCode
        ? 1
        : 0;

    const pageContextMatch = this.computePageContextMatch(
      input.pageContext,
      input.candidate.route,
    );

    const sessionContinuity = this.computeSessionContinuity(
      input.sessionContext.lastMessageAt,
      input.sessionContext.startedAt,
    );

    const contextScore =
      intentRecency * 0.5 + pageContextMatch * 0.3 + sessionContinuity * 0.2;

    return this.roundScore(contextScore);
  };

  private composeScore = (scores: {
    keywordScore: number;
    fuzzyScore: number;
    semanticScore: number;
    contextScore: number;
  }) => {
    const weights = this.chatbotMatchingConfigService.getWeights();

    const finalScore =
      weights.keyword * scores.keywordScore +
      weights.fuzzy * scores.fuzzyScore +
      weights.semantic * scores.semanticScore +
      weights.context * scores.contextScore;

    return this.roundScore(finalScore);
  };

  private applyShortQueryPenalty = (input: {
    finalScore: number;
    queryTokens: string[];
    normalizedMessage: string;
    correctedNormalizedMessage: string;
    candidate: KnowledgeCandidate;
  }) => {
    const candidateCanonical = this.normalizeText(input.candidate.questionCanonical);
    const isExactCanonicalMatch =
      candidateCanonical === input.normalizedMessage ||
      candidateCanonical === input.correctedNormalizedMessage;

    if (isExactCanonicalMatch) {
      return input.finalScore;
    }

    if (input.queryTokens.length <= 1) {
      return this.roundScore(input.finalScore * 0.55);
    }

    if (input.queryTokens.length === 2) {
      return this.roundScore(input.finalScore * 0.85);
    }

    return input.finalScore;
  };

  private getSemanticArtifacts = (candidates: KnowledgeCandidate[]) => {
    const fingerprint = this.buildCandidatesFingerprint(candidates);

    if (
      this.semanticArtifactsCache &&
      this.semanticArtifactsCache.fingerprint === fingerprint
    ) {
      return this.semanticArtifactsCache;
    }

    const documents = new Map<number, string[]>();
    for (const candidate of candidates) {
      const content = [candidate.questionCanonical, ...candidate.phrases]
        .join(' ')
        .concat(' ', candidate.tags.join(' '));
      documents.set(
        candidate.id,
        this.tokenize(this.normalizeText(content), true),
      );
    }

    const idfByToken = this.buildInverseDocumentFrequency(documents);
    const vectorByCandidateId = new Map<number, Map<string, number>>();
    for (const [candidateId, tokens] of documents.entries()) {
      vectorByCandidateId.set(
        candidateId,
        this.buildTfidfVector(tokens, idfByToken),
      );
    }

    const artifacts: SemanticArtifacts = {
      fingerprint,
      idfByToken,
      vectorByCandidateId,
    };

    this.semanticArtifactsCache = artifacts;

    return artifacts;
  };

  private buildInverseDocumentFrequency = (
    documents: Map<number, string[]>,
  ): Map<string, number> => {
    const documentCount = documents.size;
    const documentFrequencyByToken = new Map<string, number>();

    for (const tokens of documents.values()) {
      const uniqueTokens = new Set(tokens);
      for (const token of uniqueTokens) {
        const current = documentFrequencyByToken.get(token) ?? 0;
        documentFrequencyByToken.set(token, current + 1);
      }
    }

    const idfByToken = new Map<string, number>();

    for (const [
      token,
      documentFrequency,
    ] of documentFrequencyByToken.entries()) {
      const idf = Math.log((1 + documentCount) / (1 + documentFrequency)) + 1;
      idfByToken.set(token, idf);
    }

    return idfByToken;
  };

  private buildTfidfVector = (
    tokens: string[],
    idfByToken: Map<string, number>,
  ): Map<string, number> => {
    if (tokens.length === 0) {
      return new Map<string, number>();
    }

    const frequencyByToken = new Map<string, number>();
    for (const token of tokens) {
      frequencyByToken.set(token, (frequencyByToken.get(token) ?? 0) + 1);
    }

    const vector = new Map<string, number>();

    for (const [token, frequency] of frequencyByToken.entries()) {
      const idf = idfByToken.get(token);
      if (idf) {
        const termFrequency = frequency / tokens.length;
        vector.set(token, termFrequency * idf);
      }
    }

    return vector;
  };

  private cosineSimilarity = (
    left: Map<string, number>,
    right: Map<string, number>,
  ) => {
    if (left.size === 0 || right.size === 0) {
      return 0;
    }

    let dotProduct = 0;
    let leftNormSquare = 0;
    let rightNormSquare = 0;

    for (const [token, leftWeight] of left.entries()) {
      leftNormSquare += leftWeight * leftWeight;
      const rightWeight = right.get(token) ?? 0;
      dotProduct += leftWeight * rightWeight;
    }

    for (const rightWeight of right.values()) {
      rightNormSquare += rightWeight * rightWeight;
    }

    const denominator = Math.sqrt(leftNormSquare) * Math.sqrt(rightNormSquare);
    if (denominator === 0) {
      return 0;
    }

    return this.clampScore(dotProduct / denominator);
  };

  private tokenLevenshteinSimilarity = (
    queryTokens: string[],
    candidateTokens: string[],
  ) => {
    if (queryTokens.length === 0 || candidateTokens.length === 0) {
      return 0;
    }

    const similarities = queryTokens.map((queryToken) => {
      return candidateTokens.reduce((best, candidateToken) => {
        const value = this.levenshteinSimilarity(queryToken, candidateToken);
        return value > best ? value : best;
      }, 0);
    });

    const average =
      similarities.reduce((accumulator, value) => accumulator + value, 0) /
      similarities.length;

    return this.clampScore(average);
  };

  private levenshteinSimilarity = (left: string, right: string) => {
    if (left === right) {
      return 1;
    }

    if (!left || !right) {
      return 0;
    }

    const matrix: number[][] = [];

    for (let row = 0; row <= left.length; row += 1) {
      const currentRow: number[] = [];

      for (let column = 0; column <= right.length; column += 1) {
        currentRow.push(0);
      }

      matrix.push(currentRow);
    }

    for (let index = 0; index <= left.length; index += 1) {
      matrix[index][0] = index;
    }
    for (let index = 0; index <= right.length; index += 1) {
      matrix[0][index] = index;
    }

    for (let row = 1; row <= left.length; row += 1) {
      for (let column = 1; column <= right.length; column += 1) {
        const cost = left[row - 1] === right[column - 1] ? 0 : 1;
        matrix[row][column] = Math.min(
          matrix[row - 1][column] + 1,
          matrix[row][column - 1] + 1,
          matrix[row - 1][column - 1] + cost,
        );
      }
    }

    const distance = matrix[left.length][right.length];
    const maxLength = Math.max(left.length, right.length);

    return this.clampScore(1 - distance / maxLength);
  };

  private jaroWinklerSimilarity = (left: string, right: string) => {
    if (left === right) {
      return 1;
    }

    const maxDistance = Math.floor(Math.max(left.length, right.length) / 2) - 1;
    if (maxDistance < 0) {
      return 0;
    }

    const leftMatches = new Array(left.length).fill(false);
    const rightMatches = new Array(right.length).fill(false);

    let matchCount = 0;

    for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
      const start = Math.max(0, leftIndex - maxDistance);
      const end = Math.min(leftIndex + maxDistance + 1, right.length);
      let didMatchCharacter = false;

      for (let rightIndex = start; rightIndex < end; rightIndex += 1) {
        const canMatchIndex =
          !didMatchCharacter &&
          !rightMatches[rightIndex] &&
          left[leftIndex] === right[rightIndex];

        if (canMatchIndex) {
          leftMatches[leftIndex] = true;
          rightMatches[rightIndex] = true;
          matchCount += 1;
          didMatchCharacter = true;
        }
      }
    }

    if (matchCount === 0) {
      return 0;
    }

    let transpositions = 0;
    let rightIndex = 0;

    for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
      if (leftMatches[leftIndex]) {
        while (!rightMatches[rightIndex]) {
          rightIndex += 1;
        }

        if (left[leftIndex] !== right[rightIndex]) {
          transpositions += 1;
        }

        rightIndex += 1;
      }
    }

    const transpositionCount = transpositions / 2;
    const jaro =
      (matchCount / left.length +
        matchCount / right.length +
        (matchCount - transpositionCount) / matchCount) /
      3;

    let commonPrefixLength = 0;
    const maxPrefix = 4;
    let hasPrefixMismatch = false;
    for (
      let index = 0;
      index < Math.min(maxPrefix, left.length, right.length);
      index += 1
    ) {
      const isSamePrefixCharacter = left[index] === right[index];

      if (!hasPrefixMismatch && isSamePrefixCharacter) {
        commonPrefixLength += 1;
      } else {
        hasPrefixMismatch = true;
      }
    }

    const jaroWinkler = jaro + commonPrefixLength * 0.1 * (1 - jaro);

    return this.clampScore(jaroWinkler);
  };

  private buildCandidateKeywords = (candidate: KnowledgeCandidate) => {
    const content = [
      candidate.questionCanonical,
      ...candidate.phrases,
      ...candidate.tags,
    ].join(' ');

    return Array.from(
      new Set(this.tokenize(this.normalizeText(content), true)),
    );
  };

  private getKeywordWeight = (keyword: string) => {
    return CRITICAL_KEYWORD_WEIGHTS.get(keyword) ?? 1;
  };

  private computePageContextMatch = (
    pageContext: string | undefined,
    route: string | null,
  ) => {
    if (!pageContext || !route) {
      return 0;
    }

    const normalizedPage = `/${pageContext.replace(/^\/+/, '').trim()}`;
    const normalizedRoute = `/${route.replace(/^\/+/, '').trim()}`;

    if (normalizedPage === normalizedRoute) {
      return 1;
    }

    if (
      normalizedPage.startsWith(normalizedRoute) ||
      normalizedRoute.startsWith(normalizedPage)
    ) {
      return 0.7;
    }

    return 0;
  };

  private computeSessionContinuity = (
    lastMessageAt: Date | null,
    startedAt: Date | null,
  ) => {
    const referenceDate = lastMessageAt ?? startedAt;

    if (!referenceDate) {
      return 0.2;
    }

    const elapsedMs = Date.now() - referenceDate.getTime();
    const elapsedMinutes = elapsedMs / (1000 * 60);

    if (elapsedMinutes <= 2) {
      return 1;
    }

    if (elapsedMinutes <= 10) {
      return 0.7;
    }

    if (elapsedMinutes <= 30) {
      return 0.4;
    }

    return 0.2;
  };

  private buildCandidatesFingerprint = (candidates: KnowledgeCandidate[]) => {
    return candidates
      .map((candidate) => {
        return [
          candidate.id,
          candidate.intentCode ?? '',
          candidate.questionCanonical,
          candidate.tags.join('|'),
          candidate.phrases.join('|'),
          candidate.route ?? '',
        ].join('#');
      })
      .join('||');
  };

  private normalizeText = (text: string) => {
    const normalizedBase = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ');

    return this.applyDomainPhraseReplacements(normalizedBase);
  };

  private applyDomainPhraseReplacements = (text: string) => {
    let output = text;

    for (const [pattern, replacement] of DOMAIN_PHRASE_REPLACEMENTS) {
      output = output.replace(pattern, replacement);
    }

    return output;
  };

  private buildCandidateVocabulary = (candidates: KnowledgeCandidate[]) => {
    const vocabulary = new Set<string>();

    for (const candidate of candidates) {
      const content = [
        candidate.questionCanonical,
        ...candidate.phrases,
        ...candidate.tags,
      ].join(' ');
      const tokens = this.tokenize(this.normalizeText(content), true);

      for (const token of tokens) {
        if (token.length >= 3) {
          vocabulary.add(token);
        }
      }
    }

    return vocabulary;
  };

  private normalizeQueryTokens = (
    tokens: string[],
    candidateVocabulary: Set<string>,
  ) => {
    if (tokens.length === 0 || candidateVocabulary.size === 0) {
      return tokens;
    }

    const mergedCorrections = this.correctMergedTokens(
      tokens,
      candidateVocabulary,
    );

    return mergedCorrections.map((token) => {
      if (candidateVocabulary.has(token) || token.length < 3) {
        return token;
      }

      const closestMatch = this.findClosestVocabularyToken(
        token,
        candidateVocabulary,
      );

      return closestMatch ?? token;
    });
  };

  private correctMergedTokens = (
    tokens: string[],
    candidateVocabulary: Set<string>,
  ) => {
    const output: string[] = [];
    let index = 0;

    while (index < tokens.length) {
      const current = tokens[index];
      const next = tokens[index + 1];

      if (next) {
        const merged = `${current}${next}`;
        const closestMergedMatch = this.findClosestVocabularyToken(
          merged,
          candidateVocabulary,
          0.7,
        );

        const hasMergedMatch = Boolean(closestMergedMatch);

        if (hasMergedMatch && closestMergedMatch) {
          output.push(closestMergedMatch);
          index += 2;
        } else {
          output.push(current);
          index += 1;
        }
      } else {
        output.push(current);
        index += 1;
      }
    }

    return output;
  };

  private findClosestVocabularyToken = (
    token: string,
    candidateVocabulary: Set<string>,
    minimumSimilarity = 0.78,
  ) => {
    let bestToken: string | null = null;
    let bestSimilarity = 0;

    for (const vocabularyToken of candidateVocabulary.values()) {
      const lengthGap = Math.abs(vocabularyToken.length - token.length);

      if (lengthGap <= 4) {
        const similarity = this.levenshteinSimilarity(token, vocabularyToken);

        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestToken = vocabularyToken;
        }
      }
    }

    if (bestSimilarity < minimumSimilarity) {
      return null;
    }

    return bestToken;
  };

  private tokenize = (text: string, removeStopwords: boolean) => {
    const rawTokens = text
      .split(' ')
      .map((token) => token.trim())
      .filter((token) => token.length > 1);

    if (!removeStopwords) {
      return rawTokens;
    }

    return rawTokens.filter((token) => !SPANISH_STOPWORDS.has(token));
  };

  private roundScore = (value: number) => {
    return Math.round(this.clampScore(value) * 10000) / 10000;
  };

  private clampScore = (value: number) => {
    if (value < 0) {
      return 0;
    }

    if (value > 1) {
      return 1;
    }

    return value;
  };
}
