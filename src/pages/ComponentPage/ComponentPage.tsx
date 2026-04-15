import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  COMPONENTS_MOCK,
  getMockComponent,
} from "../../modules/mock";
import {
  fallbackImageUrl,
  resolveMediaUrl,
  type Component,
} from "../../modules/componentsApi";
import "./ComponentPage.css";

export default function ComponentPage() {
  const [component, setComponent] = useState<Component | null>(null);
  const [mediaError, setMediaError] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (!id) {
      setComponent(null);
      return;
    }
    setMediaError(false);
    const resolved =
      getMockComponent(Number(id)) ??
      COMPONENTS_MOCK.find((d) => d.component_id === Number(id)) ??
      null;
    setComponent(resolved);
  }, [id]);

  const videoUrl = useMemo(
    () => (component ? resolveMediaUrl(component.video) : ""),
    [component],
  );
  const posterUrl = useMemo(
    () =>
      component ? resolveMediaUrl(component.photo_url) || fallbackImageUrl() : fallbackImageUrl(),
    [component],
  );
  const showVideo = Boolean(component?.video?.trim()) && !mediaError;



  if (!id || !component) {
    return (
      <div className="vibes-page vibes-page--scroll">
        <div className="component-not-found">
          <h1>Компонент не найден</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="vibes-page vibes-page--scroll">
      <div className="vibes-hero">
        <div className="vibes-viewport">
          <div className="vibes-media">
            {showVideo ? (
              <video
                className="vibes-video"
                controls
                autoPlay
                muted
                loop
                playsInline
                poster={posterUrl}
                onError={() => setMediaError(true)}
              >
                <source src={videoUrl} type="video/mp4" />
              </video>
            ) : (
              <div
                className="vibes-fallback"
                style={{
                  backgroundImage: `url(${posterUrl})`,
                }}
              />
            )}
            <div className="vibes-overlay" aria-hidden />
            <div className="vibes-content">
              <h1 className="vibes-title">{component.title}</h1>
              <p className="vibes-meta">
                Тепловое сопротивление: {component.thermal_resistance}
              </p>
              <p className="vibes-description">{component.description}</p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
