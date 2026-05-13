export const ROUTES = {
  COMPONENTS: "/",
  COMPONENT: "/component/:id",
  HEATING: "/heatings/:id",
  SIGN_IN: "/signin",
  SIGN_UP: "/signup",
  HEATINGS: "/heatings",
} as const;

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  COMPONENTS: "Главная",
  COMPONENT: "Компонент",
  HEATING: "Заявка",
  SIGN_IN: "Вход",
  SIGN_UP: "Регистрация",
  HEATINGS: "Заявки",
};
