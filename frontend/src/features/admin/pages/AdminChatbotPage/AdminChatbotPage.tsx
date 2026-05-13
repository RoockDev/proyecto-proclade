import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createChatbotKnowledge,
  deleteChatbotUnresolved,
  fetchChatbotMetrics,
  listChatbotKnowledge,
  listChatbotUnresolved,
  reopenChatbotUnresolved,
  resolveChatbotUnresolved,
  updateChatbotKnowledge,
} from '../../api/admin-chatbot.api';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import type {
  ChatbotKnowledgeItem,
  ChatbotMetricsData,
  ChatbotUnresolvedQuestion,
} from '../../types/chatbot-admin.types';
import './AdminChatbotPage.css';

type NotificationType = 'success' | 'error';
type NotificationState = {
  message: string;
  type: NotificationType;
};

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;
const formatDuration = (value: number) => `${Math.round(value / 1000)}s`;
const normalizeForKnowledgeMatch = (value?: string | null) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
};
const UNRESOLVED_ROWS_PER_PAGE = 5;

export const AdminChatbotPage = () => {
  const [metrics, setMetrics] = useState<ChatbotMetricsData | null>(null);
  const [unresolved, setUnresolved] = useState<ChatbotUnresolvedQuestion[]>([]);
  const [totalUnresolved, setTotalUnresolved] = useState(0);
  const [, setMetricLoading] = useState(false);
  const [unresolvedLoading, setUnresolvedLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unresolvedPage, setUnresolvedPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [reopeningId, setReopeningId] = useState<number | null>(null);
  const [questionEditingId, setQuestionEditingId] = useState<number | null>(null);
  const [savingQuestionId, setSavingQuestionId] = useState<number | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);
  const [deleteCandidate, setDeleteCandidate] =
    useState<ChatbotUnresolvedQuestion | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const [loadingDraftId, setLoadingDraftId] = useState<number | null>(null);
  const [hasKnowledgeById, setHasKnowledgeById] = useState<Record<number, boolean>>(
    {},
  );
  const [canonicalByUnresolvedId, setCanonicalByUnresolvedId] = useState<
    Record<number, string>
  >({});
  const [questionDraftById, setQuestionDraftById] = useState<Record<number, string>>(
    {},
  );
  const [answerDraftById, setAnswerDraftById] = useState<Record<number, string>>(
    {},
  );
  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
  }, []);

  const loadMetrics = useCallback(async () => {
    setMetricLoading(true);
    setError(null);

    try {
      const response = await fetchChatbotMetrics();
      if (response.success && response.data?.metrics) {
        setMetrics(response.data.metrics);
      } else {
        setError(response.message || 'Error al cargar métricas del asistente');
      }
    } catch (err) {
      console.error(err);
      setError('Error al recuperar las métricas del chatbot');
    } finally {
      setMetricLoading(false);
    }
  }, []);

  const loadUnresolved = useCallback(
    async ({
      search,
      page,
    }: {
      search?: string;
      page?: number;
    } = {}) => {
      setUnresolvedLoading(true);
      setError(null);

      try {
        const searchValue = search?.trim() || undefined;
        const pageValue = Math.max(0, page ?? 0);
        const response = await listChatbotUnresolved({
          search: searchValue,
          page: pageValue,
          pageSize: UNRESOLVED_ROWS_PER_PAGE,
        });

        if (response.success && response.data) {
          const items = response.data.unresolved.items;
          setUnresolved(items);
          setTotalUnresolved(response.data.unresolved.total);
          const totalPages = Math.max(
            1,
            Math.ceil(response.data.unresolved.total / UNRESOLVED_ROWS_PER_PAGE),
          );
          if (pageValue > totalPages - 1) {
            setUnresolvedPage(totalPages - 1);
          }
          const knowledgeChecks = await Promise.all(
            items.map(async (item) => {
              try {
                const knowledgeResponse = await listChatbotKnowledge({
                  search: item.normalizedText,
                  page: 0,
                  pageSize: 20,
                });

                if (!knowledgeResponse.success || !knowledgeResponse.data) {
                  return {
                    id: item.id,
                    hasKnowledge: false,
                    canonical: item.normalizedText,
                  };
                }

                const knowledgeMatch =
                  knowledgeResponse.data.knowledge.items.find(
                    (knowledgeItem) =>
                      normalizeForKnowledgeMatch(knowledgeItem.questionCanonical) ===
                        normalizeForKnowledgeMatch(item.normalizedText) ||
                      normalizeForKnowledgeMatch(knowledgeItem.questionCanonical) ===
                        normalizeForKnowledgeMatch(item.sampleText),
                  ) || null;

                const hasKnowledge = Boolean(knowledgeMatch);
                return {
                  id: item.id,
                  hasKnowledge,
                  canonical: knowledgeMatch?.questionCanonical || item.normalizedText,
                };
              } catch {
                return {
                  id: item.id,
                  hasKnowledge: false,
                  canonical: item.normalizedText,
                };
              }
            }),
          );
          setHasKnowledgeById(
            Object.fromEntries(
              knowledgeChecks.map((entry) => [entry.id, entry.hasKnowledge]),
            ),
          );
          setCanonicalByUnresolvedId(
            Object.fromEntries(
              knowledgeChecks.map((entry) => [entry.id, entry.canonical]),
            ),
          );
        } else {
          setError(response.message || 'Error al cargar preguntas no resueltas');
        }
      } catch (err) {
        console.error(err);
        setError('Error al consultar preguntas pendientes');
      } finally {
        setUnresolvedLoading(false);
      }
    },
    [],
  );

  const findKnowledgeForQuestion = useCallback(
    async (
      normalizedText: string,
      sampleText?: string,
      canonicalHint?: string,
    ) => {
      const candidates: ChatbotKnowledgeItem[] = [];

      if (canonicalHint?.trim()) {
        const hintResponse = await listChatbotKnowledge({
          search: canonicalHint,
          page: 0,
          pageSize: 20,
        });
        if (hintResponse.success && hintResponse.data) {
          candidates.push(...hintResponse.data.knowledge.items);
        }
      }

      const primaryResponse = await listChatbotKnowledge({
        search: normalizedText,
        page: 0,
        pageSize: 20,
      });

      if (!primaryResponse.success || !primaryResponse.data) {
        throw new Error(
          primaryResponse.message || 'No se pudo consultar conocimiento',
        );
      }

      candidates.push(...primaryResponse.data.knowledge.items);

      if (sampleText) {
        const secondaryResponse = await listChatbotKnowledge({
          search: sampleText,
          page: 0,
          pageSize: 20,
        });
        if (secondaryResponse.success && secondaryResponse.data) {
          candidates.push(...secondaryResponse.data.knowledge.items);
        }
      }

      const fallbackResponse = await listChatbotKnowledge({
        page: 0,
        pageSize: 100,
      });
      if (fallbackResponse.success && fallbackResponse.data) {
        candidates.push(...fallbackResponse.data.knowledge.items);
      }

      const normalizedNeedle = normalizeForKnowledgeMatch(normalizedText);
      const sampleNeedle = normalizeForKnowledgeMatch(sampleText);
      const canonicalNeedle = normalizeForKnowledgeMatch(canonicalHint);

      return (
        candidates.find((item) => {
          const canonical = normalizeForKnowledgeMatch(item.questionCanonical);
          return (
            canonical === normalizedNeedle ||
            canonical === sampleNeedle ||
            canonical === canonicalNeedle
          );
        }) ||
        candidates.find(
          (item) =>
            item.questionCanonical.trim().toLowerCase() ===
              normalizedText.trim().toLowerCase() ||
            item.questionCanonical.trim().toLowerCase() ===
              (canonicalHint || '').trim().toLowerCase(),
        ) ||
        null
      );
    },
    [],
  );

  const handleResolve = useCallback(
    async (item: ChatbotUnresolvedQuestion) => {
      setResolvingId(item.id);
      setError(null);

      try {
        const existing = await findKnowledgeForQuestion(
          item.normalizedText,
          item.sampleText,
          canonicalByUnresolvedId[item.id],
        );

        if (existing && existing.answer.trim()) {
          const activation = await updateChatbotKnowledge({
            id: existing.id,
            isActive: true,
          });
          if (!activation.success) {
            setError(activation.message || 'No se pudo activar la respuesta.');
            return;
          }
        }

        const response = await resolveChatbotUnresolved(item.id);
        if (response.success) {
          showNotification('Pregunta marcada como resuelta.', 'success');
          await loadUnresolved({ search: searchTerm, page: unresolvedPage });
        } else {
          const message = response.message || 'No fue posible marcar la pregunta';
          setError(message);
          showNotification(message, 'error');
        }
      } catch (err) {
        console.error(err);
        setError('No se pudo resolver la pregunta');
        showNotification('No se pudo resolver la pregunta', 'error');
      } finally {
        setResolvingId(null);
      }
    },
    [
      canonicalByUnresolvedId,
      findKnowledgeForQuestion,
      loadUnresolved,
      unresolvedPage,
      searchTerm,
      showNotification,
    ],
  );

  const handleToggleEditor = useCallback(
    async (item: ChatbotUnresolvedQuestion) => {
      if (editingId === item.id) {
        setEditingId(null);
        return;
      }

      setEditingId(item.id);
      setError(null);

      setLoadingDraftId(item.id);
      try {
        const existing = await findKnowledgeForQuestion(
          item.normalizedText,
          item.sampleText,
          canonicalByUnresolvedId[item.id],
        );
        setQuestionDraftById((prev) => ({
          ...prev,
          [item.id]: existing?.questionCanonical || item.normalizedText,
        }));
        setAnswerDraftById((prev) => ({
          ...prev,
          [item.id]: existing?.answer || '',
        }));
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la respuesta guardada para editar.');
      } finally {
        setLoadingDraftId(null);
      }
    },
    [canonicalByUnresolvedId, editingId, findKnowledgeForQuestion],
  );

  const handleToggleQuestionEditor = useCallback(
    async (item: ChatbotUnresolvedQuestion) => {
      if (questionEditingId === item.id) {
        setQuestionEditingId(null);
        return;
      }

      setQuestionEditingId(item.id);
      setError(null);

      if (questionDraftById[item.id] !== undefined) {
        return;
      }

      setLoadingDraftId(item.id);
      try {
        const existing = await findKnowledgeForQuestion(
          item.normalizedText,
          item.sampleText,
          canonicalByUnresolvedId[item.id],
        );
        setQuestionDraftById((prev) => ({
          ...prev,
          [item.id]: existing?.questionCanonical || item.normalizedText,
        }));
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la consulta para editar.');
      } finally {
        setLoadingDraftId(null);
      }
    },
    [
      canonicalByUnresolvedId,
      findKnowledgeForQuestion,
      questionDraftById,
      questionEditingId,
    ],
  );

  const handleSaveQuestion = useCallback(
    async (item: ChatbotUnresolvedQuestion) => {
      const questionCanonical = (
        questionDraftById[item.id] ||
        canonicalByUnresolvedId[item.id] ||
        item.normalizedText
      ).trim();

      if (!questionCanonical) {
        setError('La consulta no puede estar vacía.');
        return;
      }

      setSavingQuestionId(item.id);
      setError(null);
      try {
        const existing = await findKnowledgeForQuestion(
          item.normalizedText,
          item.sampleText,
          canonicalByUnresolvedId[item.id] || questionDraftById[item.id],
        );

        if (!existing) {
          const created = await createChatbotKnowledge({
            questionCanonical,
            answer: '',
            isActive: false,
          });

          if (!created.success) {
            const message = created.message || 'No se pudo guardar la consulta.';
            setError(message);
            showNotification(message, 'error');
            return;
          }

          setHasKnowledgeById((prev) => ({ ...prev, [item.id]: true }));
          setCanonicalByUnresolvedId((prev) => ({
            ...prev,
            [item.id]: questionCanonical,
          }));
          setQuestionEditingId(null);
          showNotification('Consulta guardada correctamente.', 'success');
          return;
        }

        const response = await updateChatbotKnowledge({
          id: existing.id,
          questionCanonical,
        });

        if (!response.success) {
          const message = response.message || 'No se pudo guardar la consulta.';
          setError(message);
          showNotification(message, 'error');
          return;
        }

        setCanonicalByUnresolvedId((prev) => ({
          ...prev,
          [item.id]: questionCanonical,
        }));
        setQuestionEditingId(null);
        showNotification('Consulta actualizada correctamente.', 'success');
      } catch (err) {
        console.error(err);
        setError('No se pudo guardar la consulta.');
        showNotification('No se pudo guardar la consulta.', 'error');
      } finally {
        setSavingQuestionId(null);
      }
    },
    [
      canonicalByUnresolvedId,
      findKnowledgeForQuestion,
      questionDraftById,
      showNotification,
    ],
  );

  const confirmDeleteQuestion = useCallback(
    async (item: ChatbotUnresolvedQuestion) => {
      setDeletingQuestionId(item.id);
      setError(null);

      try {
        const response = await deleteChatbotUnresolved(item.id);
        if (!response.success) {
          const message = response.message || 'No se pudo borrar la consulta.';
          setError(message);
          showNotification(message, 'error');
          return;
        }

        setDeleteCandidate(null);
        setEditingId(null);
        setQuestionEditingId(null);
        showNotification('Consulta borrada correctamente.', 'success');
        await Promise.all([
          loadUnresolved({ search: searchTerm, page: unresolvedPage }),
          loadMetrics(),
        ]);
      } catch (err) {
        console.error(err);
        setError('No se pudo borrar la consulta.');
        showNotification('No se pudo borrar la consulta.', 'error');
      } finally {
        setDeletingQuestionId(null);
      }
    },
    [
      loadMetrics,
      loadUnresolved,
      unresolvedPage,
      searchTerm,
      showNotification,
    ],
  );

  const handleSaveAnswer = useCallback(
    async (item: ChatbotUnresolvedQuestion) => {
      setCreatingId(item.id);
      setError(null);

      try {
        const answer = (answerDraftById[item.id] || '').trim();
        const questionCanonical = (
          canonicalByUnresolvedId[item.id] || item.normalizedText
        ).trim();
        if (!questionCanonical) {
          setError('La pregunta no puede estar vacía.');
          return;
        }

        const existing = await findKnowledgeForQuestion(
          item.normalizedText,
          item.sampleText,
          questionCanonical,
        );

        if (!answer) {
          if (!existing) {
            setError('Escribe una respuesta antes de guardar.');
            return;
          }

          const disabled = await updateChatbotKnowledge({
            id: existing.id,
            questionCanonical,
            answer: '',
            isActive: false,
          });

          if (!disabled.success) {
            const message = disabled.message || 'No se pudo borrar la respuesta.';
            setError(message);
            showNotification(message, 'error');
            return;
          }

          setHasKnowledgeById((prev) => ({ ...prev, [item.id]: false }));
          setEditingId(null);
          showNotification('Respuesta borrada correctamente.', 'success');
          await Promise.all([
            loadUnresolved({ search: searchTerm, page: unresolvedPage }),
            loadMetrics(),
          ]);
          return;
        }

        if (existing) {
          const updated = await updateChatbotKnowledge({
            id: existing.id,
            questionCanonical,
            answer,
            isActive: false,
          });
          if (!updated.success) {
            const message = updated.message || 'No se pudo actualizar la respuesta.';
            setError(message);
            showNotification(message, 'error');
            return;
          }
        } else {
          const created = await createChatbotKnowledge({
            questionCanonical,
            answer,
            isActive: false,
          });
          if (!created.success) {
            const message =
              created.message || 'No se pudo crear la respuesta para la pregunta.';
            setError(message);
            showNotification(message, 'error');
            return;
          }
        }

        setEditingId(null);
        setHasKnowledgeById((prev) => ({ ...prev, [item.id]: true }));
        setCanonicalByUnresolvedId((prev) => ({
          ...prev,
          [item.id]: questionCanonical,
        }));
        showNotification('Respuesta guardada correctamente.', 'success');
        await Promise.all([
          loadUnresolved({ search: searchTerm, page: unresolvedPage }),
          loadMetrics(),
        ]);
      } catch (err) {
        console.error(err);
        setError('No se pudo guardar la respuesta.');
        showNotification('No se pudo guardar la respuesta.', 'error');
      } finally {
        setCreatingId(null);
      }
    },
    [
      answerDraftById,
      canonicalByUnresolvedId,
      findKnowledgeForQuestion,
      loadMetrics,
      loadUnresolved,
      unresolvedPage,
      searchTerm,
      showNotification,
    ],
  );

  const handleReopen = useCallback(
    async (id: number) => {
      setReopeningId(id);
      setError(null);
      try {
        const response = await reopenChatbotUnresolved(id);
        if (!response.success) {
          const message = response.message || 'No se pudo reabrir la pregunta.';
          setError(message);
          showNotification(message, 'error');
          return;
        }
        showNotification('Pregunta reabierta correctamente.', 'success');
        await Promise.all([
          loadUnresolved({ search: searchTerm, page: unresolvedPage }),
          loadMetrics(),
        ]);
      } catch (err) {
        console.error(err);
        setError('No se pudo reabrir la pregunta.');
        showNotification('No se pudo reabrir la pregunta.', 'error');
      } finally {
        setReopeningId(null);
      }
    },
    [loadMetrics, loadUnresolved, unresolvedPage, searchTerm, showNotification],
  );

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  useEffect(() => {
    if (!notification) return undefined;
    const timer = setTimeout(() => setNotification(null), 2200);
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    void loadUnresolved({ search: searchTerm, page: unresolvedPage });
  }, [loadUnresolved, searchTerm, unresolvedPage]);

  const metricCards = useMemo(() => {
    const base = metrics ?? {
      totalMessages: 0,
      directAnswerRate: 0,
      clarificationRate: 0,
      fallbackRate: 0,
      avgResponseTimeMs: 0,
      topIntents: [],
      topUnresolved: [],
      feedbackHelpfulnessRate: 0,
    };

    return [
      {
        label: 'Mensajes totales',
        value: Number(base.totalMessages ?? 0).toLocaleString(),
        detail: 'Incluye usuario y asistente',
      },
      {
        label: 'Respuesta directa',
        value: formatPercent(base.directAnswerRate),
        detail: 'Porcentaje sobre respuestas del bot',
      },
      {
        label: 'Clarificaciones',
        value: formatPercent(base.clarificationRate),
        detail: 'Intervenciones de clarificación',
      },
      {
        label: 'Respuestas de respaldo',
        value: formatPercent(base.fallbackRate),
        detail: 'Respuestas por fallback',
      },
      {
        label: 'Respuesta útil',
        value: formatPercent(base.feedbackHelpfulnessRate),
        detail: 'Feedback positivo recibido',
      },
      {
        label: 'Tiempo promedio',
        value: formatDuration(base.avgResponseTimeMs),
        detail: 'Duración promedio por sesión',
      },
    ];
  }, [metrics]);

  const unresolvedPlaceholder = (
    <div className="admin-chatbot-page__empty">
      {unresolvedLoading ? 'Cargando preguntas pendientes...' : 'No hay preguntas pendientes en este momento.'}
    </div>
  );
  const unresolvedTotalPages = Math.max(
    1,
    Math.ceil(totalUnresolved / UNRESOLVED_ROWS_PER_PAGE),
  );
  const unresolvedStart = totalUnresolved === 0 ? 0 : unresolvedPage * UNRESOLVED_ROWS_PER_PAGE + 1;
  const unresolvedEnd = Math.min(
    totalUnresolved,
    (unresolvedPage + 1) * UNRESOLVED_ROWS_PER_PAGE,
  );

  return (
    <section className="admin-chatbot-page">
      {notification && (
        <div
          className={`admin-chatbot-page__notification admin-chatbot-page__notification--${notification.type}`}
          role="status"
        >
          <span className="admin-chatbot-page__notification-icon">
            {notification.type === 'success' ? '✓' : '⚠'}
          </span>
          <span className="admin-chatbot-page__notification-message">
            {notification.message}
          </span>
        </div>
      )}

      {error && (
        <div className="admin-chatbot-page__alert">
          <span>{error}</span>
        </div>
      )}

      <section className="admin-chatbot-page__metrics">
        <div className="admin-chatbot-page__metrics-grid">
          {metricCards.map((card) => (
            <article key={card.label} className="admin-chatbot-page__metric-card">
              <p className="admin-chatbot-page__metric-label">{card.label}</p>
              <p className="admin-chatbot-page__metric-value">{card.value}</p>
              <p className="admin-chatbot-page__metric-detail">{card.detail}</p>
            </article>
          ))}
        </div>

        <div className="admin-chatbot-page__metrics-details">
          <div>
            <h2 className="h5 mb-2">Top intentos</h2>
            <ul className="admin-chatbot-page__list">
              {metrics?.topIntents.length ? (
                metrics.topIntents.map((item) => (
                  <li key={item.code}>
                    <strong>{item.code}</strong> · {item.count} menciones
                  </li>
                ))
              ) : (
                <li>No hay intents detectados recientemente.</li>
              )}
            </ul>
          </div>
          <div>
            <h2 className="h5 mb-2">Top preguntas sin resolver</h2>
            <ul className="admin-chatbot-page__list">
              {metrics?.topUnresolved.length ? (
                metrics.topUnresolved.map((item) => (
                  <li key={item.normalizedText}>
                    <span>{item.normalizedText}</span>
                    <span className="admin-chatbot-page__badge">
                      {item.occurrences} incidencias
                    </span>
                  </li>
                ))
              ) : (
                <li>No hay preguntas recurrentes este período.</li>
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="admin-chatbot-page__unresolved">
        <div className="admin-chatbot-page__section-header">
          <div>
            <h2 className="h5 mb-1">Preguntas sin resolver</h2>
            <p className="text-muted mb-0">
              {totalUnresolved} {(totalUnresolved === 1 ? 'pregunta' : 'preguntas')} detectadas
            </p>
          </div>
          <div className="admin-chatbot-page__filters">
            <input
              type="search"
              className="form-control form-control-sm"
              placeholder="Buscar por texto"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => {
                if (unresolvedPage === 0) {
                  void loadUnresolved({ search: searchTerm, page: 0 });
                  return;
                }
                setUnresolvedPage(0);
              }}
            >
              Buscar
            </button>
          </div>
        </div>

        <div className="admin-chatbot-page__table">
          <div className="admin-chatbot-page__table-row admin-chatbot-page__table-row--head">
            <span>Consultas</span>
            <span>Ocurrencias</span>
            <span>Última vez vista</span>
            <span>Acciones</span>
          </div>

          {unresolvedLoading ? (
            <div className="admin-chatbot-page__loading">Cargando...</div>
          ) : unresolved.length === 0 ? (
            unresolvedPlaceholder
          ) : (
            unresolved.map((item) => (
              <div key={item.id} className="admin-chatbot-page__table-row">
                <span>
                  <div className="admin-chatbot-page__query-header">
                    {questionEditingId === item.id ? (
                      <div className="admin-chatbot-page__query-inline-editor">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={questionDraftById[item.id] || item.normalizedText}
                          onChange={(event) =>
                            setQuestionDraftById((prev) => ({
                              ...prev,
                              [item.id]: event.target.value,
                            }))
                          }
                          disabled={savingQuestionId === item.id}
                        />
                        <div className="admin-chatbot-page__query-inline-actions">
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => {
                              void handleSaveQuestion(item);
                            }}
                            disabled={savingQuestionId === item.id}
                          >
                            {savingQuestionId === item.id ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setQuestionEditingId(null)}
                            disabled={savingQuestionId === item.id}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <strong>
                        {canonicalByUnresolvedId[item.id] || item.normalizedText}
                      </strong>
                    )}
                    {!item.resolvedAt && (
                      <button
                        type="button"
                        className="admin-chatbot-page__query-edit"
                        onClick={() => {
                          void handleToggleQuestionEditor(item);
                        }}
                        disabled={
                          resolvingId === item.id ||
                          creatingId === item.id ||
                          reopeningId === item.id ||
                          loadingDraftId === item.id ||
                          deletingQuestionId === item.id
                        }
                        aria-label="Editar consulta"
                        title="Editar consulta"
                      >
                        {loadingDraftId === item.id ? '...' : '\u270E'}
                      </button>
                    )}
                    {!item.resolvedAt && (
                      <button
                        type="button"
                        className="admin-chatbot-page__query-edit"
                        onClick={() => {
                          setDeleteCandidate(item);
                        }}
                        disabled={
                          deletingQuestionId === item.id ||
                          savingQuestionId === item.id ||
                          creatingId === item.id
                        }
                        aria-label="Borrar consulta"
                        title="Borrar consulta"
                      >
                        {deletingQuestionId === item.id ? '...' : '\u2716'}
                      </button>
                    )}
                  </div>
                  <br />
                  <small className="text-muted">{item.sampleText}</small>
                </span>
                <span>{item.occurrences}</span>
                <span>{formatDateTime(item.lastSeenAt)}</span>
                <span>
                  <div className="admin-chatbot-page__actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary admin-chatbot-page__icon-action"
                      onClick={() => {
                        void handleResolve(item);
                      }}
                      disabled={
                        Boolean(item.resolvedAt) ||
                        resolvingId === item.id ||
                        creatingId === item.id
                      }
                      aria-label={item.resolvedAt ? 'Resuelta' : 'Marcar como resuelta'}
                      title={item.resolvedAt ? 'Resuelta' : 'Marcar como resuelta'}
                    >
                      ✔
                    </button>
                    {item.resolvedAt ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary admin-chatbot-page__icon-action"
                        onClick={() => handleReopen(item.id)}
                        disabled={
                          reopeningId === item.id ||
                          creatingId === item.id ||
                          loadingDraftId === item.id
                        }
                        aria-label="Reabrir"
                        title="Reabrir"
                      >
                        {reopeningId === item.id ? '...' : '↺'}
                      </button>
                    ) : null}
                    {!item.resolvedAt && (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary admin-chatbot-page__icon-action"
                        onClick={() => {
                          void handleToggleEditor(item);
                        }}
                        disabled={
                          resolvingId === item.id ||
                          creatingId === item.id ||
                          reopeningId === item.id ||
                          loadingDraftId === item.id
                        }
                        aria-label={
                          hasKnowledgeById[item.id]
                            ? 'Editar respuesta'
                            : 'Resolver con respuesta'
                        }
                        title={
                          hasKnowledgeById[item.id]
                            ? 'Editar respuesta'
                            : 'Resolver con respuesta'
                        }
                      >
                        {loadingDraftId === item.id ? '...' : '🛠️'}
                      </button>
                    )}
                    {!item.resolvedAt && editingId === item.id && (
                      <div className="admin-chatbot-page__composer">
                        <textarea
                          className="form-control form-control-sm"
                          rows={3}
                          placeholder="Escribe la respuesta que debe dar el chatbot..."
                          value={answerDraftById[item.id] || ''}
                          onChange={(event) =>
                            setAnswerDraftById((prev) => ({
                              ...prev,
                              [item.id]: event.target.value,
                            }))
                          }
                          disabled={creatingId === item.id}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={() => {
                            void handleSaveAnswer(item);
                          }}
                          disabled={creatingId === item.id}
                        >
                          {creatingId === item.id
                            ? 'Guardando...'
                            : item.resolvedAt || hasKnowledgeById[item.id]
                              ? 'Guardar cambios'
                              : 'Guardar respuesta'}
                        </button>
                      </div>
                    )}
                  </div>
                </span>
              </div>
            ))
          )}
        </div>
        <div className="chatbot-pagination">
          <div className="chatbot-pagination__info">
            Mostrando {unresolvedStart}-{unresolvedEnd} de {totalUnresolved}
          </div>
          <div className="chatbot-pagination__controls">
            <button
              type="button"
              onClick={() => {
                const nextPage = Math.max(0, unresolvedPage - 1);
                setUnresolvedPage(nextPage);
              }}
              disabled={unresolvedPage === 0 || unresolvedLoading}
              aria-label="Página anterior"
            >
              {'\u2190'}
            </button>
            <span>
              {unresolvedPage + 1} de {unresolvedTotalPages}
            </span>
            <button
              type="button"
              onClick={() => {
                const nextPage = Math.min(unresolvedTotalPages - 1, unresolvedPage + 1);
                setUnresolvedPage(nextPage);
              }}
              disabled={
                unresolvedPage >= unresolvedTotalPages - 1 || unresolvedLoading
              }
              aria-label="Página siguiente"
            >
              {'\u2192'}
            </button>
          </div>
        </div>
      </section>

      <ConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Eliminar consulta"
        description={
          deleteCandidate ? (
            <>
              ¿Quieres eliminar la consulta{' '}
              <strong>
                {canonicalByUnresolvedId[deleteCandidate.id] ||
                  deleteCandidate.normalizedText}
              </strong>
              ? Esta acción eliminará el registro de preguntas pendientes.
            </>
          ) : undefined
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        isProcessing={
          Boolean(deleteCandidate) &&
          deletingQuestionId === (deleteCandidate?.id ?? null)
        }
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          if (!deleteCandidate) return;
          void confirmDeleteQuestion(deleteCandidate);
        }}
      />
    </section>
  );
};
