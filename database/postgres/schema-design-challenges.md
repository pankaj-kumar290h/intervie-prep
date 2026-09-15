# PostgreSQL Schema Design Challenges — Easy → Very Hard

10 schema design problems, each built to teach one new concept you'll actually hit in
real systems. Every entry has a problem statement, the concept it's teaching, a working
PostgreSQL schema (DDL), and a short explanation of *why* the design is shaped that way
(not just what it does). Try designing the schema yourself before reading the solution.

## Table of Contents

**Easy**
1. [Blog: Users & Posts](#1-blog-users--posts) — normalization, PK/FK basics
2. [E-Commerce Orders](#2-e-commerce-orders) — one-to-many, referential actions, money types

**Medium**
3. [Students & Courses](#3-students--courses) — many-to-many junction tables
4. [Org Chart](#4-org-chart) — self-referencing keys, recursive CTEs
5. [Comments on Posts & Photos](#5-comments-on-posts--photos) — polymorphic associations done right

**Hard**
6. [Product Price History](#6-product-price-history) — temporal data, exclusion constraints
7. [Multi-Tenant SaaS](#7-multi-tenant-saas) — tenant isolation, row-level security
8. [Soft Deletes & Audit Log](#8-soft-deletes--audit-log) — partial indexes, triggers

**Very Hard**
9. [Social Graph & Tag Hierarchy](#9-social-graph--tag-hierarchy) — closure tables
10. [Double-Entry Ledger](#10-double-entry-ledger) — immutability, partitioning, financial integrity

---

## Easy

### 1. Blog: Users & Posts

**Problem.** Design a schema for a blog: users write posts. Each post has a title, body,
and a published state. Avoid data duplication and keep the schema normalized.

**Concept: normalization (1NF/2NF/3NF) and primary/foreign keys.** A naive first attempt
often repeats the author's name/email on every post row. Normalization means each fact
lives in exactly one place — the user's email lives in `users`, and a post only stores a
*reference* to the user who owns it.

```sql
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  display_name  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE posts (
  id            BIGSERIAL PRIMARY KEY,
  author_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  is_published  BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX posts_author_id_idx ON posts(author_id);
```

**Why this design.** `author_id` is a foreign key, not a copy of the user's data — update
a display name once, and every post reflects it automatically. `ON DELETE CASCADE` states
an explicit policy for what happens to a user's posts when the user is deleted (see
Question 2 for the other options). The index on `author_id` exists because "all posts by
this user" is the query you'll run constantly, and a foreign key column is **not**
automatically indexed in Postgres.

**Try it yourself.** Add a `tags` concept to this schema — should a post have a single
`category` column, or something else? (This sets up Question 3.)

---

### 2. E-Commerce Orders

**Problem.** Model orders and their line items. An order belongs to one customer and
contains multiple line items, each referencing a product, a quantity, and the price at
time of purchase.

**Concept: one-to-many relationships, referential actions, and correct money types.**
Three decisions matter here: which table holds the foreign key (the "many" side), what
happens on delete (`CASCADE` / `RESTRICT` / `SET NULL`), and why money is never a `FLOAT`.

```sql
CREATE TABLE customers (
  id    BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE products (
  id    BIGSERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE orders (
  id          BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id           BIGSERIAL PRIMARY KEY,
  order_id     BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity     INT NOT NULL CHECK (quantity > 0),
  unit_price   NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  line_total   NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE INDEX order_items_order_id_idx ON order_items(order_id);
```

**Why this design.**
- `customer_id ... ON DELETE RESTRICT` refuses to delete a customer who has orders —
  financial records shouldn't silently disappear. `order_id ... ON DELETE CASCADE`
  deletes an order's line items along with the order itself, since a line item is
  meaningless without its parent order.
- `unit_price` is copied onto `order_items` instead of joining to `products.price` at
  read time — prices change, but a historical order must show what the customer actually
  paid. This is a deliberate denormalization, not a mistake.
- `NUMERIC(10,2)`, never `FLOAT`/`REAL`, for money — floating point can't represent
  `0.10` exactly, which silently corrupts totals after enough arithmetic.
- `line_total` is a `GENERATED ... STORED` column: it's always consistent with
  `quantity * unit_price` because Postgres computes it, not the application.

---

## Medium

### 3. Students & Courses

**Problem.** Students enroll in courses; a course has many students and a student takes
many courses. Also record the grade and enrollment date per student-per-course.

**Concept: many-to-many relationships need a junction (bridge) table.** You cannot put a
`course_id` on `students` (a student takes several courses) or a `student_id` on
`courses` (symmetric problem). The fix is a third table whose rows *are* the
relationship, with its own attributes.

```sql
CREATE TABLE students (
  id   BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE courses (
  id    BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  credits SMALLINT NOT NULL CHECK (credits > 0)
);

CREATE TABLE enrollments (
  student_id   BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id    BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  grade        CHAR(2) CHECK (grade IN ('A','B','C','D','F') OR grade IS NULL),
  enrolled_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, course_id)
);

CREATE INDEX enrollments_course_id_idx ON enrollments(course_id);
```

**Why this design.** The composite primary key `(student_id, course_id)` does two jobs
at once: it's the join path in both directions, *and* it enforces "a student can't enroll
in the same course twice" for free — no separate `UNIQUE` constraint needed. `grade`
lives on the junction row because a grade is a fact about *this specific enrollment*, not
about the student or the course in isolation. The extra index on `course_id` matters
because the primary key `(student_id, course_id)` only serves lookups that start with
`student_id` efficiently — "all students in course X" needs its own index.

---

### 4. Org Chart

**Problem.** Model employees where each employee has one manager (except the CEO, who has
none). Support finding an employee's entire management chain and everyone who reports up
through them (their whole subtree).

**Concept: self-referencing foreign keys and recursive CTEs.** A tree stored in a
relational table is usually an "adjacency list" — each row points at its parent — and
walking multiple levels needs `WITH RECURSIVE`, since a plain `JOIN` only walks one level.

```sql
CREATE TABLE employees (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  manager_id  BIGINT REFERENCES employees(id) ON DELETE SET NULL
);

CREATE INDEX employees_manager_id_idx ON employees(manager_id);
```

```sql
-- Everyone reporting up to (and including) employee 42, top-down
WITH RECURSIVE chain AS (
  SELECT id, name, manager_id, 0 AS depth
  FROM employees WHERE id = 42

  UNION ALL

  SELECT e.id, e.name, e.manager_id, chain.depth + 1
  FROM employees e
  JOIN chain ON e.manager_id = chain.id
)
SELECT * FROM chain ORDER BY depth;
```

**Why this design.** `manager_id` is nullable (the CEO has no manager) and self-references
`employees(id)`. `ON DELETE SET NULL` means firing a manager promotes their direct reports
to having no manager rather than cascading and deleting the whole subtree — cascading
here would be a data-loss bug. The recursive CTE has two parts: the **anchor** (the
starting row) and the **recursive term** (join back to the CTE itself), which Postgres
repeats until no new rows appear. Note: nothing here stops `manager_id` from creating a
cycle (A manages B manages A) — Postgres doesn't enforce tree-acyclicity for you; that
needs an application check or a trigger.

---

### 5. Comments on Posts & Photos

**Problem.** Comments can be left on either a blog post or a photo. Design the schema so
a comment always belongs to exactly one of those two things, and the database itself
guarantees that (not just application code).

**Concept: polymorphic associations — and why the naive version is an anti-pattern.** The
common Rails/ActiveRecord-style shortcut is a single `commentable_type TEXT` +
`commentable_id BIGINT` pair with no real foreign key (a `BIGINT` can't reference two
different tables at once). It "works" until a row points at a deleted photo, or a typo in
`commentable_type` silently orphans a comment — the database can't catch either.

```sql
CREATE TABLE posts (
  id    BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL
);

CREATE TABLE photos (
  id       BIGSERIAL PRIMARY KEY,
  url      TEXT NOT NULL
);

CREATE TABLE comments (
  id          BIGSERIAL PRIMARY KEY,
  body        TEXT NOT NULL,
  post_id     BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  photo_id    BIGINT REFERENCES photos(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT comments_exactly_one_parent CHECK (
    (post_id IS NOT NULL)::int + (photo_id IS NOT NULL)::int = 1
  )
);

CREATE INDEX comments_post_id_idx  ON comments(post_id)  WHERE post_id  IS NOT NULL;
CREATE INDEX comments_photo_id_idx ON comments(photo_id) WHERE photo_id IS NOT NULL;
```

**Why this design.** Two nullable, *real* foreign key columns replace the fake
`commentable_type`/`commentable_id` pair — each one has actual referential integrity, so
Postgres rejects a comment pointing at a photo that doesn't exist. The
`comments_exactly_one_parent` check constraint is the "exclusive arc" pattern: it forces
precisely one of the two columns to be non-null, so a comment can never be orphaned
(both null) or ambiguous (both set). Partial indexes (`WHERE post_id IS NOT NULL`) avoid
indexing the ~50% of rows in each column that are always null. This approach scales to a
third or fourth commentable type by adding one more nullable FK and widening the check —
at 5+ types, the usual alternative is table inheritance or a shared `commentables` parent
table that `posts`/`photos` both reference.

---

## Hard

### 6. Product Price History

**Problem.** A product's price changes over time. Given a product and a date, you must be
able to say what its price was *then*, and the schema must make it structurally
impossible for two prices to be active for the same product at the same time.

**Concept: temporal data with range types and exclusion constraints.** Storing "current
price" as a single column loses history. Storing a history table with `valid_from`/
`valid_to` columns is the standard fix, but plain columns can't stop overlapping ranges —
that needs Postgres's `tstzrange` type plus an `EXCLUDE` constraint.

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE products (
  id   BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE product_prices (
  id            BIGSERIAL PRIMARY KEY,
  product_id    BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  valid_during  TSTZRANGE NOT NULL,
  EXCLUDE USING gist (product_id WITH =, valid_during WITH &&)
);
```

```sql
-- Set today's price, closing out the previous one (in a transaction)
BEGIN;
UPDATE product_prices
  SET valid_during = tstzrange(lower(valid_during), now())
  WHERE product_id = 1 AND upper(valid_during) IS NULL;
INSERT INTO product_prices (product_id, price, valid_during)
  VALUES (1, 24.99, tstzrange(now(), NULL));
COMMIT;

-- What was the price on a given date?
SELECT price FROM product_prices
WHERE product_id = 1 AND valid_during @> '2026-03-01T00:00:00Z'::timestamptz;
```

**Why this design.** `EXCLUDE USING gist (product_id WITH =, valid_during WITH &&)` reads
as: "for rows with equal `product_id`, no two `valid_during` ranges may overlap (`&&`)."
It's the range-type generalization of a `UNIQUE` constraint, and it needs the
`btree_gist` extension so `=` can be combined with a GiST-indexed range operator in the
same constraint. This closes a real race condition: two concurrent transactions inserting
overlapping price windows for the same product would both succeed with a naive
`valid_from`/`valid_to` check in application code (check-then-insert isn't atomic), but
the database itself rejects the second one here. The open-ended current price uses
`tstzrange(now(), NULL)` — an unbounded upper end — and `@>` ("contains") answers
point-in-time lookups directly.

---

### 7. Multi-Tenant SaaS

**Problem.** A single database serves many customer organizations ("tenants"). A query
run on behalf of one tenant must never be able to see or modify another tenant's rows —
even if application code has a bug.

**Concept: tenant isolation enforced by the database via Row-Level Security (RLS), not
just a `WHERE tenant_id = ?` the app promises to always add.** Relying on every query to
remember the filter is fragile — one missed `WHERE` clause in one endpoint is a data
breach. RLS makes the database itself refuse to return or touch rows outside the current
tenant, regardless of what the query asks for.

```sql
CREATE TABLE tenants (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

CREATE TABLE projects (
  id          BIGSERIAL PRIMARY KEY,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tenant-scoped queries are always "all of tenant X's projects, newest first"
CREATE INDEX projects_tenant_id_created_at_idx ON projects(tenant_id, created_at DESC);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
```

```sql
-- The application sets this once per connection/request, from the authenticated session:
SET app.current_tenant = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

SELECT * FROM projects;               -- silently scoped to that tenant only
INSERT INTO projects (tenant_id, name) VALUES ('...other tenant...', 'x'); -- rejected by WITH CHECK
```

**Why this design.** `USING` filters what a `SELECT`/`UPDATE`/`DELETE` can see; `WITH
CHECK` additionally blocks an `INSERT`/`UPDATE` from writing a row for a *different*
tenant than the session is scoped to — without both clauses, RLS only guards reads. The
policy reads `current_setting('app.current_tenant', true)` (the `true` makes it return
null instead of erroring if unset, which you'd typically want to fail closed on at the
app layer). `tenant_id` is the **leading column** of the composite index
`(tenant_id, created_at)` — since every real query filters by tenant first, that column
must come first for the index to be usable at all; putting `created_at` first would make
the index useless for tenant-scoped scans. Note RLS policies don't apply to the table
owner or superusers by default — the application must connect as a non-superuser role for
this protection to actually take effect.

---

### 8. Soft Deletes & Audit Log

**Problem.** "Deleting" a user should hide them from normal queries but keep the row
(and their historical orders/comments) intact, and every change to a user's row should be
recorded for compliance review, without relying on the application to remember to log it.

**Concept: soft-delete via a nullable timestamp + partial unique indexes, and
trigger-driven auditing that can't be bypassed.** A hard `DELETE` loses data and breaks
foreign keys pointing at that row; deleting from application code only logs what the
application chooses to log. Both problems move into the database layer here.

```sql
CREATE TABLE users (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT NOT NULL,
  deleted_at  TIMESTAMPTZ
);

-- Email must be unique only among ACTIVE users — a deleted user's email can be reused
CREATE UNIQUE INDEX users_email_active_uidx ON users(email) WHERE deleted_at IS NULL;

CREATE TABLE users_audit (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL,
  action        TEXT NOT NULL, -- INSERT / UPDATE / DELETE
  row_data      JSONB NOT NULL,
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION log_users_change() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users_audit(user_id, action, row_data)
  VALUES (COALESCE(NEW.id, OLD.id), TG_OP, to_jsonb(COALESCE(NEW, OLD)));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_audit_trg
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION log_users_change();
```

```sql
-- "Deleting" a user is an UPDATE, not a DELETE
UPDATE users SET deleted_at = now() WHERE id = 7;
```

**Why this design.** A plain `UNIQUE` constraint on `email` would forever block signing
up again with an email that belonged to a "deleted" account. `CREATE UNIQUE INDEX ...
WHERE deleted_at IS NULL` is a **partial index** — it only enforces uniqueness among rows
matching the predicate, so a re-used email is fine once the old row is soft-deleted. The
audit trigger fires `AFTER` every `INSERT`/`UPDATE`/`DELETE` at the database level, so
there's no code path (a forgotten log call, a raw SQL migration, a different service
writing to the same table) that can silently skip it — `to_jsonb(...)` captures the full
row state at that moment. In a real system you'd also `REVOKE DELETE ON users FROM
app_role` so the application is structurally unable to hard-delete and bypass the
soft-delete/audit path entirely.

---

## Very Hard

### 9. Social Graph & Tag Hierarchy

**Problem.** Two structures in one schema: (a) users follow other users (a general graph,
not a tree), and (b) tags form a hierarchy (`Electronics` → `Phones` → `Smartphones`), and
you must efficiently answer "give me every post tagged with `Electronics` *or any of its
descendants*" without a runaway recursive query on every page load.

**Concept: adjacency lists work for graphs; closure tables work for fast tree queries.**
Question 4's `manager_id` adjacency-list pattern is fine for a strict tree walked
occasionally, but re-running `WITH RECURSIVE` on a deep tag tree on every product listing
page is expensive. A **closure table** precomputes every ancestor→descendant pair once, so
descendant lookups become a single indexed join.

```sql
-- (a) Follows: a self-referential many-to-many graph, not a tree
CREATE TABLE users (
  id   BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE follows (
  follower_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);
CREATE INDEX follows_followee_id_idx ON follows(followee_id); -- "who follows me"

-- (b) Tags: a hierarchy, modeled as a closure table
CREATE TABLE tags (
  id   BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE tag_closure (
  ancestor_id    BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  descendant_id  BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  depth          INT NOT NULL CHECK (depth >= 0),
  PRIMARY KEY (ancestor_id, descendant_id)
);
CREATE INDEX tag_closure_descendant_id_idx ON tag_closure(descendant_id);
```

```sql
-- Creating a new tag: it's always its own ancestor at depth 0
INSERT INTO tags (name) VALUES ('Smartphones') RETURNING id; -- say id = 5
INSERT INTO tag_closure (ancestor_id, descendant_id, depth) VALUES (5, 5, 0);

-- Attaching 'Smartphones' (id 5) under 'Phones' (id 3):
-- every ancestor of 3 (including 3 itself) becomes an ancestor of every
-- descendant of 5 (including 5 itself), at combined depth
INSERT INTO tag_closure (ancestor_id, descendant_id, depth)
SELECT p.ancestor_id, c.descendant_id, p.depth + c.depth + 1
FROM tag_closure p, tag_closure c
WHERE p.descendant_id = 3 AND c.ancestor_id = 5;

-- All posts tagged with Electronics (id 1) or any descendant — one indexed join, no recursion
SELECT DISTINCT post_id
FROM post_tags pt
JOIN tag_closure tc ON tc.descendant_id = pt.tag_id
WHERE tc.ancestor_id = 1;
```

**Why this design.** `follows` is deliberately *not* forced into a tree — a graph where
A follows B and B follows A is normal, so an adjacency list with a composite PK (same
pattern as Question 3's junction table) is the right fit, with `CHECK (follower_id <>
followee_id)` blocking self-follows. `tag_closure` trades write complexity for read
speed: inserting one new tag edge requires the cross-product insert shown above (touching
`O(ancestors × descendants)` rows), but from then on, "all descendants of X" is `WHERE
ancestor_id = X` — no recursion, fully indexable, and just as fast for a 2-level tree as
a 20-level one. This is the standard trade for read-heavy hierarchies (category trees,
permission trees); for a write-heavy or arbitrarily-deep tree where recomputing closure
rows is too costly, `WITH RECURSIVE` (Question 4) or the `ltree` extension (materialized
paths like `'1.3.5'`, queryable with `<@`/`@>` operators) are the usual alternatives.

---

### 10. Double-Entry Ledger

**Problem.** Model a financial ledger where every transaction affects two or more
accounts and must balance to zero (double-entry bookkeeping: debits == credits). Entries
must be immutable once written — a mistake is corrected with a new offsetting entry,
never an `UPDATE`. The table must also stay fast to query as it grows to hundreds of
millions of rows.

**Concept: enforcing cross-row invariants with deferred constraint triggers, immutability
via privileges, and range partitioning for scale.** No single-row `CHECK` constraint can
express "these several rows, taken together, sum to zero" — that requires a trigger that
runs after all the rows in one transaction are in, which is what `DEFERRABLE INITIALLY
DEFERRED` is for.

```sql
CREATE TABLE accounts (
  id   BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('asset','liability','equity','revenue','expense'))
);

-- Partitioned by month: old partitions can be archived/detached cheaply as the ledger grows
CREATE TABLE ledger_entries (
  id              BIGSERIAL,
  transaction_id  UUID NOT NULL,
  account_id      BIGINT NOT NULL REFERENCES accounts(id),
  amount          NUMERIC(14,2) NOT NULL, -- positive = debit, negative = credit
  entered_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (entered_at, id)
) PARTITION BY RANGE (entered_at);

CREATE TABLE ledger_entries_2026_01 PARTITION OF ledger_entries
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE ledger_entries_2026_02 PARTITION OF ledger_entries
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE INDEX ledger_entries_transaction_id_idx ON ledger_entries(transaction_id);

-- A transaction is only valid if all its entries sum to zero
CREATE OR REPLACE FUNCTION check_transaction_balances() RETURNS TRIGGER AS $$
DECLARE
  total NUMERIC;
BEGIN
  SELECT SUM(amount) INTO total FROM ledger_entries WHERE transaction_id = NEW.transaction_id;
  IF total <> 0 THEN
    RAISE EXCEPTION 'transaction % does not balance (sum = %)', NEW.transaction_id, total;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER ledger_balances_trg
AFTER INSERT ON ledger_entries
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION check_transaction_balances();

-- Immutability: the application role can only append, never rewrite history
REVOKE UPDATE, DELETE ON ledger_entries FROM app_role;
GRANT INSERT, SELECT ON ledger_entries TO app_role;
```

```sql
-- One balanced transaction: $100 moves from checking (asset) to rent expense
BEGIN;
INSERT INTO ledger_entries (transaction_id, account_id, amount) VALUES
  ('11111111-1111-1111-1111-111111111111', 1, -100.00), -- credit checking
  ('11111111-1111-1111-1111-111111111111', 2,  100.00); -- debit rent expense
COMMIT; -- the deferred trigger checks the balance here, not after each row
```

**Why this design.** `CREATE CONSTRAINT TRIGGER ... DEFERRABLE INITIALLY DEFERRED` delays
the check from "after each row" to "right before `COMMIT`" — checking after the *first*
`INSERT` above would see a transaction that's `-100.00` out of balance and reject a
perfectly valid two-line transaction. `REVOKE UPDATE, DELETE` makes correction-by-editing
structurally impossible for the application; fixing a mistake means inserting a new
transaction that reverses the old one, which preserves a true history — exactly what
auditors and financial reconciliation require. `PARTITION BY RANGE (entered_at)` keeps
each month's data (and its indexes) small enough to query and vacuum efficiently, and old
partitions can be moved to cheaper storage or dropped per a retention policy without
touching the live partition. The primary key `(entered_at, id)` (rather than just `id`)
is required because a partitioned table's primary/unique keys must include the
partitioning column.

---

## Study Order & Concept Map

| Concept | Question |
| --- | --- |
| Normalization, PK/FK | 1 |
| Referential actions (`CASCADE`/`RESTRICT`/`SET NULL`), correct money types | 2 |
| Many-to-many junction tables, composite keys | 3 |
| Self-referencing FKs, recursive CTEs | 4, 9 (graph variant) |
| Polymorphic associations / exclusive-arc check constraints | 5 |
| Range types & `EXCLUDE` constraints (temporal data) | 6 |
| Row-Level Security, tenant isolation, composite index column order | 7 |
| Partial indexes, audit triggers | 8 |
| Closure tables (precomputed hierarchy) | 9 |
| Deferred constraint triggers, privilege-based immutability, partitioning | 10 |

**Recommended progression:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10. Each question
assumes the constraints/index vocabulary from the ones before it (`CHECK`, `UNIQUE`,
`REFERENCES` before Question 5's exclusive-arc `CHECK`; `EXCLUDE` before Question 10's
deferred trigger).
