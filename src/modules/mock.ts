import {
  type Component,
  type HeatingCart,
  type HeatingDetailResponse,
} from "./componentsApi";
import firstPhoto from "../assets/1-BD9897FS.jpg";
import firstVideo from "../assets/GIFKA.mp4";
import secondPhoto from "../assets/2-FDD8447L.jpg";
import secondVideo from "../assets/gifgif.mp4";
import thirdPhoto from "../assets/3-B1261.jpg";
import thirdVideo from "../assets/GIFKA.mp4";
import fourthPhoto from "../assets/4-AO4606C.jpg";
import fourthVideo from "../assets/gifgif.mp4";
import fifthPhoto from "../assets/5-BZX55-33V.jpg";
import fifthVideo from "../assets/GIFKA.mp4";
import sixthPhoto from "../assets/6-NE555H.jpg";
import sixthVideo from "../assets/gifgif.mp4";

export const COMPONENTS_MOCK: Component[] = [
  {
    component_id: 1,
    is_deleted: false,
    title: "Микросхема BD9897FS",
    description: "Контроллер управления инвертором подсветки для ЖК-дисплеев в корпусе для поверхностного монтажа SOP-24",
    photo_url: '',
    video: firstVideo,
    thermal_resistance: 132,
  },
  {
    component_id: 2,
    is_deleted: false,
    title: "Транзистор FDD8447L",
    description: "N-канальный полевой транзистор для силовой коммутации в корпусе D-PAK для поверхностного монтажа",
    photo_url: '',
    video: secondVideo,
    thermal_resistance: 2,
  },
  {
    component_id: 3,
    is_deleted: false,
    title: "Транзистор B1261",
    description: "Высокотоковый PNP-транзистор для усилителей мощности и схем управления в металлическом корпусе TO-3P",
    photo_url: '',
    video: thirdVideo,
    thermal_resistance: 12,
  },
  {
    component_id: 4,
    is_deleted: false,
    title: "Транзисторная сборка AO4606C",
    description: "Комплементарная пара полевых транзисторов N- и P-канального типов в компактном корпусе SO-8 для поверхностного монтажа",
    photo_url: '',
    video: fourthVideo,
    thermal_resistance: 40,
  },
    {
    component_id: 5,
    is_deleted: false,
    title: "Стабилитрон BZX55-33V",
    description: "Малосигнальный стабилитрон, напряжение стабилизации 33 В, мощность 500 мВт, допуск ±5%, корпус DO-35 (выводной монтаж) ",
    photo_url: '',
    video: fifthVideo,
    thermal_resistance: 300,
  },
    {
    component_id: 6,
    is_deleted: false,
    title: "Микросхема NE555H",
    description: "Контроллер импульсного источника питания с ШИМ, токовый режим управления, защита от перегрузки, корпус DIP-8",
    photo_url: '',
    video: sixthVideo,
    thermal_resistance: 15,
  },

];

export const MOCK_CART: HeatingCart = {
  has_draft: true,
  components_count: 2,
  incomplete_items_count: 0,
  id: 1,
};

export function getMockComponent(id: number): Component | undefined {
  return COMPONENTS_MOCK.find((d) => d.component_id === id);
}

export function filterMockComponentsByTitle(title: string): Component[] {
  const t = title.trim().toLowerCase();
  if (!t) return [...COMPONENTS_MOCK];
  return COMPONENTS_MOCK.filter((d) => d.title.toLowerCase().includes(t));
}

export async function addComponentToMockHeating(
  componentId: number,
): Promise<{ ok: true } | { ok: false; message?: string }> {
  void componentId;
  await new Promise((r) => setTimeout(r, 200));
  return { ok: true };
}

export const MOCK_HEATING_DETAIL: HeatingDetailResponse = {
  heating: {
    heating_id: 1,
    status: "draft",
    created_at: new Date().toISOString(),
    creator_login: "demo",
    incomplete_items_count: 0,
    ambient_temperature: 25,
  },
  heats: [
    {
      heating_id: 1,
      component_id: 1,
      power_dissipation: 1,
      heat: 1,
    },
    {
      heating_id: 1,
      component_id: 4,
      power_dissipation: 15,
      heat: 15,
    },
  ],
};
