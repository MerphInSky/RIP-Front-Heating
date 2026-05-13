import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Form, Spinner } from "react-bootstrap";
import {
  editComponentInHeating,
  fallbackImageUrl,
  listComponents,
  objectUrlFromKey,
  type Component,
  type HeatingComponentJSON,
} from "../../modules/componentsApi";
import { COMPONENTS_MOCK, MOCK_HEATING_DETAIL } from "../../modules/mock";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  deleteHeating as deleteHeatingThunk,
  editHeating,
  fetchHeatingDetail,
  formHeating,
  removeComponentLineFromHeating,
  updateComponentLineInHeating,
  type HeatingDetailPayload,
} from "../../store/slices/heatingSlice";
import type {
  WebBackendInternalAppSerializerHeatingComponentJSON,
  WebBackendInternalAppSerializerHeatingJSON,
} from "../../api/Api";
import "./HeatingPage.css";

function resolvePhoto(photoKey: string): string {
  if (!photoKey) return fallbackImageUrl();
  if (
    photoKey.startsWith("http://") ||
    photoKey.startsWith("https://") ||
    photoKey.startsWith("/") ||
    photoKey.startsWith("blob:")
  ) {
    return photoKey;
  }
  return objectUrlFromKey(photoKey);
}

function toItemJson(row: HeatingDetailPayload["components"][0]): HeatingComponentJSON {
  return {
    heating_id: row.heating_id ?? 0,
    component_id: row.component_id ?? 0,
    power_dissipation: row.power_dissipation ?? 0,
    heat: row.heat ?? 0,
  };
}

