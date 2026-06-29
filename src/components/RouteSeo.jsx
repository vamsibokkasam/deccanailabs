import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../config/analytics";
import Seo from "./Seo";
import { getSeoForPath } from "../config/seo";

function RouteSeo() {
  const { pathname } = useLocation();
  const { title, description, keywords, noindex } = getSeoForPath(pathname);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    trackPageView(pathname);
  }, [pathname]);

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
