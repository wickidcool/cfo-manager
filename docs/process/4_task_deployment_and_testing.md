# Task Integration
This phase ensures that the newly merged code is available for integration testing and is verified against the original task requirements.

## Task Deployment to Dev/Integration

The goal is to provide a rapidly updated environment for developers to test their changes together.

* **Trigger:** Once the code is merged to the `main` or `master` branch.
* **Action:** The tip of the `main`/`master` branch is automatically deployed to the **Dev/Integration** environment.
* **Purpose:** Allows developers to immediately see their code running in a shared environment and test integration with other newly merged tasks.

## Task Testing in QA Environment

Formal testing of the task happens in the QA environment as part of a grouped release process.

* **Pre-Release Trigger:** When a group of completed tasks (or the entire feature) is ready for QA, a new **pre-release tag** is created in the repository (e.g., GitHub).
* **Deployment:** The code that is part of that pre-release is then automatically deployed to the **QA Environment**.
* **Action:** The original developer (or a dedicated Tester) re-tests the task in the stable QA environment using the steps and criteria defined in the Task Definition.

## Defect Handling

Any defects (bugs) found during Task Testing must be handled systematically:

1.  **Triage:** Determine if the defect is a new, unrelated bug, or a direct failure of the current task implementation.
2.  **Scheduling:** Defects determined to be low priority or outside the current scope should be scheduled as a **new task in a different development cycle**.
3.  **Immediate Fix:** If the defect must be fixed immediately, the developer uses the original branch (if feasible) or a new fix branch to implement the correction.
4.  **New PR:** A new Pull Request should be created, reviewed, merged, and re-tested following the **Task Implementation** steps.
