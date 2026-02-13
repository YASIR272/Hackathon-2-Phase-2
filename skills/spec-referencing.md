## Spec Referencing Skill

### When to Use This Skill
When implementing code that needs to reference specifications (e.g., @specs/features/task-crud.md).

### How This Skill Works
1. Identify relevant specification paths based on the feature being implemented
2. Read and extract key requirements from the referenced specs
3. Map specification requirements to appropriate code structure
4. Ensure implementation matches all specified criteria

### Output Format
Implementation code with comments referencing the specifications that guided the implementation.

### Quality Criteria
- All feature requirements from specs are covered
- No deviations from specifications without proper justification
- Specification references maintained in code comments
- Implementation aligns with acceptance criteria

### Example
**Input**: Implement create task functionality according to spec
**Output**:
```typescript
// Create task function that follows @specs/features/task-crud.md requirements
// Ref: @specs/features/task-crud.md#creating-tasks
export async function createTask(taskData: TaskInput) {
  // Implementation that meets spec requirements
}
```