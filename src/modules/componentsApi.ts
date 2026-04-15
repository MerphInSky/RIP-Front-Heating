export interface Component {
  component_id: number;
  is_deleted: boolean;
  title: string;
  description: string;
  photo_url: string;
  video: string;
  thermal_resistance: number;
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
  return fallbackImageUrl();
}
