export const ROUTES = {
  COMPONENTS: "/",
  COMPONENT: "/component/:id",
  HEATING: "/heating/:id",
};
export type RouteKeyType = keyof typeof ROUTES;
export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  COMPONENTS: "Главная",
  COMPONENT: "Компонент",
  HEATING: "Заявка",
};
