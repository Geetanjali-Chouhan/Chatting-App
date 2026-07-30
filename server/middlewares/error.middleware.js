// export const errorMiddleware = (err, req, res, next) => {
//     err.statusCode = err.statusCode || 500;
//     err.message = err.message || "Internal server Error"
//   if (res.headersSent) {
//     return next(err)
//   }
//   res.status(err.statusCode).json
//   ({
//     success: false,
//     errorMessage: err.message,
//   });
// };
export const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    res.status(err.statusCode).json({
        success: false,
        errMessage: err.message,
    });
};