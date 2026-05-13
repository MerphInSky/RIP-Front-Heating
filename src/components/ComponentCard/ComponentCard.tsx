import { Link } from "react-router-dom";
import { useEffect, useState, type MouseEvent } from "react";
import type { Component } from "../../modules/componentsApi";
import { fallbackImageUrl, objectUrlFromKey } from "../../modules/componentsApi";
import "./ComponentCard.css";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addComponentToHeating as addComponentToHeatingThunk } from "../../store/slices/heatingSlice";

const CART_UPDATED = "component-cart-updated";

// 🟢 Расширяем тип для мультимодального поиска
type ComponentWithExtras = Component & {
  _similarityScore?: number;
  short_description_en?: string;
};

function resolvePhotoSrc(photo_url: string, imageError: boolean): string {
  if (imageError || !photo_url) return fallbackImageUrl();
  if (
    photo_url.startsWith("http://") ||
    photo_url.startsWith("https://") ||
    photo_url.startsWith("/") ||
    photo_url.startsWith("blob:")
  ) {
    return photo_url;
  }
  return objectUrlFromKey(photo_url);
}

export default function ComponentCard({ component }: { component: ComponentWithExtras }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.user);
  const applicationMutationLoading = useAppSelector(
    (s) => s.heating.heatingMutationLoading,
  );
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState(resolvePhotoSrc(component.photo_url, false));
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setImageError(false);
    setImageUrl(resolvePhotoSrc(component.photo_url, false));
  }, [component.photo_url]);

  const handleImageError = () => {
    setImageError(true);
    setImageUrl(fallbackImageUrl());
  };

  const handleAdd = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    setAdding(true);
    try {
      await dispatch(addComponentToHeatingThunk(component.component_id)).unwrap();
      window.dispatchEvent(new Event(CART_UPDATED));
    } catch {
      void 0;
    } finally {
      setAdding(false);
    }
  };

  const busy = adding || applicationMutationLoading;
  
  // 🟢 Флаг: активен ли мультимодальный поиск для этой карточки
  const isImageSearch = component._similarityScore != null;

  return (
    <div className="card-wrapper">
      <Link to={`/component/${component.component_id}`} className="card">
        <div className="card-accent-bar" />
        
        <img
          src={imageError ? fallbackImageUrl() : imageUrl}
          alt={component.title}
          onError={handleImageError}
          className="card__image"
        />
        
        <div className="card__body">
          <h1 className="card__title">{component.title}</h1>
          {/* 🟢 Краткое описание на английском — только при мультимодальном поиске */}
          {isImageSearch && component.short_description_en && (
            <p className="card__desc-en text-muted small">
              {component.short_description_en}
            </p>
          )}
          
          {/* 🟢 Сходство — только при мультимодальном поиске, простым текстом */}
          {isImageSearch && (
            <p className="card__similarity text-muted small">
              Сходство: {(component._similarityScore! * 100).toFixed(1)}%
            </p>
          )}
          
          <p className="card__resistance">
            Тепловое сопротивление: {component.thermal_resistance}
          </p>
        </div>
      </Link>
      
      <button 
        type="button" 
        className="card-add-btn" 
        onClick={handleAdd} 
        disabled={busy || !isAuthenticated}
      >
        {busy ? "Добавление…" : "Добавить в заявку"}
      </button>
    </div>
  );
}