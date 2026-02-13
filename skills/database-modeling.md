## Database Modeling Skill

### When to Use This Skill
When defining or updating database schemas using SQLModel for PostgreSQL databases.

### How This Skills Works
1. Read database specification to understand the required schema
2. Create SQLModel classes with proper field types and constraints
3. Add relationships between tables (e.g., user_id foreign key constraints)
4. Define appropriate indexes for performance optimization

### Output Format
Python models.py content with SQLModel classes, relationships, and proper field definitions.

### Quality Criteria
- Schema matches specification requirements exactly
- Proper handling of nullable fields and constraints
- Automatic timestamp fields added where appropriate
- Foreign key relationships properly defined
- Indexes added for frequently queried fields

### Example
**Input**: Model tasks table with user relationship
**Output**:
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
import datetime

class Task(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow,
                                         sa_column_kwargs={"onupdate": datetime.datetime.utcnow})

    user: "User" = Relationship(back_populates="tasks")
```