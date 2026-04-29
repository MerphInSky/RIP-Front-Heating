import { type Component, type HeatingDetailResponse } from "./componentsApi";
import d from "../assets/default_image.png";
export const COMPONENTS_MOCK: Component[] = [
  {
    component_id: 1,
    is_deleted: false,
    title: "Микросхема BD9897FS",
    description: "Контроллер управления инвертором подсветки для ЖК-дисплеев в корпусе для поверхностного монтажа SOP-24",
    photo_url: d,
    video: d,
    thermal_resistance: 132,
    short_description_en:
      "Inverter backlight control controller",
  },
  {
    component_id: 2,
    is_deleted: false,
    title: "Транзистор FDD8447L",
    description: "N-канальный полевой транзистор для силовой коммутации в корпусе D-PAK для поверхностного монтажа",
    photo_url: d,
    video: d,
    thermal_resistance: 2,
    short_description_en: "Field transistor for power switching",
  },
  {
    component_id: 3,
    is_deleted: false,
    title: "Транзистор B1261",
    description: "Высокотоковый PNP-транзистор для усилителей мощности и схем управления в металлическом корпусе TO-3P",
    photo_url: d,
    video: d,
    thermal_resistance: 40,
    short_description_en: "High current transistor for power amplifiers",
  },
  {
    component_id: 4,
    is_deleted: false,
    title: "Транзисторная сборка AO4606C",
    description: "Комплементарная пара полевых транзисторов N- и P-канального типов в компактном корпусе SO-8 для поверхностного монтажа",
    photo_url: d,
    video: d,
    thermal_resistance: 300,
    short_description_en: "Complementary pair of field transistors",
  },
];

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

export function getMockComponent(id: number): Component | undefined {
  return COMPONENTS_MOCK.find((t) => t.component_id === id);
}