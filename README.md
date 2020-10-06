[![Project Status: Concept – Minimal or no implementation has been done yet, or the repository is only intended to be a limited example, demo, or proof-of-concept.](https://www.repostatus.org/badges/latest/concept.svg)](https://www.repostatus.org/#concept)

# youreco

## web app
A 'quick and rough' concept web-app that visualise events from habit-tracking sensors as a personal dashboard. This dashboard was used in a research project, where a proof of concept prototype stored sensors events in a Dropbox folder. Using IFTTT, new additions to that folder would update the database behind this youreco dashboard. Users can then authenticate, and see their sensor data chronologically, or summed per month.

The [/app](/app) folder contains the original web-app implementation with authentication, the [/demo](/demo) is an adjusted version to allow demonstration without authentication. Both still retrieve and render the data points from the linked Google Firestore database.

The app was based on the [Friendly Eats Firebase example project](https://firebaseopensource.com/projects/firebase/friendlyeats-web/), and was adapted to our needs. The code is in a very rushed and rough state.

![The timeline and summary overview of the YourEco app](/images/youreco.jpg)

## API
The [/functions](/functions) folder contains the Google Functions script used to offer an API to the IFTTT trigger, such that - when triggered - the corresponding file could be retrieved from Dropbox, and the data points were added to the database. This workaround was needed due to a finished prototype (storing data points in `.csv` files on DropBox) and time limitations preventing a direct coupling between prototype and database (which is advisable).
