import type React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./InputField.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MOCK_CART } from "../../modules/mock";
import cartIcon from "../../assets/logo.png";

interface SearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
}

export default function Search({ query, onQueryChange, onSearch }: SearchProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const [cart, setCart] = useState(MOCK_CART);

  useEffect(() => {
    const load = () => setCart({ ...MOCK_CART });
    load();
    window.addEventListener("component-cart-updated", load);
    return () => window.removeEventListener("component-cart-updated", load);
  }, []);

  const inner = (
    <>
      <img src={cartIcon} alt="" className="cart-row__icon" />
      <span className="cart-icon__badge"> {0}</span>
    </>
  );
    return (
<div className="search-bar">
  <Form onSubmit={handleSubmit} className="search-bar__form">
    <Form.Control
      type="text"
      name="query"
      className="search-input"
      placeholder="Поиск по компонентам"
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
    />
    <Button type="submit" className="search-btn">
      Найти
    </Button>
  </Form>

      <div className="cart-row__inactive">{inner}</div>
</div>
  );
  }