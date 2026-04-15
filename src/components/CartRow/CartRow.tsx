import "./CartRow.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MOCK_CART } from "../../modules/mock";
import cartIcon from "../../assets/logo.png";

export default function CartRow() {
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
      <span className="cart-row__text">Компонентов в заявке: {cart.components_count}</span>
    </>
  );

  if (cart.has_draft && cart.components_count > 0 && cart.id != null) {
    return (
      <div className="cart-row">
        <Link to={`/heating/${cart.id}`} className="cart-row__link">
          {inner}
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-row">
      <div className="cart-row__inactive">{inner}</div>
    </div>
  );
}
