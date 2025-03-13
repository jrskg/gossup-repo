export const useLocalStorageForRoute = () => {
  const setVerificationAccess = (isAccessible: boolean): void => {
    localStorage.setItem("isVerificationAccessible", JSON.stringify(isAccessible));
  }

  const getVerificationAccess = (): boolean => {
    const isAccessible = localStorage.getItem("isVerificationAccessible");
    if (isAccessible) return JSON.parse(isAccessible);
    return false;
  }

  const setInitialStepperAccess = (isAccessible: boolean): void => {
    localStorage.setItem("isStepperAccessible", JSON.stringify(isAccessible));
  }

  const removeRouteItem = (key: "isVerificationAccessible" | "isStepperAccessible"): void => {
    localStorage.removeItem(key);
  }

  const getInitialStepperAccess = (): boolean => {
    const isAccessible = localStorage.getItem("isStepperAccessible");
    if (isAccessible) return JSON.parse(isAccessible);
    return false;
  }
  return {
    setVerificationAccess,
    getVerificationAccess,
    setInitialStepperAccess,
    getInitialStepperAccess,
    removeRouteItem
  }
}