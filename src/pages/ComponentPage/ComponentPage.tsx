import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import {
  fallbackImageUrl,
  getComponent,
  objectUrlFromKey,
} from "../../modules/componentsApi.ts";
import type { Component } from "../../modules/componentsApi.ts";
import { COMPONENTS_MOCK } from "../../modules/mock";
import "./ComponentPage.css";

function resolveMediaUrl(key: string): string {
  if (!key) return "";
  if (
    key.startsWith("http://") ||
    key.startsWith("https://") ||
    key.startsWith("/") ||
    key.startsWith("blob:")
  ) {
    return key;
  }
  return objectUrlFromKey(key);
}

export default function ComponentPage() {
  const [component, setComponent] = useState<Component | null>(null);
  const [loading, setLoading] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setMediaError(false);
      try {
        const data = await getComponent(Number(id));
        const resolved =
          data ?? COMPONENTS_MOCK.find((d) => d.component_id === Number(id)) ?? null;

        if (!cancelled) {
          setComponent(resolved);
        }
      } catch {
        const resolved =
          COMPONENTS_MOCK.find((d) => d.component_id === Number(id)) ?? null;
        if (!cancelled) {
          setComponent(resolved);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="vibes-page">
        <div className="device-page-loader">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  if (!component) {
    return (
      <div className="vibes-page">
        <div className="component-not-found">
          <h1>Компонент не найден</h1>
        </div>
      </div>
    );
  }

  const videoUrl = resolveMediaUrl(component.video);
  const posterUrl = resolveMediaUrl(component.photo_url) || fallbackImageUrl();
  const showVideo = Boolean(component.video?.trim()) && !mediaError;

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
