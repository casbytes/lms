# Test algorithm

1. **Module:** On test submit, if the score is above or equal to 80%, update the test to `COMPLETED`
   and the module checkpoint to `IN_PROGRESS`. If there is no checkpoint, and the user is subscribed,
   update the next module to `IN_PROGRESS`. If there is no next module, and the user is subscribed,
   update the project associated with the module course to `IN_PROGRESS`.
2. **Sub module:** On test submit, if the score is above or equal to 80%, update the test to `COMPLETED`
   and the sub-module checkpoint to `IN_PROGRESS`. If there is no checkpoint, and the user is subscribed,
   update the next sub-module to `IN_PROGRESS`. If there is no next sub-module, and the user is subscribed,
   update the next module to `IN_PROGRESS`.
