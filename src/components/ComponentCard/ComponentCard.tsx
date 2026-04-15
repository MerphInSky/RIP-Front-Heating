import { Link } from "react-router-dom";
import { useState, type MouseEvent } from "react";
import {
  fallbackImageUrl,
  type Component,
} from "../../modules/componentsApi";
import { addComponentToMockHeating } from "../../modules/mock";
import "./ComponentCard.css";

const CART_UPDATED = "component-cart-updated";

export default function ComponentCard({ component }: { component: Component }) {

  const [adding, setAdding] = useState(false);


  const handleAdd = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      const result = await addComponentToMockHeating(component.component_id);
      if (result.ok) {
        window.dispatchEvent(new Event(CART_UPDATED));
      } else {
        window.alert("message" in result ? result.message : "Не удалось добавить компонент в заявку.");
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="card-wrapper">
      <Link to={`/component/${component.component_id}`} className="card">
        <div className="card-accent-bar" />
        <img
          src={component.photo_url || fallbackImageUrl()}
        />
        <div className="card__body">
          <h1>{component.title}</h1>
          <p className="card__resistance">Тепловое сопротивление: {component.thermal_resistance}</p>
          <p className="card__description">{component.description}</p>
        </div>
      </Link>
      <button
        type="button"
        className="card-add-btn"
        onClick={handleAdd}
        disabled={adding}
      >
        {adding ? "Чтобы добавить в заявку, войдите в аккаунт" : "Чтобы добавить в заявку, войдите в аккаунт"}
      </button>
    </div>
  );
}
