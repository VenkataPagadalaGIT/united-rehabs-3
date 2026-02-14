import { useParams, Navigate } from "react-router-dom";
import StateStatsPage from "./StateStatsPage";
import StateRehabsPage from "./StateRehabsPage";
import NotFound from "./NotFound";
import { isValidStateSlug } from "@/data/stateConfig";

const StatePage = () => {
  const { slug } = useParams();
  
  if (!slug) {
    return <Navigate to="/" replace />;
  }

  // Year-based URLs: /state-addiction-rehabs-2025, /state-addiction-stats-2024
  const yearMatch = slug.match(/-(\d{4})$/);
  const baseSlug = yearMatch ? slug.replace(/-\d{4}$/, "") : slug;

  // Stats pages
  if (baseSlug.endsWith("-addiction-stats")) {
    const stateKey = baseSlug.replace(/-addiction-stats$/, "");
    if (isValidStateSlug(stateKey)) {
      return <StateStatsPage />;
    }
  }
  
  // Rehabs pages (including year-based)
  if (baseSlug.endsWith("-addiction-rehab-centers") || baseSlug.endsWith("-addiction-rehabs")) {
    const stateKey = baseSlug.replace(/-addiction-rehab-centers$/, "").replace(/-addiction-rehabs$/, "");
    if (isValidStateSlug(stateKey)) {
      return <StateRehabsPage />;
    }
  }
  
  // Free resources - redirect to stats
  if (baseSlug.endsWith("-addiction-free-resources")) {
    const stateKey = baseSlug.replace(/-addiction-free-resources$/, "");
    if (isValidStateSlug(stateKey)) {
      return <Navigate to={`/${stateKey}-addiction-stats`} replace />;
    }
  }

  // Bare state names - redirect to stats page
  if (isValidStateSlug(slug)) {
    return <Navigate to={`/${slug}-addiction-stats`} replace />;
  }

  return <NotFound />;
};

export default StatePage;
