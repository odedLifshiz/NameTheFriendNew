Mobile Architechture course

Submitting:
Oded Lifshiz and Stav Moskovich.

How to run:
afer extracting the files:
1) Install node modules by running npm install under the nameTheFriendFolder.
2) start the database by running mongod --dbpath [ path to database folder ]
   you could use the empty data folder inside the main folder of the app.
3) run the command - node app.js from.
4) Open localhost:3000

The application requires logging in with facebook.
In order to play with someone they must also register on facebook.

In order to test the application without facebook we allowed test mode 
in the cloud link.
Please follow the following instructions to play in test mode:

1) Browse to http://54.86.91.9:3000/ .
2) Click "Run test without facebook login".
3) Click login.
4) You are now logged in with Oded's facebook id.
5) Create a game with stav by clicking "New game" and proceed with the instructions.
6) After the message "Game was sent successfully" browse again to http://54.86.91.9:3000/.
7) Click again on "Run test without facebook login".
8) Click on Switch player.
9) Click login.
10) You are now logged in as Stav's facebook id. 
11) Click on "Your turn" and play the game sent by Oded.



