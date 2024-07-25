# Checkpoint

## Concepts

- Module checkpoint
- Module checkpoint withiut a course
- Sub module checkpoint

## Concepts

### Module checkpoint

If the checkpoint is a module checkpoint, update it and if the requirements are met,
update the next module to `IN_PROGRESS`, if not the student will have to redo the checkpoint.
If there is no next module, and the requirements are met, update the associated course to `COMPLETED`.

### Module checkpoint without a course

If the checkpoint is not associated with a course, update it to completed.

### Sub module checkpoint

If the checkpoint is associated with a sub module, and the requirements are met,
update the next sub module to `IN_PROGRESS`, if there is no next sub module, update the next module to `IN_PROGRESS`,
if there is no next module, update the `test` of the current associated module to `AVAILABLE`.

## Grading Method

### Mannual grading

If the method of grading is mannual, submit the checkpoint for mannual grading.

### Auto grading

If the method of grading is auto, the auto grader (test runner) will grade, return response, and update the checkpoint.
