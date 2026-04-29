import "./CartRow.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getHeatingCart, objectUrlFromKey } from "../../modules/componentsApi";
import logo from "/src/assets/logo.png";

export default function CartRow() {
  const [count, setCount] = useState(0);
  const [hasDraft, setHasDraft] = useState(false);
  const [applicationId, setApplicationId] = useState<number | undefined>();

  useEffect(() => {
    const load = () => {
      void getHeatingCart().then((data) => {
        setCount(data.components_count);
        setHasDraft(data.has_draft);
        setApplicationId(data.id);
      });
    };
    load();
    window.addEventListener("component-cart-updated", load);
    return () => window.removeEventListener("component-cart-updated", load);
  }, []);

  const inner = (
    <>
      <img src={logo} alt="" className="cart-row__icon" />
      <span className="cart-icon__badge"> {0}</span>
    </>
  );

  if (hasDraft && count > 0 && applicationId != null) {
    return (
      <div className="cart-row">
        <Link to={`/heating/${applicationId}`} className="cart-row__link">
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
