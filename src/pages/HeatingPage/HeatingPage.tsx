import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fallbackImageUrl,
  resolveMediaUrl,
  type Component,
  type HeatingDetailResponse,
  type HeatingComponentJSON,
} from "../../modules/componentsApi";
import { COMPONENTS_MOCK, MOCK_HEATING_DETAIL } from "../../modules/mock";
import "./HeatingPage.css";


function cloneHeatingDetail(
  src: HeatingDetailResponse,
): HeatingDetailResponse {
  return JSON.parse(JSON.stringify(src)) as HeatingDetailResponse;
}

export default function HeatingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<HeatingDetailResponse | null>(null);

  const loadMock = useCallback(() => {
    if (!id) return null;
    const n = Number(id);
    if (n === MOCK_HEATING_DETAIL.heating.heating_id) {
      return cloneHeatingDetail(MOCK_HEATING_DETAIL);
    }
    return null;
  }, [id]);

  useEffect(() => {
    setData(loadMock());
  }, [loadMock]);

  const components = COMPONENTS_MOCK;

  const compById = useMemo(() => {
    const m = new Map<number, Component>();
    components.forEach((d) => m.set(d.component_id, d));
    return m;
  }, [components]);

const sortedItems = useMemo(() => {
  if (!data?.heats) return [];
  return [...data.heats].sort((a, b) => a.component_id - b.component_id);
}, [data?.heats]);


const handlePowerDissipationChange = (heat: HeatingComponentJSON, value: string) => {
  setData((prev) => {
    if (!prev) return prev;
    
    const newHeats = prev.heats.map((row) =>
      row.component_id === heat.component_id
        ? { 
            ...row, 
            power_dissipation: value === "" ? null : Number(value) 
          }
        : row,
    );
    
    return { ...prev, items: newHeats };
  });
};

  const handleDeleteHeating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm("Удалить заявку?")) return;
    navigate("/");
  };

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
                const photoUrl = comp ? resolveMediaUrl(comp.photo_url) : fallbackImageUrl();
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
                        onChange={(e) => handlePowerDissipationChange(item, e.target.value)}
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
