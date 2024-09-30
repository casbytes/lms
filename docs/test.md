# Test algorithm

## Overview

This document outlines the algorithm for updating user progress based on test scores in our learning management system. The algorithm handles both module-level and sub-module-level tests, ensuring proper progression through the course content.

## Algorithm Details

### Module-Level Tests

When a user submits a module-level test:

1. If the score is ≥ 80%:
   - Update the test status to `COMPLETED`
   - Update the module checkpoint status to `IN_PROGRESS`
2. If there is no checkpoint and the user is subscribed:
   - Update the next module status to `IN_PROGRESS`
3. If there is no next module and the user is subscribed:
   - Update the associated project status to `IN_PROGRESS`

### Sub-Module-Level Tests

When a user submits a sub-module-level test:

1. If the score is ≥ 80%:
   - Update the test status to `COMPLETED`
   - Update the sub-module checkpoint status to `IN_PROGRESS`
2. If there is no checkpoint and the user is subscribed:
   - Update the next sub-module status to `IN_PROGRESS`
3. If there is no next sub-module and the user is subscribed:
   - Update the next module status to `IN_PROGRESS`

## Implementation Considerations

- Ensure proper error handling for edge cases (e.g., last module in a course)
- Implement appropriate database transactions to maintain data integrity
- Consider adding logging for debugging and auditing purposes
