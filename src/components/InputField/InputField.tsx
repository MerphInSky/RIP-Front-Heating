import type React from "react";
import "./InputField.css";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchHeatingCart } from "../../store/slices/heatingSlice";
import logo from "/src/assets/logo.png";

interface SearchWithCartProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
}

export default function SearchWithCart({ query, onQueryChange, onSearch }: SearchWithCartProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.user);
  const { cart } = useAppSelector((s) => s.heating);

  useEffect(() => {
    void dispatch(fetchHeatingCart());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const load = () => {
      void dispatch(fetchHeatingCart());
    };
    window.addEventListener("component-cart-updated", load);
    return () => window.removeEventListener("component-cart-updated", load);
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const count = isAuthenticated ? (cart?.components_count ?? 0) : 0;
  const hasDraft = isAuthenticated && Boolean(cart?.has_draft);
  const heatingId = isAuthenticated ? cart?.id : undefined;

  const cartInner = (
    <>
      <img src={logo} alt="" className="cart-row__icon" />
      <span className="cart-icon__badge">{count}</span>
    </>
  );

  const cartButton = (
    <Link to={`/heatings/${heatingId}`} className="cart-button">
      {cartInner}
    </Link>
  );

  return (
    <div className="search-bar-wrapper">
      <form onSubmit={handleSubmit} className="search-bar">
        <input
          type="text"
          name="query"
          className="search-input"
          placeholder="Поиск по компонентам"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <button type="submit" className="search-btn">
          Найти
        </button>
        {isAuthenticated && hasDraft && count > 0 && heatingId != null ? (
          cartButton
        ) : (
          <div className="cart-button-inactive">{cartInner}</div>
        )}
      </form>
    </div>
  );
}