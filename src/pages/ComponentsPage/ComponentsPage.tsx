import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import Search from "../../components/InputField/InputField";
import ComponentsList from "../../components/ComponentsList/ComponentsList";
import {
  componentClipDescription,
  listComponents,
} from "../../modules/componentsApi";
import type { Component } from "../../modules/componentsApi";
import { COMPONENTS_MOCK } from "../../modules/mock";
import { useComponentImageSearch } from "../../hooks/useComponentImageSearch";
import "./ComponentsPage.css";


export default function ComponentsPage() {
  const [clipSourceComponents, setClipSourceComponents] = useState<Component[]>([]);
  const [displayComponents, setDisplayComponents] = useState<Component[]>([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [useMock, setUseMock] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [clipSessionActive, setClipSessionActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (useMock) {
        if (!cancelled) {
          setClipSourceComponents(COMPONENTS_MOCK);
          setDisplayComponents(COMPONENTS_MOCK);
        }
        return;
      }
      try {
        const data = await listComponents();
        if (cancelled) return;
        if (data.length > 0) {
          setClipSourceComponents(data);
          setDisplayComponents(data);
        } else {
          setClipSourceComponents(COMPONENTS_MOCK);
          setDisplayComponents(COMPONENTS_MOCK);
          setUseMock(true);
        }
      } catch {
        if (cancelled) return;
        setClipSourceComponents(COMPONENTS_MOCK);
        setDisplayComponents(COMPONENTS_MOCK);
        setUseMock(true);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [useMock]);

  const clipItems = useMemo(
    () =>
      clipSourceComponents.map((d) => ({
        id: d.component_id,
        description: componentClipDescription(d),
      })),
    [clipSourceComponents],
  );

  const {
    items: clipProcessed,
    imageEmbedding,
    workerError,
    searchByImage,
    resetSearch,
  } = useComponentImageSearch(clipItems, clipSessionActive);

  const compById = useMemo(() => {
    const m = new Map<number, Component>();
    clipSourceComponents.forEach((d) => m.set(d.component_id, d));
    return m;
  }, [clipSourceComponents]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const filtered = await listComponents({ title: searchTitle });

      if (filtered.length > 0) {
        setDisplayComponents(filtered);
        setUseMock(false);
      } else {
        if (useMock) {
          const filteredMock = COMPONENTS_MOCK.filter((d) =>
            d.title.toLowerCase().includes(searchTitle.toLowerCase()),
          );
          setDisplayComponents(filteredMock);
        } else {
          setDisplayComponents([]);
        }
      }
    } catch {
      const filteredMock = COMPONENTS_MOCK.filter((d) =>
        d.title.toLowerCase().includes(searchTitle.toLowerCase()),
      );
      setDisplayComponents(filteredMock);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadButtonClick = () => {
    if (!clipSessionActive) setClipSessionActive(true);
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (selectedImage?.startsWith("blob:")) URL.revokeObjectURL(selectedImage);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      searchByImage(file);
    }
  };

  const handleClearImage = () => {
    if (selectedImage?.startsWith("blob:")) URL.revokeObjectURL(selectedImage);
    setSelectedImage(null);
    resetSearch();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const imageSearchActive = Boolean(imageEmbedding);
  const isUploadDisabled = clipItems.length === 0;
  const canResetImage = Boolean(selectedImage);

  const visibleClipRows = imageSearchActive
    ? clipProcessed.filter((item) => item.isVisible)
    : [];

  // 🟢 Подготовка данных для мультимодального поиска: склеиваем с полными компонентами
  const clipResultsWithDetails = useMemo(() => {
    if (!imageSearchActive) return [];
    return visibleClipRows
      .map((item) => {
        const comp = compById.get(item.id);
        if (!comp) return null;
        return {
          ...comp,
          _similarityScore: item.score, // добавляем сходство (0..1)
        };
      })
      .filter(Boolean) as (Component & { _similarityScore?: number })[];
  }, [imageSearchActive, visibleClipRows, compById]);

  return (
    <div className="components-page">
      <Search query={searchTitle} onQueryChange={setSearchTitle} onSearch={handleSearch} />

      <div className="space">
        <main className="components-page__main">
          <section
            className="components-page__clip-search clip-search-section"
            aria-labelledby="clip-search-title"
          >
            <h2 id="clip-search-title" className="clip-search-section__heading">
              Поиск компонента по изображению
            </h2>

            {workerError ? (
              <p className="clip-search-section__worker-msg" role="status">
                Не удалось загрузить модель или обработать запрос: {workerError}
              </p>
            ) : null}

            {clipItems.length === 0 ? (
              <p className="text-muted clip-search-section__empty-catalog">
                Загрузите каталог компонентов...
              </p>
            ) : (
              <div className="clip-search-section__panel">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="clip-search-section__file-input"
                  onChange={handleImageUpload}
                />

                <div className="clip-search-section__preview-wrap">
                  {selectedImage ? (
                    <img src={selectedImage} alt="" className="clip-search-section__preview-image" />
                  ) : (
                    <div className="clip-search-section__placeholder-image">Нет фото</div>
                  )}
                </div>

                <div className="clip-search-section__action-panel action-panel">
                  <Button
                    className="action-btn clip-search-section__btn-upload"
                    variant="outline-info"
                    onClick={handleUploadButtonClick}
                    disabled={isUploadDisabled}
                  >
                    Загрузить фото
                  </Button>

                  <Button
                    className="action-btn"
                    variant="outline-info"
                    onClick={handleClearImage}
                    disabled={!canResetImage}
                  >
                    Сбросить
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* 🟢 Единый блок рендеринга — всегда через ComponentsList */}
          {loading ? (
            <div className="text-center py-4">Загрузка...</div>
          ) : (
            <div className="services-grid components-page__grid">
              {imageSearchActive
                ? clipResultsWithDetails.length > 0
                  ? <ComponentsList components={clipResultsWithDetails as any} />
                  : <div className="components-page__empty">
                      Нет компонентов выше порога сходства. Попробуйте другое изображение.
                    </div>
                : displayComponents.length > 0
                  ? <ComponentsList components={displayComponents} />
                  : <div className="components-page__empty">
                      {searchTitle
                        ? `По запросу «${searchTitle}» ничего не найдено`
                        : "Подразделения не найдены"}
                    </div>
              }
            </div>
          )}
        </main>
      </div>
    </div>
  );
}