[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/nHPSu_dn)


## Functional Requirements

- [x] Anonymous users should be able to see the latest posts and reactions (emojis) when they visit the website (create
      some sample posts for demonstration)
- [x] Users can log in. You can choose whether users register with a username and password (not recommended) or log in
      via Google or Entra ID
- [x] A logged-in user should be able to view their profile page
- [x] Users should remain logged in when they refresh the website
- [x] A logged-in user should be able to click on a post to see who reacted to the post and its comments. The details
      should include a title, text, name, and image (if available) along with the publication date
- [x] Users can publish new posts. Posts must be between 10 and 1000 characters
- [x] The system should prevent a user from publishing more than 5 posts within one hour
- [x] Users should be prevented from submitting a post without text
- [x] A user should be able to edit a post they have published
- [x] A user should be able to delete a post they have published
- [x] Users should be able to react to other posts with multiple emojis
- [x] Optional: Users can comment on other posts
- [ ] Optional: Users can add other users as friends
- [x] All error messages should be presented to the user in a friendly manner, with an option to retry

## Technical Requirements

- [x] The submission should include a README file with a link to Heroku and test coverage
- [x] `npm start` should start both the server and client. Concurrently and Vite recommended
- [ ] `npm test` should run tests. Tests must not fail. Vitest recommended
- [x] Code should have consistent formatting. Prettier and Husky recommended
- [x] The website layout should use CSS Grid and a horizontal navigation menu. Users must be able to navigate everywhere
      without using "back" or modifying the URL
- [x] The server should validate that the user is logged in
- [ ] The submission should be in a ZIP file. Maximum file size per file is 1MB
- [x] Data should be stored in MongoDB
- [x] The application should be deployed to Heroku
- [ ] Tests should run via GitHub Actions
