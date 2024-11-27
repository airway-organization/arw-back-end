import validate from "validate.js";
import { ApiError } from "../utils/ApiError.js";

class Answer {
  constructor(answerBy, answer, questionId, submittedBy) {
    // Define validation constraints
    const constraints = {
      answer: {
        presence: { message: " must be present" },
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 100,
          message: " must be a number between 0 and 100",
        },
      },
    };

    // Perform validation
    const validationErrors = validate(
      {
        answer: answer,
      },
      constraints
    );

    // If validation fails, throw an error
    if (validationErrors) {
      const errorMessage = Object.keys(validationErrors)
        .map((key) => validationErrors[key].join(", "))
        .join("; ");
      throw new ApiError(400, errorMessage);
    }

    // Assign values to object properties
    this.answerBy = answerBy;
    this.answer = answer;
    this.questionId = questionId;
    this.submittedBy = submittedBy;
  }
}

export default Answer;
