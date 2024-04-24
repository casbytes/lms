# Scripts

> Crafting exceptional software challenges for Tomorrow's challenges.

- **✅ validate-schema script**: Everytime we add a new course or update a course's modules, sub-modules, or lessons,
  we want this script to validate the schema of the json file that contains the meta data of the created or updated
  course so as to avoid downtimes and irregular courses structure.
- **🚀 update-db script**: After the schema(s) are validated, we want to update our database to contain the latest
  changes in our json files. This script takes care of that for us.
- **🌍 start script**: After validating schemas and updating our database, it is time for our app to re-start and
  reflect the new changes.

- **🛠️ utils**: Contains two (2) functions, one for reading json files from the `meta` folder and the other for
  parsing the read files to update the DB.
