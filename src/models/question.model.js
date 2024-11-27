import validate from "validate.js";
import { ApiError } from "../utils/ApiError.js";

class Question {
  constructor(question, isActive) {
    const validationErrors = validate(
      {
        question: question,
        isActive: isActive,
      },
      {
        question: {
          presence: { message: "field must be present" },
          type: "string",
        },
        isActive: {
          presence: { message: "field must be present" },
          type: "boolean",
        },
      }
    );

    if (validationErrors) {
      const errorMessage = Object.keys(validationErrors)
        .map((key) => validationErrors[key].join(", "))
        .join("; ");
      throw new ApiError(400, errorMessage);
    }

    this.question = question;
    this.isActive = isActive;
  }
}

export default Question;
