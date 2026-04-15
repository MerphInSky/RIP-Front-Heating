import "./ComponentsList.css";
import ComponentCard from "../ComponentCard/ComponentCard";
import { type Component } from "../../modules/componentsApi";

export default function ComponentsList({ components }: { components: Component[] }) {
  return (
    <div className="container">
      {components.map((component) => (
        <ComponentCard key={component.component_id} component={component} />
      ))}
    </div>
  );
}
