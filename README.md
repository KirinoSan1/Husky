# Husky

## Project name

The project is called "Husky".

## Project description

As part of the project, a discussion forum for the exchange of
knowledge gets realized. Users will be able to create
posts in threads in the traditional way or exchange information
directly with each other via a live chat. The forum is moderated
and administered by appropriate stakeholders. Users can hold
technical discussions as well as ask and answer specific questions.

Users who are about to buy a car, for example, can ask questions about various models, prices and features in the forum.
Other users can then share their recommendations based on their own knowledge and experience.

## Team members

- Alexander Suesskind (UI/UX, Frontend)
    - Matric. number: 933780
    - E-Mail: s87424@bht-berlin.de
- Can Pala (UI/UX, Backend)
    - Matric. number: 938092
    - E-Mail: s88011@bht-berlin.de
- Dominik Henning (Maintainer, Frontend, Client/Server interface)
    - Matric. number: 934954
    - E-Mail: s88126@bht-berlin.de
- Maximilian Diek (Maintainer, UML diagrams, Frontend, Client/Server interface)
    - Matric. number: 928836
    - E-Mail: s87999@bht-berlin.de
- Mohammad Hammad (Backend)
    - Matric. number: 929184
    - E-Mail: s88475@bht-berlin.de
- Umut Can Aydin (Backend)
    - Matric. number: 929104
    - E-Mail: s87720@bht-berlin.de

## Tech-Stack

### General
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)

### Frontend
- [React](https://react.dev/)
- [SCSS](https://sass-lang.com/documentation/syntax/)

### Backend
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Socket.IO](https://socket.io/)

### User authentication
- [bcrypt](https://de.wikipedia.org/wiki/Bcrypt)
- [JWT](https://jwt.io/)

### Testing
- [Jest](https://jestjs.io/)

### Documentation
- [Swagger](https://swagger.io/)

### Deployment
- [Docker](https://www.docker.com/)
- [Kubernetes](https://kubernetes.io/)

## First steps

### Requirements analysis

To determine the requirements for our application a use case diagram is created.

Furthermore, the structure of the application is outlined using a class diagram.

Based on the class diagramm tickets for the implementation are getting developed.

At the same time, the frontend and backend projects are set up in GitLab.

## Tools

The use case diagram and the class diagram are created with [draw.io](https://app.diagrams.net/).

[Visual Studio Code](https://code.visualstudio.com/) or alternatively [WebStorm](https://www.jetbrains.com/webstorm/) is used as [IDEA](https://en.wikipedia.org/wiki/Integrated_development_environment).

To visualize the data from the database [MongoDB Compass](https://www.mongodb.com/products/tools/compass) will be used.

## Project structure

There is a "frontend" directory containing all source code files for the frontend.

There is a "backend" directory containing all source code and test files for the backend.

The naming of the subdirectories follows a generally known structure. The source code, for example, is located in a directory named "src".

## Coding standards

Essentially, we adhere to the Java code conventions:<br>
https://www.oracle.com/java/technologies/javase/codeconventions-introduction.html

We also use the principle of guard clauses, if possible, to free the code from superfluous nesting:<br>
https://en.wikipedia.org/wiki/Guard_(computer_science)

It is intended that the Jest tests for the backend will always feature a code coverage of 100 percent.
