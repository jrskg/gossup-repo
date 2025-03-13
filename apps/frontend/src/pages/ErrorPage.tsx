import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ErrorPageProps {
  message?: string;
  location?: string | (() => void);
  statusCode?: number;
  locationLabel?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  message = "Oops! The page you're looking for doesn't exist.",
  location = "/",
  statusCode = 404,
  locationLabel = "Go Back Home"
}) => {
  const navigate = useNavigate();

  const handleLocationClick = () => {
    if (typeof location === "function") {
      location();
    } else {
      navigate(location);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-36 md:pt-0 md:h-screen bg-gray-100 text-gray-800 dark:bg-dark-1 dark:text-gray-200 transition-all">
      <AlertTriangle className="text-warning w-16 h-16 mb-4" />
      <h1 className="text-6xl font-bold mb-4">{statusCode}</h1>
      <p className="text-lg mb-8">{message}</p>
      <button
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        onClick={handleLocationClick}
      >
        {locationLabel}
      </button>
    </div>
  );
};

export default ErrorPage;
