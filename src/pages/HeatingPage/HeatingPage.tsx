import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteHeating,
  editComponentInHeating,
  fallbackImageUrl,
  getHeating,
  listComponents,
  objectUrlFromKey,
  type Component,
  type HeatingDetailResponse,
  type HeatingComponentJSON,
} from "../../modules/componentsApi.ts";
import { COMPONENTS_MOCK, MOCK_HEATING_DETAIL } from "../../modules/mock";
import { Spinner } from "react-bootstrap";
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

export default function HeatingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<HeatingDetailResponse | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadHeating = useCallback(async () => {
    if (!id) return;
    const res = await getHeating(Number(id));
    if (res) setData(res);
    else if (Number(id) === MOCK_HEATING_DETAIL.heating.heating_id) {
      setData(MOCK_HEATING_DETAIL);
    } else {
      setData(null);
    }
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
    if (!id) return;
    const load = async () => {
      setLoading(true);
      await reloadHeating();
      setLoading(false);
    };
    void load();
  }, [id, reloadHeating]);

  const compById = useMemo(() => {
    const m = new Map<number, Component>();
    components.forEach((d) => m.set(d.component_id, d));
    return m;
  }, [components]);

const sortedItems = useMemo(() => {
  if (!data?.heats) return [];
  return [...data.heats].sort((a, b) => a.component_id - b.component_id);
}, [data?.heats]);


  const handlePowerDissipationChange = async (item: HeatingComponentJSON) => {
    if (!data) return;
    const ok = await editComponentInHeating(
      item.component_id,
      data.heating.heating_id,
      {
        power_dissipation: item.power_dissipation,
        heat: item.heat ?? undefined,
      },
    );
    if (ok) await reloadHeating();
  };

  const handleDeleteHeating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    if (!window.confirm("Удалить заявку?")) return;
    const ok = await deleteHeating(data.heating.heating_id);
    if (ok) navigate("/");
  };

  if (loading) {
    return (
      <div className="heating-page">
        <div className="device-page-loader">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="heating-page">
        <p className="heating-not-found">Заявка не найдена.</p>
      </div>
    );
  }

  const app = data.heating;

  return (
    <div className="heating-page">
      <div className="heating-detail">
        <div className="heating-detail__header-card">
          <h1 className="heating-detail__title">Заявка на расчёт нагрева</h1>
          <div className="heating-detail__info">
            <div className="heating-detail__info-item">
              <strong>ID заявки:</strong> {app.heating_id}
            </div>
            <div className="heating-detail__info-item">
              <strong>Количество компонентов:</strong> {data.heats.length}
            </div>
            <div className="heating-detail__info-item">
              <strong>Температура охлаждения:</strong> {app.ambient_temperature}<strong>°С</strong>
            </div>
          </div>
        </div>

        <div className="app-table-wrapper heating-page__table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th className="app-table__col-order" aria-hidden="true" />
                <th className="app-table__col-photo">Фото</th>
                <th className="app-table__col-name">Наименование компонента</th>
                <th className="app-table__col-resistance">Тепловое сопротивление</th>
                <th className="app-table__col-power">Рассеивающая мощность</th>
                <th className="app-table__col-heat">Нагрев</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => {
                const comp = compById.get(item.component_id);
                const photoUrl = comp ? resolvePhoto(comp.photo_url) : fallbackImageUrl();
                const heatStr = item.heat != null ? `${Math.round(item.heat)}°С` : "—";
                return (
                  <tr key={item.component_id} >
                    <td className="app-table__col-photo">
                      <img src={photoUrl} alt="" />
                    </td>
                    <td className="app-table__col-name">{comp?.title ?? `ID ${item.component_id}`}</td>
                    <td className="app-table__col-resistance">{comp?.thermal_resistance ?? "—"}</td>
                    <td className="app-table__col-power">
                      <input
                        type="number"
                        className="power-input"
                        value={item.power_dissipation ?? ""}
                        onChange={(e) => handlePowerDissipationChange(item)}
                        step="0.01"
                        min="0"
                        placeholder="Вт"
                      />
                    </td>
                    <td className="app-table__col-heat">{heatStr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <form className="heating-page__delete-form" onSubmit={handleDeleteHeating}>
          <button type="submit" className="search-btn heating-page__delete-btn">
            Удалить заявку
          </button>
        </form>
      </div>
    </div>
  );
}
