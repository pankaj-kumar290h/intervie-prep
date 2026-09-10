# Explaining Technical Things Out Loud

The skill: take something you understand and make it clear to a listener, in real
time, in structured English. Practiced daily for 6 weeks, this transforms technical
interviews.

---

## Structure for explaining a concept

1. **One-line definition / analogy.** "A cache is basically a small, fast storage
   that keeps copies of data you use a lot, so you don't have to fetch it the slow
   way every time."
2. **Why it exists / the problem it solves.** "The problem is that going to the
   database every request is slow and expensive."
3. **How it works, at a high level.** "So the first time you ask for something, it
   goes to the database and then saves a copy in the cache. Next time, it checks the
   cache first."
4. **A trade-off or gotcha.** "The tricky part is keeping the cache up to date – if
   the real data changes, the cache can be stale."
5. **Wrap.** "So in short, you trade a bit of complexity and possible staleness for
   a big speed-up."

Practice: pick a concept from your notes each day, run it through these 5 steps out
loud, recorded, 2–3 minutes.

---

## Structure for walking through a coding problem

- **Restate + clarify:** "So, to make sure I understand – we're given ___, and we
  need to return ___. Can I assume ___?"
- **First thoughts:** "My first instinct is a brute-force approach where I ___. That
  would be O(n²), which is probably too slow, but let me use it as a starting point."
- **Improve:** "I think I can do better. If I use a hash map to ___, I can bring it
  down to O(n)."
- **Narrate while coding:** "Okay so I'll loop through the array... for each element
  I'll check if ___... if it's there, I return ___, otherwise I add it to the map."
- **Test out loud:** "Let me walk through an example. If the input is [2, 7, 11] and
  target 9... first element 2, I look for 7, not there, add 2... next 7, I look for
  2, it's there, return the indices. Good."
- **Complexity:** "Time is O(n) because ___. Space is O(n) for the map."
- **Edge cases:** "I should also handle the empty array, and what if there's no
  valid pair – I'd return ___."

---

## Structure for a system design answer

- **Clarify scope & scale:** "Before I design, let me check a few things. Roughly
  how many users? Read-heavy or write-heavy? Do we need ___?"
- **State requirements back:** "Okay, so the key functional requirements are ___,
  and non-functional: ___ (low latency, high availability)."
- **High-level first:** "At a high level, we'll have a client, a load balancer, a
  set of app servers, a database, and a cache. Let me draw that out."
- **Go component by component:** "Starting with the API layer... / For the data
  model... / For storage, I'd choose ___ because ___."
- **Call out trade-offs explicitly:** "There's a trade-off here between consistency
  and availability. Given the use case, I'd lean towards ___ because ___."
- **Address bottlenecks:** "The bottleneck is likely to be ___. To handle that, I'd
  ___."
- **Summarize:** "So to recap the design: ___."

---

## Signposting phrases (use these constantly)

**Opening a section:** "Let me start with... / First, I'll talk about... / The way
I'd approach this is..."
**Moving on:** "Moving on to... / The next piece is... / Now, for the ___ part..."
**Adding detail:** "To go a bit deeper... / One thing worth mentioning... /
Specifically, ..."
**Trade-offs:** "The trade-off here is... / The downside of this is... / On the
plus side... / The reason I'd choose X over Y is..."
**Reasoning:** "The reason for that is... / This matters because... / Otherwise,
we'd run into..."
**Uncertainty (honest and fine):** "I'm not 100% sure about the exact numbers, but
the idea is... / I'd want to verify this, but I believe... / I haven't used this in
production, but my understanding is..."
**Checking in:** "Does that make sense? / Should I go deeper here, or move on? / Is
this the level of detail you're looking for?"
**Wrapping:** "So to sum up... / The key idea is... / In short..."

---

## Analogy phrases (great for explaining to non-experts)

- "Think of it like ___."
- "It's a bit like ___, where ___."
- "Imagine you have ___. Now, ___."
- "You can picture it as ___."
- "It's similar to how ___ works in real life."

---

## Common language issues when explaining tech

- **Overusing passive + nominalization** (sounds stiff and unclear): "The
  optimization of the query was performed" → "I optimized the query" / "We made the
  query faster".
- **Missing articles with tech nouns:** "I added cache" → "I added **a** cache".
  "It goes to database" → "...to **the** database".
- **Tense drift when telling a story:** pick past ("I built...") and stay there.
- **"Actually" as every second word** – trim it.
- **Reading numbers:** "10^6" = "ten to the six" / "a million"; "O(n log n)" = "oh
  n log n"; "p99" = "p ninety-nine"; "5xx errors" = "five-hundreds" / "five x x
  errors"; "k8s" = "kates" / "kubernetes"; "i18n" = "internationalization".

---

## Daily drill (Weeks 6–12)

Pick a topic from your repo notes ([../../interview-prep/](../../interview-prep/),
[../../system-design/](../../system-design/), [../../dsa/](../../dsa/),
[../../design-pattren/](../../design-pattren/)). Explain it out loud in 2–3 minutes,
recorded, using the structure + signposting above. Listen back: was it *structured*?
Did you signpost? Where did the language break down? Redo the weak part.
