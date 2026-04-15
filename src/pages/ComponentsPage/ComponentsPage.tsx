import { useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import Search from "../../components/InputField/InputField";
import ComponentsList from "../../components/ComponentsList/ComponentsList";
import type { Component } from "../../modules/componentsApi";
import { COMPONENTS_MOCK, filterMockComponentsByTitle } from "../../modules/mock";
import "./ComponentsPage.css";

export default function ComponentsPage() {
  const [components, setComponents] = useState<Component[]>(COMPONENTS_MOCK);
  const [searchTitle, setSearchTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setComponents(COMPONENTS_MOCK);
  }, []);

  const handleSearch = () => {
    setLoading(true);
    try {
      setComponents(filterMockComponentsByTitle(searchTitle));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="components-page">
      <Search query={searchTitle} onQueryChange={setSearchTitle} onSearch={handleSearch} />
      <div className="space">
        <main className="components-page__main">
          {loading ? (
            <div className="components-page__loading">
              <Spinner animation="border" role="status" aria-label="Загрузка">
                <span className="visually-hidden">Загрузка...</span>
              </Spinner>
            </div>
          ) : (
            <div className="services-grid components-page__grid">
              {components.length > 0 ? (
                <ComponentsList components={components} />
              ) : (
                <div className="components-page__empty">
                  {searchTitle
                    ? `По запросу «${searchTitle}» ничего не найдено`
                    : "Ничего не найдено"}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
