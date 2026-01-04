import { useParams, Navigate } from "react-router-dom";
import StateStatsPage from "./StateStatsPage";
import StateRehabsPage from "./StateRehabsPage";
import StateResourcesPage from "./StateResourcesPage";

// Map state names to IDs
const stateSlugMap: Record<string, string> = {
  california: "ca",
  texas: "tx",
  florida: "fl",
  "new-york": "ny",
};

const StatePage = () => {
  const { slug } = useParams();
  
  if (!slug) {
    return <Navigate to="/" replace />;
  }

  // Determine which type of page based on suffix
  if (slug.endsWith("-addiction-stats")) {
    const stateKey = slug.replace(/-addiction-stats$/, "");
    if (stateSlugMap[stateKey]) {
      return <StateStatsPage />;
    }
  }
  
  // Support both -addiction-rehabs and -addiction-rehab-centers
  if (slug.endsWith("-addiction-rehab-centers") || slug.endsWith("-addiction-rehabs")) {
    const stateKey = slug.replace(/-addiction-rehab-centers$/, "").replace(/-addiction-rehabs$/, "");
    if (stateSlugMap[stateKey]) {
      return <StateRehabsPage />;
    }
  }
  
  if (slug.endsWith("-addiction-free-resources")) {
    const stateKey = slug.replace(/-addiction-free-resources$/, "");
    if (stateSlugMap[stateKey]) {
      return <StateResourcesPage />;
    }
  }

  // Handle bare state names (e.g., /california) - redirect to rehabs page
  if (stateSlugMap[slug]) {
    return <Navigate to={`/${slug}-addiction-rehabs`} replace />;
  }

  // Not a valid state page - let it fall through to 404
  return <Navigate to="/not-found" replace />;
};

export default StatePage;
