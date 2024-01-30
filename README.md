# Blogera API

Welcome to the documentation for the Blogera API. This API allows you to manage blog posts, users, and other related functionalities.

## Table of Contents

1. [Introduction](#introduction)
   - [Key Features](#key-features)
   - [Technologies Used](#key-features)
2. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Authentication](#authentication)
3. [API Documentation](#api-documentation)
4. [Contributing](#contributing)
5. [Version History](#version-history)
6. [Author](#author)
7. [License](#license)

## Introduction

The Blogera API is designed to streamline the development of applications related to blogging, content creation, and online communities. It allows developers to integrate robust blogging features into their applications, facilitating the creation and management of engaging content.

### Key Features:

Authentication: Signin, Signup, verify email, resend email verification, reset password.
User Management: Create user accounts, update profiles, and retrieve user information.
Email Notifications: Getting email notifications after performing certain processes.
Blog Post Operations: Create, update, retrieve, and delete blog posts. Interact with likes and other engagement features.
Comments feature: Create, Update, retrieve and delete individual blog post comments.
Category Management: Organize blog posts by categories, providing a structured and user-friendly browsing experience.

### Technologies Used:

The Blogera API is built on a robust tech stack, leveraging modern technologies to provide a seamless and efficient blogging experience. Here's a glimpse of the technologies used in the development of the Blogera API:

- Node.js
- Express.js
- MongoDB
- Mongoose
- Typescript
- PUG
- JSON Web Tokens (JWT)
- bcrypt
- Postman

## Getting Started

To begin using the Blogera API, refer to our comprehensive [API Documentation](https://documenter.getpostman.com/view/12146558/2s9YysCM8w) for detailed information on endpoints, request and response formats, and authentication procedures.
Feel free to explore the possibilities with Blogera API and enhance your applications with powerful blogging features!

### Prerequisites

You should have Node.js installed on your local machine.
Make sure your node.js version is 16.14.0 or higher.

### Installation

To install the API, follow the instructions below:

- Clone the repository to your local machine
- Run "npm install" to install all required packages/dependencies
- Run "npm run serve" to spin up the application server

#### Authentication

To ensure the security of user data and protected endpoints, the Blogera API uses token-based authentication. Users can obtain an access token by providing valid credentials during the authentication process.

## API Documentation

For detailed information on how to use the API, please refer to the [API Documentation](https://documenter.getpostman.com/view/12146558/2s9YysCM8w).

## Contributing

Contributions to this API is welcome, you can contibute to this project by following the simple steps below:

- Clone the repository to your local machine
- Run the server using the [Installation](#installation) processes above
- Make your contributions in the code changes or the documentation
- After you are done, create a new branch on your local computer. e.g git branch dev (note dev can be any name)
- After you are done, checkout to a new branch branch on your local computer. e.g git checkout dev (note dev can be any name)
- Then make commit your changes and push your commit to the remote on a different branch
- Lastly, make a pull request to merge your branch into the main branch

## Version History

- v1 (Version 1) Launch.

## Author

[Email](mailto:olajiire2@gmail.com "Hello Caleb")
Caleb Amao

## License

ISC
