import httpStatus from "http-status";
import { ZodError } from "zod";
import { ISendErrorResponse } from "../interfaces/errors";

const handleZodError = (err: ZodError): ISendErrorResponse => {
   const errorSources = err.issues.map((issue) => {
      return {
         path: issue.path[issue.path.length - 1],
         message: issue.message,
      };
   });

   return {
      statusCode: httpStatus.BAD_REQUEST,
      message: "Validation Error!!!",
      errorSources,
   };
};

export default handleZodError;
