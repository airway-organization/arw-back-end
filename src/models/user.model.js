import validate from "validate.js";
import { ApiError } from "../utils/ApiError.js";

class User {
  constructor(
    username,
    email,
    password,
    age,
    gender,
    phoneNumber,
    profileImg = ""
  ) {
    // Assign properties
    this.username = username;
    this.email = email;
    this.password = password;
    this.age = age;
    this.gender = gender;
    this.phoneNumber = phoneNumber;
    this.profileImg = profileImg;

    // Define validation constraints
    this.constraints = {
      username: {
        presence: { message: " cannot be empty" },
        length: {
          minimum: 3,
          message: " must be at least 3 characters long",
        },
        type: "string",
      },
      email: {
        presence: { message: " cannot be empty" },
        email: { message: "Invalid email format" },
        type: "string",
      },
      password: {
        presence: { message: " cannot be empty" },
        length: {
          minimum: 8,
          message: " must be at least 8 characters long",
        },
        type: "string",
      },
      age: {
        presence: { message: " cannot be empty" },
        numericality: {
          onlyInteger: true,
          greaterThan: 0,
          message: "Invalid age",
        },
        type: "number",
      },
      gender: {
        presence: { message: " cannot be empty" },
        inclusion: {
          within: ["male", "female", "other"],
          message: "Invalid gender",
        },
      },
      phoneNumber: {
        presence: { message: " cannot be empty" },
        type: "string",
      },
      profileImg: {
        type: "string",
      },
    };
  }

  validate() {
    // Perform validation
    const validationErrors = validate(this, this.constraints);

    // If validation fails, throw an error
    if (validationErrors) {
      const errorMessage = Object.keys(validationErrors)
        .map((key) => validationErrors[key].join(", "))
        .join("; ");
      throw new ApiError(400, errorMessage);
    }
  }
}

export default User;
