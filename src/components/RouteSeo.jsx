import { useLocation } from "react-router-dom";
import Seo from "./Seo";
import { getSeoForPath } from "../config/seo";

function RouteSeo() {
  const { pathname } = useLocation();
  const { title, description, keywords, noindex } = getSeoForPath(pathname);

  return (
    <Seo
      title={title}
      description={description}
      keywords={keywords}
      path={pathname}
      noindex={noindex}
    />
  );
}

export default RouteSeo;
