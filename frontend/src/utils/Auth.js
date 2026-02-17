export const getUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user && user !== "undefined" && user !== "null" ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    localStorage.removeItem("user");
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "/login";
};
