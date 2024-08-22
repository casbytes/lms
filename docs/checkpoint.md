# Checkpoint algorithm

1. **Module:** On checkpoint graded, if the score is 80% or more, update the checkpoint
   to `COMPLETED` and the next module to `IN_PROGRESS` if the user is subscribed.
   If there is no next module, and the user is subscribed, update the associated course
   project to `IN_PROGRESS`.
2. **Sub module:** On checkpoint graded, if the score is 80% or more, update the checkpoint
   to `COMPLETED` and the next sub-module to `IN_PROGRESS` if the user is subscribed.
   If there is no next sub-module, and the user is subscribed, update the associated module
   test to `IN_PROGRESS`.
