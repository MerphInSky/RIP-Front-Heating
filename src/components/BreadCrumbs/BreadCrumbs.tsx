import { useEffect, useState } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { getMockComponent } from "../../modules/mock";
import { ROUTES } from "../../Routes";
import "./Breadcrumbs.css";

type Crumb = { label: string; to?: string };

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const [componentTitle, setComponentTitle] = useState<string | null>(null);

  useEffect(() => {
    const m = matchPath(ROUTES.COMPONENT, pathname);
    const rawId = m?.params.id;
    if (rawId == null) {
      setComponentTitle(null);
      return;
    }
    const id = Number(rawId);
    const com = getMockComponent(id);
    setComponentTitle(com?.title ?? `Компонент ${id}`);
  }, [pathname]);

  const crumbs: Crumb[] = (() => {
    if (pathname === "/" || pathname === "") {
      return [{ label: "Главная" }];
    }

    const compMatch = matchPath(ROUTES.COMPONENT, pathname);
    if (compMatch?.params.id) {
      const title =
        componentTitle ?? (compMatch.params.id ? `Компонент ${compMatch.params.id}` : "Компонент");
      return [{ label: "Главная", to: "/" }, { label: title }];
    }

    const appMatch = matchPath(ROUTES.HEATING, pathname);
    if (appMatch?.params.id) {
      return [
        { label: "Главная", to: "/" },
        { label: `Нагрев №${appMatch.params.id}` },
      ];
    }

    return [{ label: "Главная", to: "/" }, { label: "Страница" }];
  })();

  return (
    <nav className="app-breadcrumbs" aria-label="Навигационная цепочка">
      <ol className="app-breadcrumbs__list">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="app-breadcrumbs__item">
              {crumb.to != null && !last ? (
                <Link to={crumb.to} className="app-breadcrumbs__link">
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={last ? "app-breadcrumbs__current" : undefined}
                  aria-current={last ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