export default function HeatingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.user);
  const { detail, detailLoading, heatingMutationLoading, itemMutationLoading } = useAppSelector(
    (s) => s.heating,
  );

  const [components, setComponents] = useState<Component[]>([]);
  const [mockData, setMockData] = useState<HeatingDetailPayload | null>(null);
  
  // Черновик температуры окружающей среды
  const [ambientTemp, setAmbientTemp] = useState("");
  // Черновики рассеивающей мощности: Map<component_id, значение>
  const [powerDrafts, setPowerDrafts] = useState<Map<number, number>>(new Map());

  const reloadMock = useCallback(async () => {
    if (!id) return;
    if (Number(id) !== MOCK_HEATING_DETAIL.heating.heating_id) {
      setMockData(null);
      return;
    }
    setMockData({
      heating: {
        ...MOCK_HEATING_DETAIL.heating,
      } as WebBackendInternalAppSerializerHeatingJSON,
      components: MOCK_HEATING_DETAIL.components.map(
        (x) => ({ ...x }) as WebBackendInternalAppSerializerHeatingComponentJSON,
      ),
    });
  }, [id]);

  useEffect(() => {
    listComponents()
      .then((list) => {
        if (list.length > 0) setComponents(list);
        else setComponents(COMPONENTS_MOCK);
      })
      .catch(() => setComponents(COMPONENTS_MOCK));
  }, []);

  useEffect(() => {
    if (!id || !isAuthenticated) return;
    setMockData(null);
    void dispatch(fetchHeatingDetail(Number(id))).then((a) => {
      if (fetchHeatingDetail.rejected.match(a)) {
        void reloadMock();
      }
    });
  }, [id, isAuthenticated, dispatch, reloadMock]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const data = detail ?? mockData;

  // Синхронизация черновика температуры при загрузке данных
  useEffect(() => {
    if (!data?.heating) return;
    setAmbientTemp(data.heating.ambient_temperature?.toString() ?? "");
  }, [data?.heating?.heating_id, data?.heating?.ambient_temperature]);

  // Синхронизация черновиков мощности при загрузке данных
  useEffect(() => {
    if (!data?.components) return;
    const newMap = new Map<number, number>();
    data.components.forEach((item) => {
      if (item.component_id != null && item.power_dissipation != null) {
        newMap.set(item.component_id, item.power_dissipation);
      }
    });
    setPowerDrafts(newMap);
  }, [data?.components]);

  const compById = useMemo(() => {
    const m = new Map<number, Component>();
    components.forEach((d) => m.set(d.component_id, d));
    return m;
  }, [components]);

  const sortedItems = useMemo(() => {
    if (!data?.components) return [];
    return [...data.components].sort((a, b) => (a.component_id ?? 0) - (b.component_id ?? 0));
  }, [data?.components]);

  const app = data?.heating;
  const isDraft = app?.status === "draft";
  const heatingId = app?.heating_id;

  // Локальное обновление черновика мощности (без запросов к API)
  const handlePowerDissipationChange = (componentId: number, value: number) => {
    if (!isDraft) return;
    setPowerDrafts((prev) => {
      const next = new Map(prev);
      next.set(componentId, value);
      return next;
    });
  };

  // Подтверждение заявки: отправка температуры и всех изменённых мощностей
  const handleForm = async () => {
    if (!heatingId || !isDraft || !app) return;

    const trimmed = ambientTemp.trim();
    const ambientTempValue = trimmed === "" ? undefined : Number.parseFloat(trimmed);

    // Собираем только те компоненты, у которых мощность действительно изменилась
    const powerUpdates: Array<{
      componentId: number;
      heatingId: number;
      body: { power_dissipation: number; heat: number };
    }> = [];

    data?.components.forEach((item) => {
      const cid = item.component_id ?? 0;
      const draftVal = powerDrafts.get(cid);
      if (draftVal !== undefined && draftVal !== item.power_dissipation) {
        powerUpdates.push({
          componentId: cid,
          heatingId,
          body: {
            power_dissipation: draftVal,
            heat: item.heat ?? 0,
          },
        });
      }
    });

    // Режим мока
    if (mockData && !detail) {
      setMockData((prev) => {
        if (!prev) return prev;
        let newComponents = prev.components;
        if (powerUpdates.length > 0) {
          newComponents = prev.components.map((comp) => {
            const upd = powerUpdates.find((u) => u.componentId === comp.component_id);
            return upd ? { ...comp, power_dissipation: upd.body.power_dissipation } : comp;
          });
        }
        return {
          ...prev,
          components: newComponents,
          heating: {
            ...prev.heating,
            ambient_temperature: ambientTempValue ?? prev.heating.ambient_temperature,
            status: "formed",
          },
        };
      });
      return;
    }

    // Реальный режим
    try {
      await dispatch(
        editHeating({
          heatingId,
          body: { heating_id: heatingId, ambient_temperature: ambientTempValue },
        }),
      ).unwrap();

      for (const upd of powerUpdates) {
        await dispatch(updateComponentLineInHeating(upd)).unwrap();
      }

      await dispatch(formHeating(heatingId)).unwrap();
    } catch {
      void 0;
    }
  };

  const handleRemoveLine = async (componentId: number) => {
    if (!heatingId || !isDraft) return;
    if (!window.confirm("Убрать подразделение из заявки?")) return;
    if (mockData && !detail) {
      setMockData((prev) =>
        prev ? { ...prev, items: prev.components.filter((i) => i.component_id !== componentId) } : null,
      );
      return;
    }
    try {
      await dispatch(
        removeComponentLineFromHeating({ componentId, heatingId }),
      ).unwrap();
    } catch {
      void 0;
    }
  };

  const handleDeleteHeating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heatingId || !isDraft) return;
    if (!window.confirm("Удалить заявку?")) return;
    if (mockData && !detail) {
      navigate("/");
      return;
    }
    try {
      await dispatch(deleteHeatingThunk(heatingId)).unwrap();
      navigate("/");
    } catch {
      void 0;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (detailLoading && !data) {
    return (
      <div className="heating-page">
        <div className="device-page-loader">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  if (!data || !app || heatingId == null) {
    return (
      <div className="heating-page">
        <p className="heating-not-found">Заявка не найдена.</p>
      </div>
    );
  }

  return (
    <div className="heating-page">
      <div className="heating-detail">
        <div className="heating-detail__header-card">
          <h1 className="heating-detail__title">Заявка на расчёт нагрева</h1>
            {isDraft ? (
              <div className="heating-page__title-field" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="heating-ambient-temp">Температура охлаждения:</label>
                <input
                  id="heating-ambient-temp"
                  type="number"
                  className="power-input"
                  value={ambientTemp}
                  onChange={(e) => setAmbientTemp(e.target.value)}
                  placeholder="°С"
                  step="0.1"
                  disabled={heatingMutationLoading}
                />
              </div>
            ) : null}
          <div className="heating-detail__info">
            <div className="heating-detail__info-item">
              <strong>ID:</strong> {heatingId}
            </div>
            <div className="heating-detail__info-item">
              <strong>Статус:</strong> {app.status}
            </div>
            <div className="heating-detail__info-item">
              <strong>Компонентов:</strong> {sortedItems.length}
            </div>
          </div>
        </div>

        {isDraft ? (
          <div className="heating-page__actions">
            <Button
              type="button"
              className="heating-page__btn-form"
              onClick={() => void handleForm()}
              disabled={heatingMutationLoading}
            >
              Подтвердить заявку
            </Button>
          </div>
        ) : null}

        <div className="app-table-wrapper heating-page__table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th className="app-table__col-order" aria-hidden="true" />
                <th className="app-table__col-photo">Фото</th>
                <th className="app-table__col-name">Наименование компонента</th>
                <th className="app-table__col-power">Рассеивающая мощность</th>
                <th className="app-table__col-heat">Нагрев</th>
                <th className="app-table__col-remove" scope="col">
                  {isDraft ? "Из заявки" : ""}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => {
                const comp = compById.get(item.component_id ?? 0);
                const photoUrl = comp ? resolvePhoto(comp.photo_url) : fallbackImageUrl();
                const did = item.component_id ?? 0;
                const currentPower = powerDrafts.get(item.component_id ?? -1) ?? item.power_dissipation;

                return (
                  <tr key={item.component_id}>
                    <td className="app-table__col-photo" style={{ paddingLeft: "60px" }}>
                      <img src={photoUrl} alt="" />
                    </td>
                    <td className="app-table__col-name" style={{ paddingLeft: "80px" }}>
                      {comp?.title ?? `ID ${item.component_id}`}
                    </td>
                    <td className="app-table__col-power" style={{ paddingLeft: "3px" }}>
                      <input
                        type="number"
                        className="power-input"
                        value={currentPower ?? ""}
                        onChange={(e) => {
                          const val = e.target.valueAsNumber;
                          if (!Number.isNaN(val) && item.component_id != null) {
                            handlePowerDissipationChange(item.component_id, val);
                          }
                        }}
                        step="0.1"
                        min="0"
                        placeholder="Вт"
                        disabled={!isDraft}
                      />
                    </td>
                    <td className="app-table__col-heat"   >
                      {item.heat != null && !Number.isNaN(item.heat)
                        ? `${Math.round(item.heat)} °С`
                        : "—"}
                    </td>
                    <td className="app-table__col-remove">
                      {isDraft ? (
                        <button
                          type="button"
                          className="heating-page__btn-remove-line"
                          disabled={Boolean(itemMutationLoading[`rm-${did}`])}
                          onClick={() => void handleRemoveLine(did)}
                        >
                          Удалить
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isDraft ? (
          <form className="heating-page__delete-form" onSubmit={handleDeleteHeating}>
            <button type="submit" className="search-btn heating-page__delete-btn">
              Удалить заявку
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}