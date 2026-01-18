import { useParams, Navigate } from "react-router-dom";
import StateStatsPage from "./StateStatsPage";
import StateRehabsPage from "./StateRehabsPage";
import StateResourcesPage from "./StateResourcesPage";
import NotFound from "./NotFound";
import { isValidStateSlug } from "@/data/stateConfig";

const StatePage = () => {
  const { slug } = useParams();
  
  if (!slug) {
    return <Navigate to="/" replace />;
  }

  // Determine which type of page based on suffix
  if (slug.endsWith("-addiction-stats")) {
    const stateKey = slug.replace(/-addiction-stats$/, "");
    if (isValidStateSlug(stateKey)) {
      return <StateStatsPage />;
    }
  }
  
  // Support both -addiction-rehabs and -addiction-rehab-centers
  if (slug.endsWith("-addiction-rehab-centers") || slug.endsWith("-addiction-rehabs")) {
    const stateKey = slug.replace(/-addiction-rehab-centers$/, "").replace(/-addiction-rehabs$/, "");
    if (isValidStateSlug(stateKey)) {
      return <StateRehabsPage />;
    }
  }
  
  if (slug.endsWith("-addiction-free-resources")) {
    const stateKey = slug.replace(/-addiction-free-resources$/, "");
    if (isValidStateSlug(stateKey)) {
      return <StateResourcesPage />;
    }
  }

  // Handle bare state names (e.g., /california) - redirect to rehabs page
  if (isValidStateSlug(slug)) {
    return <Navigate to={`/${slug}-addiction-rehabs`} replace />;
  }

  // Not a valid state page - render NotFound directly
  return <NotFound />;
};

export default StatePage;
