# Feature Testing & Deployment

This is the final verification stage where the full feature is validated, approved, and released to the end-users.

## Test Deployment (QA Release)

Before final deployment, the completed feature set is formally released to QA for end-to-end validation.

* **Completion Criteria:** This stage begins when **all tasks for a feature are completed and merged**.
* **Definition of Done:** What defines "Done" needs to be explicitly defined by the organization. This must include consideration for any **"known Defects"**—bugs that the business accepts as non-critical for the initial release.
* **Release Artifact:** A new feature release is created and set as a **pre-release** in GitHub (or similar VCS) that includes all the code to be released.
* **Deployment:** The code tied to that pre-release tag is then deployed to the **QA Environment**.

## Feature Testing

The objective is to validate the entire user journey and feature functionality in an environment that mimics production.

* **Action:** Once deployed to QA, the whole application is re-tested (often via regression or smoke tests).
* **Targeted Testing:** Depending on the scope, resources, and risk of the feature, there may be targeted testing of the most critical parts or dependent features.
* **Final Definition of Done:** Re-evaluation of the "Done" criteria. All Acceptance Criteria from the Feature Definition must be satisfied.

## Defect Remediation and Approval

Bugs found during Feature Testing must be addressed quickly before production deployment.

* **New Bug Task:** Any defect found should result in a new **Bug task** being created and assigned to a developer.
* **Implementation:** The fix is implemented in a new branch, following the full **Task Implementation** steps (PR, review, merge).
* **Recycle:** Once merged, the new fix is included in the current QA release/pre-release, and **Feature Testing is repeated** to verify the fix and ensure no regressions.

## Deployment Approval

This is the final gate before shipping the code to production.

* **Sign-Off:** Once all defects are either **fixed** or formally accepted (put into the backlog as "known defects" with Feature Owner sign-off), final approval is required.
* **Scheduling:** Deployment to production is then scheduled according to organizational policy (e.g., maintenance window, continuous delivery pipeline).

## Feature Deployment (Production)

The final step is releasing the approved, tested code to the live environment.

* **Action:** The approved release tag is deployed to the **Production Environment**.
* **Validation:** Post-deployment smoke testing is performed to ensure the application is functioning correctly in a live setting.
* **Monitoring:** Continuous monitoring is enabled to catch any unexpected behavior or performance issues.
