const MINIO_PUBLIC_BASE =
  (import.meta.env.VITE_MINIO_PUBLIC_BASE?.replace(/\/$/, "") as string | undefined) ??
  "http://localhost:9000/test";

export interface Component {
  component_id: number;
  is_deleted: boolean;
  title: string;
  description: string;
  photo_url: string;
  video: string;
  thermal_resistance: number;
  short_description_en?: string;
}

export function componentClipDescription(d: Component): string {
  const en = d.short_description_en?.trim();
  if (en) return en;
  return "Electric component";
}

export interface HeatingCart {
  has_draft: boolean;
  components_count: number;
  incomplete_items_count?: number;
  id?: number;
}

export interface HeatingJSON {
  heating_id: number;
  status: string;
  created_at: string;
  creator_login: string;
  moderator_login?: string | null;
  forming_date?: string | null;
  finish_date?: string | null;
  title?: string | null;
  incomplete_items_count: number;
  ambient_temperature: number;
}

export interface HeatingComponentJSON {
  heating_id: number;
  component_id: number;
  power_dissipation: number;
  heat: number;
}

export interface HeatingDetailResponse {
  heating: HeatingJSON;
  heats: HeatingComponentJSON[];
}


export function objectUrlFromKey(key: string): string {
  if (!key) return "";
  return `${MINIO_PUBLIC_BASE}/${key.replace(/^\//, "")}`;
}

export function fallbackImageUrl(): string {
  return (
    'src/assets/default_image.png'
  );
}

export function resolveMediaUrl(key: string): string {
  if (!key) return fallbackImageUrl();
  if (
    key.startsWith("http://") ||
    key.startsWith("https://") ||
    key.startsWith("/") ||
    key.startsWith("blob:") ||
    key.startsWith("data:")
  ) {
    return key;
  }
  return objectUrlFromKey(key);
}

export async function getHeatingCart(): Promise<HeatingCart> {
  try {
    const res = await fetch("/api/heating/heating-cart", {
      headers: { Accept: "heating/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { has_draft: false, components_count: 0 };
  }
}

export async function getHeating(
  id: number,
): Promise<HeatingDetailResponse | null> {
  const headers: Record<string, string> = { Accept: "heating/json" };
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`/api/heating/${id}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function listComponents(params?: { title?: string }): Promise<Component[]> {
  try {
    let path = "/api/components";
    if (params?.title) {
      const q = new URLSearchParams();
      q.append("Title", params.title);
      path += `?${q.toString()}`;
    }
    const res = await fetch(path, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function getComponent(id: number): Promise<Component | null> {
  try {
    const res = await fetch(`/api/components/${id}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function addComponentToHeating(
  componentId: number,
): Promise<{ ok: true } | { ok: false; status: number; message?: string }> {
  const token = localStorage.getItem("token");
  if (!token) {
    return { ok: false, status: 401, message: "Войдите в систему, чтобы добавить отдел в заявку." };
  }
  try {
    const res = await fetch(`/api/comp_heat_comp/add/${componentId}`, {
      method: "POST",
      headers: {
        Accept: "heating/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok || res.status === 201) return { ok: true };
    let message: string | undefined;
    try {
      const j = (await res.json()) as { error?: string; message?: string };
      message = j.error ?? j.message;
    } catch {
      message = await res.text();
    }
    return { ok: false, status: res.status, message: message || `HTTP ${res.status}` };
  } catch {
    return { ok: false, status: 0, message: "Не удалось выполнить запрос." };
  }
}

export async function editComponentInHeating(
  componentId: number,
  heatingId: number,
  body: {
    power_dissipation: number;
    heat: number | null;
  },
): Promise<boolean> {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const res = await fetch(`/api/comp_heat_comp/${componentId}/${heatingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "heating/json",
        Accept: "heating/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteHeating(heatingId: number): Promise<boolean> {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const res = await fetch(
      `/api/heating/${heatingId}/delete-heating`,
      {
        method: "DELETE",
        headers: { Accept: "heating/json", Authorization: `Bearer ${token}` },
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}
