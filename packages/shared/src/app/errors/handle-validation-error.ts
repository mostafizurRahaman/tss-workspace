import mongoose from 'mongoose'
import type { IErrorSources, ISendErrorResponse } from '../types'
import httpStatus from 'http-status'

const handleValidationError = (err: mongoose.Error.ValidationError): ISendErrorResponse => {
  const errorSources: IErrorSources[] = Object.values(err.errors).map(
    (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: val.path,
        message: val.message,
      }
    }
  )

  const statusCode: number = httpStatus.BAD_REQUEST

  return {
    statusCode,
    message: 'Validation Error',
    errorSources,
  }
}

export default handleValidationError
