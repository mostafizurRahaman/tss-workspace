import mongoose from "mongoose";
import { IErrorSources, ISendErrorResponse } from "../interfaces/errors";
import httpStatus from "http-status";

const handleCastError = (err: mongoose.Error.CastError): ISendErrorResponse => {
   const errorSources: IErrorSources[] = [
      {
         path: err.path,
         message: err.message,
      },
   ];
   return {
      statusCode: httpStatus.BAD_REQUEST,
      message: "Invalid ID",
      errorSources,
   };
};

export default handleCastError;
