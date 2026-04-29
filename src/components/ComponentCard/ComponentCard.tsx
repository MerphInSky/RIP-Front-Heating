import { Link } from "react-router-dom";
import { useState, type MouseEvent } from "react";
import type { Component } from "../../modules/componentsApi.ts";
import {
  addComponentToHeating,
  fallbackImageUrl,
  resolveMediaUrl,
} from "../../modules/componentsApi.ts";
import defaultComponent from "../../assets/default_image.png";


const CART_UPDATED = "component-cart-updated";


export default function ComponentCard({ component }: { component: Component }) {
  const photoUrl = component.photo_url ? resolveMediaUrl(component.photo_url) : defaultComponent;
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      const result = await addComponentToHeating(component.component_id);
      if (result.ok) {
        window.dispatchEvent(new Event(CART_UPDATED));
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
          src={photoUrl || fallbackImageUrl()}
        />
        <div className="card__body">
          <h1>{component.title}</h1>
          <p className="card__resistance">Тепловое сопротивление: {component.thermal_resistance}</p>
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
