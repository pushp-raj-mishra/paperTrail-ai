export const requireAuth = (req, res, next) => {
  //in future, i have to extract jwt from req.headers.authorization
  //and verify and fetch the user here

  req.user = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    email: "test@example.com",
  };
  next();
};
